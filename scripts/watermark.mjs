/**
 * 水印构建脚本 — 在 `pnpm build` 后运行，自动给输出图片添加水印
 *
 * 全自动工作流程：
 * 1. 遍历 .vitepress/dist/ 中所有图片
 * 2. 按尺寸分级应用不同水印
 * 3. 跳过 tiny 图片（<32px）
 *
 * 三级策略：
 *   < 32px    → 跳过（16×16 贴图等）
 *   32-128px  → dot-small 星点标记
 *   128-400px → arc-medium 星弧
 *   > 400px   → arc-large 星弧 + text-watermark 品牌文字
 *
 * 依赖: sharp (devDependency)
 * 水印资源: public/watermark/*.png (需先通过 generate-watermark.mjs 生成)
 */

import sharp from 'sharp';
import { readdirSync, statSync, existsSync, openSync, readSync, closeSync, renameSync, unlinkSync } from 'fs';
import { join, extname, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, '.vitepress', 'dist');
const WM_DIR = join(ROOT, 'scripts', 'assets');

// =============== 水印配置 ===============

const WATERMARKS = [
  { key: 'dot',  file: 'dot-small.png',    padding: 4,  minEdge: 64,  minEdgeFor: 128 },
  { key: 'arc',  file: 'arc-medium.png',   padding: 6,  minEdge: 128, minEdgeFor: 400 },
  { key: 'big',  file: 'arc-large.png',    padding: 10, minEdge: 400, minEdgeFor: 600 },
  { key: 'text', file: 'text-watermark.png', padding: 12, minEdge: 600, minEdgeFor: Infinity },
];

function loadWatermarkPath(file) {
  const p = join(WM_DIR, file);
  if (!existsSync(p)) {
    console.error(`  ⚠️  水印文件缺失: ${file}（运行 node scripts/generate-watermark.mjs）`);
    return null;
  }
  return p;
}

// =============== 快速尺寸检测 ===============

function getImageSize(filePath) {
  const ext = extname(filePath).toLowerCase();
  const buf = Buffer.alloc(80);
  let fd;
  try {
    fd = openSync(filePath, 'r');
    readSync(fd, buf, 0, 80, 0);
  } catch { return null; }
  finally { if (fd !== undefined) closeSync(fd); }

  if (ext === '.png' && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    if (buf[0] === 0xFF && buf[1] === 0xD8) {
      let offset = 2;
      while (offset < 76) {
        if (buf[offset] !== 0xFF) break;
        const marker = buf[offset + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          return {
            width: buf.readUInt16BE(offset + 7),
            height: buf.readUInt16BE(offset + 5),
          };
        }
        // Skip marker segment
        const segLen = buf.readUInt16BE(offset + 2);
        offset += 2 + segLen;
        if (offset >= 76) break;
      }
    }
  }
  if (ext === '.webp') {
    if (buf.toString('ascii', 8, 12) === 'WEBP') {
      if ((buf[15] === 0x2F)) {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3FFF) + 1, height: ((bits >> 14) & 0x3FFF) + 1 };
      }
      const w = buf.readUInt16LE(26) & 0x3FFF;
      const h = buf.readUInt16LE(28) & 0x3FFF;
      if (w > 0 && h > 0) return { width: w, height: h };
    }
  }
  return null;
}

// =============== 水印选择 ===============

function selectWatermarks(w, h) {
  const minDim = Math.min(w, h);
  if (minDim < 32) return null;
  const result = [];
  for (const wm of WATERMARKS) {
    if (minDim >= wm.minEdge) result.push(wm);
  }
  return result.length > 0 ? result : null;
}

// =============== 水印缓存 ===============

const wmCache = new Map();

async function getWatermarkOverlay(wmConfig, imageWidth, imageHeight) {
  const cacheKey = `${wmConfig.key}@${imageWidth}x${imageHeight}`;
  if (wmCache.has(cacheKey)) return wmCache.get(cacheKey);

  const wmPath = loadWatermarkPath(wmConfig.file);
  if (!wmPath) return null;

  const meta = await sharp(wmPath).metadata();
  // Scale watermark to at most 10% of image width, or 100% if already smaller
  const maxW = Math.round(imageWidth * 0.12);
  const scale = Math.min(1, maxW / meta.width);
  const finalW = Math.round(meta.width * scale);
  const finalH = Math.round(meta.height * scale);

  const buf = await sharp(wmPath)
    .resize(finalW, finalH, { fit: 'contain', withoutEnlargement: true })
    .png()
    .toBuffer();

  const result = { buf, w: finalW, h: finalH, padding: wmConfig.padding };
  wmCache.set(cacheKey, result);
  return result;
}

// =============== 核心处理 ===============

async function processImage(filePath) {
  // 尺寸检测
  let size = getImageSize(filePath);
  if (!size) {
    try {
      const meta = await sharp(filePath).metadata();
      if (meta.width && meta.height) size = { width: meta.width, height: meta.height };
    } catch { return false; }
  }
  if (!size) return false;

  // 选择水印
  const choices = selectWatermarks(size.width, size.height);
  if (!choices) return false;

  // 构建合成层
  const composites = [];
  for (const wm of choices) {
    const layer = await getWatermarkOverlay(wm, size.width, size.height);
    if (!layer) continue;
    composites.push({
      input: layer.buf,
      top: size.height - layer.h - layer.padding,
      left: size.width - layer.w - layer.padding,
    });
  }
  if (composites.length === 0) return false;

  // 合成水印（直接覆盖原文件）
  const tmpPath = filePath + '.wmtmp';
  try {
    await sharp(filePath)
      .composite(composites)
      .toFile(tmpPath);
    renameSync(tmpPath, filePath);
    return true;
  } catch (e) {
    try { unlinkSync(tmpPath); } catch {}
    throw e;
  }
}

// =============== 主入口 ===============

async function main() {
  console.log('\n🦊 星玖水印引擎 — 为文档站图片添加轻量版权标记\n');

  // 验证水印资源
  for (const wm of WATERMARKS) {
    if (!loadWatermarkPath(wm.file)) {
      console.error('❌ 水印资源缺失，请先运行: node scripts/generate-watermark.mjs');
      process.exit(1);
    }
    const stat = statSync(join(WM_DIR, wm.file));
    console.log(`  📦 水印: ${wm.key.padEnd(5)} ← ${wm.file} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  if (!existsSync(DIST)) {
    console.error(`❌ 构建输出目录不存在: ${DIST}`);
    console.error('   请先运行 pnpm build');
    process.exit(1);
  }

  // 扫描图片
  const images = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }
  walk(DIST);

  console.log(`\n  🔍 扫描到 ${images.length} 张图片`);

  // 首批快速采样 - 展示各级图片数量
  let tiny = 0, small = 0, medium = 0, large = 0, xl = 0;
  for (const fp of images) {
    const sz = getImageSize(fp);
    if (!sz) { medium++; continue; }
    const m = Math.min(sz.width, sz.height);
    if (m < 32) tiny++;
    else if (m < 128) small++;
    else if (m < 400) medium++;
    else if (m < 600) large++;
    else xl++;
  }
  console.log(`  📊 分布: 🟤Tiny(<32px)=${tiny} 🟢Small=${small} 🔵Medium=${medium} 🟠Large=${large} 🔴XL=${xl}\n`);

  // 逐张处理
  let processed = 0, skipped = 0, failed = 0;
  let skipped16 = 0;

  for (let i = 0; i < images.length; i++) {
    const fp = images[i];
    const rel = relative(DIST, fp);

    // 进度
    if (i % 50 === 0 || i === images.length - 1) {
      const pct = ((i + 1) / images.length * 100).toFixed(1);
      process.stdout.write(`\r  📊 ${i + 1}/${images.length} (${pct}%) | ✅ ${processed} | ⏭ ${skipped} | ❌ ${failed}`);
    }

    try {
      const ok = await processImage(fp);
      if (ok) processed++;
      else {
        skipped++;
        if (fp.endsWith('.png')) {
          // Track 16x16 skips
          try {
            const meta = await sharp(fp).metadata();
            if (meta.width === 16 && meta.height === 16) skipped16++;
          } catch {}
        }
      }
    } catch (e) {
      failed++;
      console.error(`\n  ❌ ${rel}: ${e.message}`);
    }
  }

  console.log('\n');
  console.log('📊 ' + '='.repeat(40));
  console.log('  处理统计:');
  console.log(`  总图片数:     ${images.length}`);
  console.log(`  ✅ 已添加水印: ${processed}`);
  console.log(`  ⏭  跳过:      ${skipped} (其中 16×16: ${skipped16})`);
  if (failed > 0) console.log(`  ❌ 处理失败:   ${failed}`);
  console.log('='.repeat(44) + '\n');

  // 清理缓存
  wmCache.clear();
}

main().catch(e => {
  console.error('\n❌ 水印处理失败:', e);
  process.exit(1);
});
