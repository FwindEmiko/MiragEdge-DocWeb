/**
 * 水印生成脚本 — 一次性运行，生成水印 PNG 资源
 *
 * 运行方式: node scripts/generate-watermark.mjs
 * 
 * 设计说明：
 * 采用纯几何图形（无需系统字体），包含：
 * 1. 小号耳朵形标（16x16，用于中型图片）
 * 2. 大号品牌水印（包含 "锐界" 文字，用于大型图片，依赖系统 CJK 字体）
 *
 * 生成的文件放在 public/watermark/ 下，提交到仓库
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, 'assets');

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true });
}

// =============== 方案 A：纯几何水印（无字体依赖，始终可用）===============

/**
 * 生成「星弧」水印 — 品牌色渐变弧线 + 小星点
 * 设计灵感：星辰轨迹划过角落，代表「锐界幻境」
 * @param {number} size - 水印尺寸（正方形）
 * @param {number} opacity - 不透明度
 */
async function createArcWatermark(size = 48, opacity = 0.15) {
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#ffffff" stop-opacity="0" />
          <stop offset="50%"  stop-color="#E05252" stop-opacity="${opacity}" />
          <stop offset="100%" stop-color="#E05252" stop-opacity="${opacity * 0.7}" />
        </linearGradient>
      </defs>
      <!-- 弧线：从底部向左上弯曲 -->
      <path d="M ${size} ${size * 0.85} 
               Q ${size * 0.85} ${size * 0.6} 
                 ${size * 0.55} ${size * 0.35}"
            fill="none" stroke="url(#arcGrad)" stroke-width="${Math.max(1, size * 0.04)}"
            stroke-linecap="round"/>
      <!-- 小星点：弧线终点处 -->
      <circle cx="${size * 0.52}" cy="${size * 0.32}" 
              r="${Math.max(1, size * 0.04)}" 
              fill="#E05252" opacity="${opacity * 0.8}"/>
      <!-- 小星点：弧线起点处 -->
      <circle cx="${size * 0.97}" cy="${size * 0.83}" 
              r="${Math.max(0.5, size * 0.02)}" 
              fill="#ffffff" opacity="${opacity * 0.5}"/>
    </svg>`;

  // 用透明背景创建水印
  const svgBuffer = Buffer.from(svgContent);
  
  // 保持原始透明度，导出为 RGBA PNG
  return sharp(svgBuffer).png().toBuffer();
}

/**
 * 生成小号水印（16px，用于中/小型图片）
 * 更简洁：只有一个微小的星点
 */
async function createSmallDotWatermark() {
  const svgContent = `
    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <!-- 极简标记：用一个微型星形折线 -->
      <polygon points="9,1 9.5,4 12,5 9.5,6 9,9 8.5,6 6,5 8.5,4" 
               fill="#E05252" opacity="0.12" />
    </svg>`;
  return sharp(Buffer.from(svgContent)).png().toBuffer();
}

// =============== 方案 B：带文字水印（需要系统 CJK 字体）===============

/**
 * 生成品牌文字水印 — 「锐界幻境」+ 小星标
 * 需要系统安装 Noto Sans CJK 或类似中文字体
 * 在 GitHub Actions 上需要安装 fonts-noto-cjk
 * @param {number} size 水印高度
 */
async function createTextWatermark(size = 24) {
  const fontSize = Math.round(size * 0.55);
  const padding = Math.round(size * 0.15);
  
  // 尝试检测系统是否含 CJK 字体
  const svgContent = `
    <svg width="${size * 5}" height="${size}" 
         viewBox="0 0 ${size * 5} ${size}" 
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="txtGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#ffffff" stop-opacity="0" />
          <stop offset="20%"  stop-color="#ffffff" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.20" />
        </linearGradient>
      </defs>
      <!-- 背景淡化条 -->
      <rect x="0" y="0" width="${size * 5}" height="${size}" 
            fill="url(#txtGrad)" rx="${Math.round(size * 0.15)}" />
      <!-- 小星标 -->
      <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${Math.round(size * 0.06)}" 
              fill="#E05252" opacity="0.35" />
      <!-- 品牌文字 -->
      <text x="${size * 1.2}" y="${size * 0.68}" 
            font-family="'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif"
            font-size="${fontSize}" font-weight="600"
            fill="#ffffff" opacity="0.16">锐界幻境</text>
    </svg>`;
  
  return sharp(Buffer.from(svgContent)).png().toBuffer();
}

// =============== 主流程 ===============

async function main() {
  console.log('🦊 生成水印资源...\n');

  // 1. 大号几何水印 (48px) — 用于大图
  const arcLarge = await createArcWatermark(48, 0.18);
  const arcLargePath = join(PUBLIC_DIR, 'arc-large.png');
  writeFileSync(arcLargePath, arcLarge);
  console.log(`  ✅ arc-large.png (48x48) — 大图几何水印`);

  // 2. 中号几何水印 (24px) — 用于中等图片
  const arcMedium = await createArcWatermark(24, 0.15);
  const arcMediumPath = join(PUBLIC_DIR, 'arc-medium.png');
  writeFileSync(arcMediumPath, arcMedium);
  console.log(`  ✅ arc-medium.png (24x24) — 中图几何水印`);

  // 3. 小号星点 (12x12) — 用于小图标记
  const dotSmall = await createSmallDotWatermark();
  const dotSmallPath = join(PUBLIC_DIR, 'dot-small.png');
  writeFileSync(dotSmallPath, dotSmall);
  console.log(`  ✅ dot-small.png (12x12) — 小图标记`);

  // 4. 带文字水印 — 需要 CJK 字体
  try {
    const textWm = await createTextWatermark(28);
    const textPath = join(PUBLIC_DIR, 'text-watermark.png');
    writeFileSync(textPath, textWm);
    console.log(`  ✅ text-watermark.png (140x28) — 品牌文字水印`);
  } catch (e) {
    console.log(`  ⚠️  文字水印生成失败（无 CJK 字体?）: ${e.message}`);
    console.log(`      安装 fonts-noto-cjk 后可重试`);
  }

  // 输出文件列表
  console.log('\n📦 生成文件:');
  const { readdirSync } = await import('fs');
  for (const f of readdirSync(PUBLIC_DIR)) {
    const { statSync } = await import('fs');
    const size = statSync(join(PUBLIC_DIR, f)).size;
    console.log(`  📄 ${f} (${(size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n✨ 完成! 这些文件应提交到仓库。');
}

main().catch(e => {
  console.error('❌ 生成失败:', e);
  process.exit(1);
});
