/**
 * 水印引擎 v2.1 — 统一斜向覆盖 + 狐狸耳角标
 *
 * 策略：
 *   所有 >= 16px 的图片 → tile 斜向文字覆盖全图（缩放匹配尺寸）
 *   >= 64px 额外 + 狐狸耳（右下角）
 *   >= 600px 额外 + 品牌角标（右下角）
 *
 * 斜向 tile 保证整个图片被覆盖，低透明度不影响阅读但阻止盗图。
 * 狐狸耳提供品牌辨识度。
 */

import sharp from "sharp";
import {
  readdirSync,
  existsSync,
  statSync,
  renameSync,
  unlinkSync,
  openSync,
  readSync,
  closeSync,
} from "fs";
import { join, extname, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, ".vitepress", "dist");
const WM_DIR = join(ROOT, "scripts", "assets");

// =============== 水印层级 ===============

const TIERS = [
  // 小图用狐狸拼贴全图覆盖（16-127px）
  { key: "foxtile", file: "fox-tile.png",       minEdge: 16, maxEdge: 127, isTile: true },
  // 中大图用斜向文字拼贴全图覆盖
  { key: "tile",   file: "tile-watermark.png",  minEdge: 128,            isTile: true },
  // 狐狸耳角标
  { key: "fox",    file: "fox-medium.png",      minEdge: 64,  isTile: false, padding: 4,  maxScale: 0.12 },
  // 品牌文字角标（大图）
  { key: "corner", file: "text-corner.png",     minEdge: 600, isTile: false, padding: 10, maxScale: 0.10 },
];

// =============== 快速尺寸检测 ===============

function getImageSize(filePath) {
  const ext = extname(filePath).toLowerCase();
  const buf = Buffer.alloc(80);
  let fd;
  try {
    fd = openSync(filePath, "r");
    readSync(fd, buf, 0, 80, 0);
  } catch { return null; }
  finally { if (fd !== undefined) closeSync(fd); }

  if (ext === ".png" && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (ext === ".jpg" || ext === ".jpeg") {
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let off = 2;
      while (off < 76) {
        if (buf[off] !== 0xff) break;
        const m = buf[off + 1];
        if (m === 0xc0 || m === 0xc1 || m === 0xc2)
          return { width: buf.readUInt16BE(off + 7), height: buf.readUInt16BE(off + 5) };
        off += 2 + buf.readUInt16BE(off + 2);
      }
    }
  }
  if (ext === ".webp") {
    if (buf.toString("ascii", 8, 12) === "WEBP") {
      if (buf[15] === 0x2f) {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      const w = buf.readUInt16LE(26) & 0x3fff;
      const h = buf.readUInt16LE(28) & 0x3fff;
      if (w > 0 && h > 0) return { width: w, height: h };
    }
  }
  return null;
}

// =============== 水印选择 ===============

function selectLayers(w, h) {
  const minDim = Math.min(w, h);
  if (minDim < 16) return null;
  return TIERS.filter((t) => minDim >= t.minEdge && (!t.maxEdge || minDim <= t.maxEdge));
}

// =============== 缓存 ===============

const wmCache = new Map();

async function prepLayer(tier, imgW, imgH) {
  const key = `${tier.key}@${imgW}x${imgH}`;
  if (wmCache.has(key)) return wmCache.get(key);

  const wmPath = join(WM_DIR, tier.file);
  if (!existsSync(wmPath)) return null;

  const meta = await sharp(wmPath).metadata();
  let buf, w, h;

  if (tier.isTile) {
    // Tile: 精确缩放匹配图片尺寸，确保全图覆盖
    w = imgW;
    h = imgH;
    buf = await sharp(wmPath).resize(imgW, imgH, { fit: "fill" }).png({ compressionLevel: 9 }).toBuffer();
  } else {
    const maxSize = Math.round(imgW * tier.maxScale);
    const scale = Math.min(1, maxSize / meta.width);
    w = Math.max(Math.round(meta.width * scale), 8);
    h = Math.max(Math.round(meta.height * scale), 8);
    buf = await sharp(wmPath).resize(w, h, { fit: "contain", withoutEnlargement: true }).png().toBuffer();
  }

  const result = { buf, w, h, isTile: tier.isTile, padding: tier.padding || 0 };
  wmCache.set(key, result);
  return result;
}

// =============== 处理单图 ===============

async function processImage(filePath) {
  let size = getImageSize(filePath);
  if (!size) {
    try {
      const meta = await sharp(filePath).metadata();
      if (meta.width && meta.height) size = { width: meta.width, height: meta.height };
    } catch { return false; }
  }
  if (!size) return false;

  const layers = selectLayers(size.width, size.height);
  if (!layers) return false;

  const composites = [];
  for (const tier of layers) {
    const layer = await prepLayer(tier, size.width, size.height);
    if (!layer) continue;

    if (layer.isTile) {
      composites.push({ input: layer.buf, top: 0, left: 0 });
    } else {
      composites.push({
        input: layer.buf,
        top: size.height - layer.h - layer.padding,
        left: size.width - layer.w - layer.padding,
      });
    }
  }

  if (composites.length === 0) return false;

  const tmpPath = filePath + ".wmtmp";
  const ext = extname(filePath).toLowerCase();
  try {
    let pipeline = sharp(filePath).composite(composites);
    if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 92 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 90 });
    }
    await pipeline.toFile(tmpPath);
    renameSync(tmpPath, filePath);
    return true;
  } catch (e) {
    try { unlinkSync(tmpPath); } catch {}
    throw e;
  }
}

// =============== 导出（供 external-watermark.mjs 复用） ===============

export { processImage, getImageSize, selectLayers, prepLayer, TIERS, wmCache };

// =============== 入口 ===============

async function main() {
  console.log("\nF 星玖水印引擎 v2.1 — 斜向覆盖 + 狐狸耳\n");

  for (const t of TIERS) {
    const p = join(WM_DIR, t.file);
    if (!existsSync(p)) {
      console.error("Missing watermark:", t.file);
      process.exit(1);
    }
    const st = statSync(p);
    const mode = t.isTile ? "FULL" : "CORNER";
    console.log(`  [${mode}] ${t.key.padEnd(8)} ${t.file.padEnd(22)} ${(st.size / 1024).toFixed(1)} KB`);
  }

  if (!existsSync(DIST)) {
    console.error("No dist directory:", DIST);
    process.exit(1);
  }

  const images = [];
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const fp = join(dir, e.name);
      if (e.isDirectory()) {
        // 跳过已水印的外部图片目录，避免双重水印
        if (e.name === "external-wm") continue;
        walk(fp);
      }
      else if (e.isFile()) {
        const ext = extname(e.name).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) images.push(fp);
      }
    }
  })(DIST);

  console.log(`\n  Scanned ${images.length} images\n`);

  let processed = 0, skipped = 0, failed = 0;
  for (let i = 0; i < images.length; i++) {
    if (i % 50 === 0 || i === images.length - 1) {
      const pct = ((i + 1) / images.length * 100).toFixed(1);
      process.stdout.write(`\r  ${i + 1}/${images.length} (${pct}%) | OK ${processed} | SKIP ${skipped} | FAIL ${failed}`);
    }
    try {
      if (await processImage(images[i])) processed++;
      else skipped++;
    } catch (e) {
      failed++;
    }
  }

  console.log(`\n\nDone: ${processed} ok, ${skipped} skip, ${failed} fail / ${images.length} total`);
  wmCache.clear();
}

// 仅在直接运行时执行 main，被 import 时不自动执行
const __isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (__isMain) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
