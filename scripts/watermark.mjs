/**
 * 水印引擎 v3.0 — 尺寸自适应动态水印
 *
 * 策略（按最短边分层，SVG 动态生成，避免缩放失真）：
 *   < 16px        → 跳过（太小无法加水印）
 *   16-48px       → 右下角 1-2px 品牌色像素标记（不破坏像素艺术）
 *   49-127px      → 低透明度对角线 + 右下角小角标
 *   128-599px     → 斜向文字覆盖（字号按尺寸自适应）+ 狐狸耳角标
 *   >= 600px      → 斜向文字覆盖 + 品牌文字角标
 *
 * v3 改进：
 *   - 不再用固定 PNG 缩放，改用 SVG 按目标尺寸精确生成
 *   - 超小图（MC 贴图）不再全图覆盖，保护像素艺术可读性
 *   - 文字字号随图片尺寸自适应，大图文字更清晰
 */

import sharp from "sharp";
import {
  readdirSync,
  existsSync,
  renameSync,
  unlinkSync,
  openSync,
  readSync,
  closeSync,
} from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, ".vitepress", "dist");

// 品牌色
const BRAND = "#E05252";

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

// =============== SVG 水印动态生成 ===============

/**
 * 生成斜向文字覆盖水印 SVG（按图片尺寸自适应字号和间距）
 */
function buildTileSvg(w, h) {
  const minDim = Math.min(w, h);
  // 字号自适应：小图用较小字，大图用较大字，但有上下限
  const fontSize = Math.max(12, Math.min(48, Math.round(minDim / 8)));
  const text = "锐界幻境 MiragEdge";
  // 间距随字号缩放
  const stepX = fontSize * 8;
  const stepY = fontSize * 3;

  // 计算旋转后覆盖整个图片所需的范围（扩大 50%）
  const expandW = w * 1.5;
  const expandH = h * 1.5;
  const offsetX = (expandW - w) / 2;
  const offsetY = (expandH - h) / 2;

  let texts = "";
  for (let y = -offsetY; y < expandH; y += stepY) {
    for (let x = -offsetX; x < expandW; x += stepX) {
      texts += `<text x="${x}" y="${y}" font-family="'Noto Sans SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" opacity="0.06" text-anchor="middle" dominant-baseline="central">${text}</text>`;
    }
  }

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-35 ${w/2} ${h/2}) translate(${-offsetX} ${-offsetY})">
      ${texts}
    </g>
  </svg>`;
}

/**
 * 生成狐狸耳角标 SVG（右下角，按图片尺寸缩放）
 */
function buildFoxCornerSvg(w, h) {
  const minDim = Math.min(w, h);
  // 角标尺寸：图片最短边的 15%，但限制在 16-80px
  const size = Math.max(16, Math.min(80, Math.round(minDim * 0.15)));
  const padding = Math.max(2, Math.round(minDim * 0.02));
  const x = w - size - padding;
  const y = h - size - padding;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${x} ${y})">
      <polygon points="${size*0.1},${size*0.9} ${size*0.5},${size*0.05} ${size*0.6},${size*0.45}" fill="${BRAND}" opacity="0.18"/>
      <polygon points="${size*0.5},${size*0.05} ${size*0.9},${size*0.9} ${size*0.4},${size*0.45}" fill="${BRAND}" opacity="0.12"/>
      <ellipse cx="${size*0.5}" cy="${size*0.7}" rx="${size*0.3}" ry="${size*0.2}" fill="${BRAND}" opacity="0.06"/>
    </g>
  </svg>`;
}

/**
 * 生成品牌文字角标 SVG（右下角，大图用）
 */
function buildTextCornerSvg(w, h) {
  const minDim = Math.min(w, h);
  const boxW = Math.max(120, Math.min(300, Math.round(minDim * 0.3)));
  const boxH = Math.round(boxW * 0.3);
  const padding = Math.max(8, Math.round(minDim * 0.015));
  const x = w - boxW - padding;
  const y = h - boxH - padding;
  const fontSize1 = Math.round(boxH * 0.45);
  const fontSize2 = Math.round(boxH * 0.22);

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${BRAND}" stop-opacity="0"/>
        <stop offset="30%" stop-color="${BRAND}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${BRAND}" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${Math.round(boxH*0.15)}" fill="url(#bg)"/>
    <text x="${x + boxW/2}" y="${y + boxH*0.45}" text-anchor="middle" font-family="'Noto Sans SC','Microsoft YaHei',sans-serif" font-size="${fontSize1}" font-weight="700" fill="#ffffff" opacity="0.20">锐界幻境</text>
    <text x="${x + boxW/2}" y="${y + boxH*0.8}" text-anchor="middle" font-family="'Noto Sans SC','Microsoft YaHei',sans-serif" font-size="${fontSize2}" font-weight="400" fill="#ffffff" opacity="0.10">MiragEdge</text>
  </svg>`;
}

/**
 * 生成全图品牌色偏移 SVG（整图叠加一层品牌色）
 * 作用：让盗图者去除后颜色失真，无法完美还原
 * 透明度按尺寸调整：小图偏色更强（贴图像素少，偏色影响大）
 */
function buildTintOverlaySvg(w, h) {
  const minDim = Math.min(w, h);
  // 小图偏色更强：16px 用 10%，48px 用 7%，128px+ 用 4%
  const opacity = minDim < 49 ? 0.10 : minDim < 128 ? 0.07 : 0.04;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BRAND}" opacity="${opacity}"/>
  </svg>`;
}

/**
 * 生成中心狐狸耳水印 SVG（覆盖图像核心区域）
 * 关键防盗措施：覆盖中心，无法通过裁剪去除，PS 修复需重建像素
 * 尺寸越小，狐狸耳占比越大（16px 占 55%，128px 占 30%）
 */
function buildCenterFoxSvg(w, h) {
  const minDim = Math.min(w, h);
  // 狐狸耳占图片比例：小图占更大比例
  const ratio = minDim < 49 ? 0.55 : minDim < 128 ? 0.45 : 0.30;
  const size = Math.round(minDim * ratio);
  const cx = w / 2;
  const cy = h / 2;
  // 透明度：小图更透明避免完全遮挡，但足够留下印记
  const op1 = minDim < 49 ? 0.28 : 0.20;
  const op2 = minDim < 49 ? 0.20 : 0.14;
  const op3 = minDim < 49 ? 0.12 : 0.08;

  // 以中心为原点绘制狐狸耳
  const x0 = cx - size / 2;
  const y0 = cy - size / 2;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${x0} ${y0})">
      <!-- 左耳 -->
      <polygon points="${size*0.1},${size*0.9} ${size*0.5},${size*0.05} ${size*0.6},${size*0.45}" fill="${BRAND}" opacity="${op1}"/>
      <!-- 右耳 -->
      <polygon points="${size*0.5},${size*0.05} ${size*0.9},${size*0.9} ${size*0.4},${size*0.45}" fill="${BRAND}" opacity="${op2}"/>
      <!-- 面部轮廓 -->
      <ellipse cx="${size*0.5}" cy="${size*0.7}" rx="${size*0.3}" ry="${size*0.2}" fill="${BRAND}" opacity="${op3}"/>
    </g>
  </svg>`;
}

/**
 * 生成小图对角线水印 SVG（低透明度，不破坏可读性）
 */
function buildDiagonalLinesSvg(w, h) {
  const spacing = Math.max(8, Math.round(Math.min(w, h) / 6));
  let lines = "";
  for (let i = -h; i < w + h; i += spacing) {
    lines += `<line x1="${i}" y1="0" x2="${i + h}" y2="${h}" stroke="${BRAND}" stroke-width="1" opacity="0.04"/>`;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`;
}

// =============== 水印层级选择 ===============

function buildWatermarkLayers(w, h) {
  const minDim = Math.min(w, h);
  if (minDim < 16) return [];

  const layers = [];

  if (minDim < 49) {
    // 超小图（16-48px，MC 贴图）：全图偏色 + 中心狐狸耳
    // 中心覆盖是核心防盗，PS 抠图无法完美去除
    layers.push({ svg: buildTintOverlaySvg(w, h) });
    layers.push({ svg: buildCenterFoxSvg(w, h) });
  } else if (minDim < 128) {
    // 小图（49-127px）：偏色 + 对角线 + 中心狐狸耳 + 角标
    layers.push({ svg: buildTintOverlaySvg(w, h) });
    layers.push({ svg: buildDiagonalLinesSvg(w, h) });
    layers.push({ svg: buildCenterFoxSvg(w, h) });
    layers.push({ svg: buildFoxCornerSvg(w, h) });
  } else if (minDim < 600) {
    // 中图（128-599px）：偏色 + 斜向文字 + 中心狐狸耳 + 角标
    layers.push({ svg: buildTintOverlaySvg(w, h) });
    layers.push({ svg: buildTileSvg(w, h) });
    layers.push({ svg: buildCenterFoxSvg(w, h) });
    layers.push({ svg: buildFoxCornerSvg(w, h) });
  } else {
    // 大图（600px+）：斜向文字 + 中心狐狸耳 + 品牌角标
    layers.push({ svg: buildTileSvg(w, h) });
    layers.push({ svg: buildCenterFoxSvg(w, h) });
    layers.push({ svg: buildTextCornerSvg(w, h) });
  }

  return layers;
}

// =============== 缓存 ===============

const svgCache = new Map();

async function renderLayer(layer, w, h) {
  const key = `${layer.svg.length}@${w}x${h}`;
  if (svgCache.has(key)) return svgCache.get(key);
  const buf = await sharp(Buffer.from(layer.svg)).png({ compressionLevel: 9 }).toBuffer();
  svgCache.set(key, buf);
  return buf;
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

  const layers = buildWatermarkLayers(size.width, size.height);
  if (layers.length === 0) return false;

  const composites = [];
  for (const layer of layers) {
    const buf = await renderLayer(layer, size.width, size.height);
    composites.push({ input: buf, top: 0, left: 0 });
  }

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

export { processImage, getImageSize, buildWatermarkLayers };

// =============== 入口 ===============

async function main() {
  console.log("\nF 星玖水印引擎 v3.0 — 尺寸自适应动态水印\n");

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

  console.log(`  Scanned ${images.length} images\n`);

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
  svgCache.clear();
}

// 仅在直接运行时执行 main，被 import 时不自动执行
const __isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (__isMain) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
