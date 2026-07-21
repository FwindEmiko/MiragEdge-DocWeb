/**
 * 水印引擎 v4.0 — 优雅分层水印系统
 *
 * 设计理念：
 *   - 大图/中图：仅右下角文字小标，不破坏主视觉
 *   - 中等小贴图（OSS 贴图重点）：斜向狐狸耳图层，防盗且美观
 *   - 小贴图：中心 logo + 像素指纹，防盗可追溯
 *   - 纯英文文字 + 图形化 logo，跨平台字体一致
 *
 * 尺寸分层策略（按最短边）：
 *   < 16px         → 跳过（太小无法加水印）
 *   16-32px        → 中心 2x2 标记 + 像素指纹（极小贴图，避免复杂 logo 细节丢失）
 *   33-64px        → 中心狐狸耳 logo + 像素指纹（小贴图防盗）
 *   65-127px       → 斜向狐狸耳图层 + 右下角狐狸耳角标（中等小贴图）
 *   128-599px      → 仅右下角文字角标（MiragEdge）
 *   >= 600px       → 仅右下角文字角标（MiragEdge + miragedge.top）
 *
 * v4 改进：
 *   - 移除斜向铺满文字（按需求，大图/中图只保留角标）
 *   - 重新设计狐狸耳 logo：贝塞尔曲线流线型 + 内耳阴影层次 + 白色描边
 *   - 新增斜向狐狸耳图层（65-127px 用，替代斜向文字）
 *   - 新增像素指纹（小贴图防盗追溯）
 *   - 16-32px 极小贴图用 2x2 中心标记代替复杂 logo，避免细节丢失
 *   - 纯英文文字规避中文字体依赖
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

// =============== 品牌资产 ===============

const BRAND = "#E05252";          // 品牌色（红）
const BRAND_DARK = "#4A0E0E";     // 内耳深色（更深，强化层次对比）
const TEXT_MAIN = "MiragEdge";    // 主文字（纯英文，跨平台一致）
const TEXT_DOMAIN = "miragedge.top"; // 域名印记（仅大图角标）
const FONT_STACK = "'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif";

/**
 * 狐狸耳 logo path 数据（viewBox 100x100，中心 50,50）
 *
 * 设计：
 *   - 双层结构：外耳（亮色）+ 内耳（深色阴影）
 *   - 贝塞尔曲线流线型轮廓，顶部尖角圆润
 *   - 两耳底部相连，模拟头部轮廓
 *   - 对称美学
 *
 * 图层（从下到上）：
 *   1. 外耳填充（品牌色 #E05252）
 *   2. 内耳阴影（深色 #7A1818，叠加层次）
 *   3. 顶部高光（白色细线，提升精致感，仅大尺寸显示）
 */
const FOX_LOGO_PATHS = {
  // 左耳外轮廓：从底部中央上升至左尖角，再回落
  leftEar: "M 50,82 C 42,70 28,50 18,18 C 16,12 22,10 28,14 C 36,22 46,42 52,62 Z",
  // 右耳外轮廓：左耳的镜像
  rightEar: "M 50,82 C 58,70 72,50 82,18 C 84,12 78,10 72,14 C 64,22 54,42 48,62 Z",
  // 左内耳：缩小 70%，颜色更深形成阴影
  leftInner: "M 49,72 C 43,62 33,46 25,24 C 24,20 28,18 32,21 C 38,27 45,42 50,56 Z",
  // 右内耳
  rightInner: "M 51,72 C 57,62 67,46 75,24 C 76,20 72,18 68,21 C 62,27 55,42 50,56 Z",
};

/**
 * 生成狐狸耳 logo SVG 片段（可嵌入到任意尺寸的 SVG 中）
 * @param {number} size - logo 绘制尺寸（正方形）
 * @param {number} x - 左上角 x 坐标
 * @param {number} y - 左上角 y 坐标
 * @param {object} opts - 透明度配置 { outer, inner, highlight, stroke }
 * @param {boolean} opts.highlight - 是否绘制顶部高光（大尺寸才用）
 * @param {number} opts.stroke - 描边透明度（0 表示无描边，建议 0.12-0.18）
 * @returns {string} SVG <g> 元素字符串
 */
function buildFoxLogoSvg(size, x, y, opts = {}) {
  const outer = opts.outer ?? 0.22;
  const inner = opts.inner ?? 0.14;
  const highlight = opts.highlight === true;
  const strokeOp = opts.stroke ?? 0;
  const scale = size / 100;
  const transform = `translate(${x} ${y}) scale(${scale})`;

  // 描边属性（仅外耳描边，提升轮廓清晰度）
  const strokeAttr = strokeOp > 0
    ? ` stroke="#ffffff" stroke-width="0.8" stroke-opacity="${strokeOp}" stroke-linejoin="round"`
    : "";

  // 高光：顶部尖角的细白线，仅 highlight=true 时绘制
  const highlightSvg = highlight
    ? `<path d="M 22,16 C 24,14 26,14 28,16" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.25" stroke-linecap="round"/>
       <path d="M 78,16 C 76,14 74,14 72,16" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.25" stroke-linecap="round"/>`
    : "";

  return `<g transform="${transform}">
    <path d="${FOX_LOGO_PATHS.leftEar}" fill="${BRAND}" opacity="${outer}"${strokeAttr}/>
    <path d="${FOX_LOGO_PATHS.rightEar}" fill="${BRAND}" opacity="${outer}"${strokeAttr}/>
    <path d="${FOX_LOGO_PATHS.leftInner}" fill="${BRAND_DARK}" opacity="${inner}"/>
    <path d="${FOX_LOGO_PATHS.rightInner}" fill="${BRAND_DARK}" opacity="${inner}"/>
    ${highlightSvg}
  </g>`;
}

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
      const chunkType = buf.toString("ascii", 12, 16);
      if (chunkType === "VP8X") {
        const w = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
        const h = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
        return { width: w, height: h };
      }
      if (chunkType === "VP8L") {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunkType === "VP8 ") {
        const w = buf.readUInt16LE(26) & 0x3fff;
        const h = buf.readUInt16LE(28) & 0x3fff;
        if (w > 0 && h > 0) return { width: w, height: h };
      }
    }
  }
  return null;
}

// =============== SVG 水印动态生成 ===============

/**
 * 中心 2x2 像素标记 SVG（极小贴图用）
 *
 * 用于 16-32px 极小贴图：避免复杂 logo 细节丢失
 * - 中心 2x2 品牌色像素，半透明，肉眼可见但不破坏像素艺术
 * - 覆盖核心区域，无法裁剪去除
 */
function buildCenterMarkSvg(w, h) {
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  // 2x2 像素，居中
  const x = cx - 1;
  const y = cy - 1;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x}" y="${y}" width="2" height="2" fill="${BRAND}" opacity="0.35"/>
  </svg>`;
}

/**
 * 中心狐狸耳 logo SVG（覆盖图像核心区域，无法裁剪去除）
 *
 * 用于 33-64px 小贴图：核心防盗层
 * - logo 占比 35-40%，避免过度遮挡像素艺术
 * - 透明度提高，确保可见但不突兀
 * - 大于 50px 启用描边，提升轮廓清晰度
 */
function buildCenterFoxSvg(w, h) {
  const minDim = Math.min(w, h);
  // logo 占比：降低以避免遮挡核心内容
  const ratio = minDim < 49 ? 0.40 : 0.35;
  const size = Math.round(minDim * ratio);
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  // 透明度：提高可见度
  const outer = 0.30;
  const inner = 0.20;
  // 描边：大于 50px 启用，提升轮廓
  const stroke = minDim >= 50 ? 0.15 : 0;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    ${buildFoxLogoSvg(size, x, y, { outer, inner, highlight: false, stroke })}
  </svg>`;
}

/**
 * 右下角像素指纹 SVG（小贴图防盗追溯）
 *
 * 用于 ≤64px 小贴图：可追溯盗图来源
 * - 1-2 像素的品牌色方块，肉眼可见但不破坏整体
 * - 位置固定在右下角，便于事后检测
 */
function buildPixelFingerprintSvg(w, h) {
  const minDim = Math.min(w, h);
  // 像素尺寸：32px 以下用 1x1，33-64px 用 2x2
  const pxSize = minDim < 33 ? 1 : 2;
  // 距离边缘 1-2 像素
  const padding = minDim < 24 ? 1 : 2;
  const x = w - pxSize - padding;
  const y = h - pxSize - padding;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x}" y="${y}" width="${pxSize}" height="${pxSize}" fill="${BRAND}" opacity="0.55"/>
  </svg>`;
}

/**
 * 斜向狐狸耳图层 SVG（按图片尺寸自适应密度）
 *
 * 用于 65-127px 中等小贴图：替代斜向文字，更优雅的防盗图层
 * - 狐狸耳 logo 以 -30° 旋转，按网格铺满
 * - 单个 logo 尺寸约最短边的 16%
 * - 网格间距 4.5 倍 logo 尺寸，避免拥挤
 * - 透明度极低（0.06），不破坏观感
 */
function buildDiagonalFoxSvg(w, h) {
  const minDim = Math.min(w, h);
  const logoSize = Math.round(minDim * 0.16);
  // 网格间距：4.5 倍 logo 尺寸（增大间距避免拥挤）
  const stepX = logoSize * 4.5;
  const stepY = logoSize * 4.5;
  // 旋转后覆盖整个图片所需的范围（扩大 60%）
  const expandW = w * 1.6;
  const expandH = h * 1.6;
  const offsetX = (expandW - w) / 2;
  const offsetY = (expandH - h) / 2;

  let logos = "";
  for (let y = -offsetY; y < expandH; y += stepY) {
    for (let x = -offsetX; x < expandW; x += stepX) {
      // 错位排列：奇数行向右偏移半个间距，更自然
      const xOffset = (Math.round(y / stepY) % 2) * (stepX / 2);
      logos += buildFoxLogoSvg(logoSize, x + xOffset, y, {
        outer: 0.06, inner: 0.03, highlight: false
      });
    }
  }

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-30 ${w/2} ${h/2}) translate(${-offsetX} ${-offsetY})">
      ${logos}
    </g>
  </svg>`;
}

/**
 * 右下角狐狸耳角标 SVG（按图片尺寸缩放）
 *
 * 用于 65-127px 中等小贴图：右下角品牌标识
 * - logo 尺寸约最短边的 20%
 * - 透明度较高（0.32），角标更醒目
 * - 启用描边提升轮廓清晰度
 * - 大于 40px 时启用高光细节
 */
function buildFoxCornerSvg(w, h) {
  const minDim = Math.min(w, h);
  const size = Math.max(20, Math.min(80, Math.round(minDim * 0.20)));
  const padding = Math.max(3, Math.round(minDim * 0.04));
  const x = w - size - padding;
  const y = h - size - padding;
  const highlight = size >= 40;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    ${buildFoxLogoSvg(size, x, y, { outer: 0.32, inner: 0.22, highlight, stroke: 0.18 })}
  </svg>`;
}

/**
 * 右下角文字角标 SVG（中图/大图用）
 *
 * 设计：
 *   - 圆角矩形渐变背景（左透明 → 右品牌色），融入图像
 *   - 左侧狐狸耳 logo（中等尺寸时省略）
 *   - 右侧 "MiragEdge" 文字
 *   - 大图增加 "miragedge.top" 域名副标
 *
 * @param {boolean} withDomain - 是否显示域名（仅大图）
 */
function buildTextCornerSvg(w, h, withDomain = false) {
  const minDim = Math.min(w, h);
  // 角标整体宽度：最短边的 28-32%
  const boxW = Math.max(140, Math.min(360, Math.round(minDim * (withDomain ? 0.32 : 0.28))));
  // 高度：含域名时更高
  const boxH = withDomain
    ? Math.round(boxW * 0.34)
    : Math.round(boxW * 0.26);
  const padding = Math.max(10, Math.round(minDim * 0.02));
  const x = w - boxW - padding;
  const y = h - boxH - padding;
  const r = Math.round(boxH * 0.18); // 圆角半径

  // logo 尺寸（高度内适配）
  const logoSize = Math.round(boxH * 0.75);
  const logoX = x + Math.round(boxH * 0.18);
  const logoY = y + Math.round((boxH - logoSize) / 2);

  // 文字尺寸
  const fontSize1 = Math.round(boxH * (withDomain ? 0.42 : 0.52));
  const fontSize2 = Math.round(boxH * 0.22);
  // 文字起始 x（logo 右侧）
  const textX = logoX + logoSize + Math.round(boxH * 0.20);
  // 文字水平区域中心
  const textCenterX = (textX + x + boxW - Math.round(boxH * 0.15)) / 2;

  const domainSvg = withDomain
    ? `<text x="${textCenterX}" y="${y + boxH * 0.78}" text-anchor="middle" font-family="${FONT_STACK}" font-size="${fontSize2}" font-weight="400" fill="#ffffff" opacity="0.14" letter-spacing="0.5">${TEXT_DOMAIN}</text>`
    : "";

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${BRAND}" stop-opacity="0"/>
        <stop offset="40%" stop-color="${BRAND}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${BRAND}" stop-opacity="0.18"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${r}" fill="url(#bg)"/>
    ${buildFoxLogoSvg(logoSize, logoX, logoY, { outer: 0.30, inner: 0.20, highlight: logoSize >= 32, stroke: 0.16 })}
    <text x="${textCenterX}" y="${y + boxH * (withDomain ? 0.42 : 0.52)}" text-anchor="middle" font-family="${FONT_STACK}" font-size="${fontSize1}" font-weight="700" fill="#ffffff" opacity="0.28" letter-spacing="0.8">${TEXT_MAIN}</text>
    ${domainSvg}
  </svg>`;
}

// =============== 水印层级选择 ===============

/**
 * 根据图片尺寸选择水印层级
 * 策略与 public/sw.js 中 addWatermark() 保持一致（构建时 + 运行时双写）
 */
function buildWatermarkLayers(w, h) {
  const minDim = Math.min(w, h);
  if (minDim < 16) return [];

  const layers = [];

  if (minDim <= 32) {
    // 极小贴图（16-32px）：中心 2x2 标记 + 像素指纹（避免复杂 logo 细节丢失）
    layers.push({ svg: buildCenterMarkSvg(w, h) });
    layers.push({ svg: buildPixelFingerprintSvg(w, h) });
  } else if (minDim <= 64) {
    // 小贴图（33-64px）：中心 logo + 像素指纹
    layers.push({ svg: buildCenterFoxSvg(w, h) });
    layers.push({ svg: buildPixelFingerprintSvg(w, h) });
  } else if (minDim < 128) {
    // 中等小贴图（65-127px）：斜向狐狸耳图层 + 右下角角标
    layers.push({ svg: buildDiagonalFoxSvg(w, h) });
    layers.push({ svg: buildFoxCornerSvg(w, h) });
  } else if (minDim < 600) {
    // 中图（128-599px）：仅右下角文字角标
    layers.push({ svg: buildTextCornerSvg(w, h, false) });
  } else {
    // 大图（600px+）：右下角文字角标 + 域名
    layers.push({ svg: buildTextCornerSvg(w, h, true) });
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
      // 调色板量化 + 高压缩，避免水印重编码后体积反弹
      pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true, progressive: true });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 85, effort: 4 });
    }
    await pipeline.toFile(tmpPath);
    try {
      renameSync(tmpPath, filePath);
    } catch (e) {
      try { unlinkSync(tmpPath); } catch {}
      throw e;
    }
    return true;
  } catch (e) {
    try { unlinkSync(tmpPath); } catch {}
    throw e;
  }
}

// =============== 导出 ===============

export { processImage, getImageSize, buildWatermarkLayers };

// =============== 入口 ===============

async function main() {
  console.log("\nF 星玖水印引擎 v4.0 — 优雅分层水印\n");

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
        // 跳过贡献者头像目录（dist/images/member）
        if (e.name === "member" && dir.endsWith(join("images"))) continue;
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
  const failedFiles = [];

  for (let i = 0; i < images.length; i++) {
    if (i % 50 === 0 || i === images.length - 1) {
      const pct = ((i + 1) / images.length * 100).toFixed(1);
      process.stdout.write(`\r  ${i + 1}/${images.length} (${pct}%) | OK ${processed} | SKIP ${skipped} | FAIL ${failed}`);
    }
    try {
      const result = await Promise.race([
        processImage(images[i]),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout (>30s)")), 30000)
        ),
      ]);
      if (result) processed++;
      else skipped++;
    } catch (e) {
      failed++;
      failedFiles.push({ file: images[i], error: e.message });
      if (e.message.includes("Timeout")) {
        console.log(`\n  ⚠ Timeout: ${images[i]}`);
      }
    }
  }

  // 第二轮：对失败的文件重试（等待 Defender 释放锁）
  if (failedFiles.length > 0) {
    console.log(`\n  Retrying ${failedFiles.length} failed files...`);
    const stillFailed = [];
    for (const f of failedFiles) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const result = await Promise.race([
          processImage(f.file),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout (>30s)")), 30000)
          ),
        ]);
        if (result) {
          processed++;
          failed--;
        } else {
          stillFailed.push(f);
        }
      } catch (e) {
        f.error = e.message;
        stillFailed.push(f);
      }
    }
    failedFiles.length = 0;
    failedFiles.push(...stillFailed);
  }

  console.log(`\n\nDone: ${processed} ok, ${skipped} skip, ${failed} fail / ${images.length} total`);
  if (failedFiles.length > 0) {
    console.log(`\nFailed files:`);
    for (const f of failedFiles) {
      console.log(`  ${f.file}`);
      console.log(`    → ${f.error}`);
    }
  }
  svgCache.clear();
}

const __isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (__isMain) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
