/**
 * 水印生成脚本 v2 — 狐狸耳 + 斜向重复水印
 *
 * 设计：
 * - 狐狸耳：两个三角形组成耳朵轮廓，代表狐魇星玖
 * - 斜向文字：「锐界幻境」45° 重复铺满，半透明
 *
 * 运行: node scripts/generate-watermark.mjs
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, 'assets');

if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
}

// 品牌色
const BRAND = '#E05252';

// =============== 1. 超小狐狸耳 (8×8) — 用于 16×16 贴图 ===============
async function createFoxTiny() {
  const svg = `<svg width="8" height="8" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
    <polygon points="1,7 4,1 4.5,5" fill="${BRAND}" opacity="0.12" />
    <polygon points="4,1 7,7 3.5,5" fill="${BRAND}" opacity="0.08" />
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 2. 小狐狸耳 (16×16) — 用于 32-64px 图片 ===============
async function createFoxSmall() {
  const svg = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${BRAND}" stop-opacity="0"/>
        <stop offset="100%" stop-color="${BRAND}" stop-opacity="0.15"/>
      </linearGradient>
    </defs>
    <!-- 左耳尖 -->
    <polygon points="2,14 8,1 10,8" fill="url(#fg)" />
    <!-- 右耳尖 -->
    <polygon points="8,1 14,14 6,8" fill="url(#fg)" />
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 3. 中狐狸耳 (32×32) — 用于 64-128px 图片 ===============
async function createFoxMedium() {
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${BRAND}" stop-opacity="0"/>
        <stop offset="60%" stop-color="${BRAND}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${BRAND}" stop-opacity="0.10"/>
      </linearGradient>
    </defs>
    <!-- 左耳 -->
    <polygon points="4,28 16,2 19,14" fill="url(#fg)" stroke="${BRAND}" stroke-width="0.5" stroke-opacity="0.12"/>
    <!-- 右耳 -->
    <polygon points="16,2 28,28 13,14" fill="url(#fg)" stroke="${BRAND}" stroke-width="0.5" stroke-opacity="0.12"/>
    <!-- 面部轮廓 -->
    <ellipse cx="16" cy="22" rx="10" ry="7" fill="${BRAND}" opacity="0.06"/>
    <!-- 鼻子点 -->
    <circle cx="16" cy="20" r="1" fill="${BRAND}" opacity="0.15"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 4. 斜向重复水印拼贴 (800×800) — 用于 >128px 图片 ===============
async function createTileWatermark() {
  const svg = `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
        <text x="120" y="120" transform="rotate(-35, 120, 120)"
              font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif"
              font-size="28" font-weight="700"
              fill="#ffffff" opacity="0.07"
              text-anchor="middle" dominant-baseline="central">
          锐界幻境 MiragEdge
        </text>
        <text x="120" y="12" transform="rotate(-35, 120, 12)"
              font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif"
              font-size="14" font-weight="400"
              fill="#E05252" opacity="0.04"
              text-anchor="middle">
          miragedge.top
        </text>
      </pattern>
      <pattern id="fox" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
        <!-- 小狐狸耳点缀在文字间隙 -->
        <polygon points="220,228 232,208 236,220" fill="#E05252" opacity="0.04"/>
        <polygon points="232,208 244,228 228,220" fill="#E05252" opacity="0.03"/>
      </pattern>
    </defs>
    <rect width="800" height="800" fill="url(#grid)" />
    <rect width="800" height="800" fill="url(#fox)" />
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 5. 狐狸图案拼贴 (32×32) — 用于小尺寸图片的全图覆盖 ===============
async function createFoxTile() {
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="f" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
        <!-- 狐狸耳朵重复图案，足够密集以覆盖小图 -->
        <polygon points="4,28 16,2 19,14" fill="#E05252" opacity="0.12" stroke="none"/>
        <polygon points="16,2 28,28 13,14" fill="#E05252" opacity="0.08" stroke="none"/>
        <circle cx="16" cy="22" r="3" fill="#E05252" opacity="0.06"/>
        <!-- 对角辅助标记 -->
        <line x1="0" y1="32" x2="32" y2="0" stroke="#E05252" stroke-width="0.5" opacity="0.06"/>
        <line x1="0" y1="18" x2="18" y2="0" stroke="#E05252" stroke-width="0.3" opacity="0.04"/>
      </pattern>
    </defs>
    <rect width="32" height="32" fill="url(#f)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 6. 大字斜标 (200×60) — 用于超大图的角标 ===============
async function createTextCorner() {
  const svg = `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${BRAND}" stop-opacity="0"/>
        <stop offset="30%" stop-color="${BRAND}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${BRAND}" stop-opacity="0.15"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="200" height="60" rx="8" fill="url(#bg)"/>
    <text x="100" y="28" text-anchor="middle"
          font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif"
          font-size="22" font-weight="700"
          fill="#ffffff" opacity="0.20">锐界幻境</text>
    <text x="100" y="48" text-anchor="middle"
          font-family="'Noto Sans SC', 'Microsoft YaHei', sans-serif"
          font-size="11" font-weight="400"
          fill="#ffffff" opacity="0.10">MiragEdge</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// =============== 主流程 ===============

async function main() {
  console.log('🦊 星玖水印引擎 v2 — 生成狐狸耳 + 斜向重复水印\n');

  const items = [
    ['fox-tiny.png',      await createFoxTiny(),      '8×8',     '极微狐狸耳 — 16×16 贴图'],
    ['fox-small.png',     await createFoxSmall(),     '16×16',   '小狐狸耳 — 32-64px 图片'],
    ['fox-medium.png',    await createFoxMedium(),    '32×32',   '中狐狸耳 — 64-128px 图片'],
    ['fox-tile.png',      await createFoxTile(),      '32×32',   '狐狸图案拼贴 — 小尺寸全图覆盖'],
    ['tile-watermark.png', await createTileWatermark(), '800×800', '斜向重复文字拼贴 — >128px 图片'],
    ['text-corner.png',   await createTextCorner(),   '200×60',  '大图角标 — 大尺寸截图'],
  ];

  for (const [name, buf, dim, desc] of items) {
    const path = join(ASSETS_DIR, name);
    writeFileSync(path, buf);
    const sizeKb = (buf.length / 1024).toFixed(1);
    console.log(`  ✅ ${name.padEnd(20)} ${dim.padEnd(10)} ${sizeKb.padStart(5)} KB  — ${desc}`);
  }

  console.log('\n✨ 完成！');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
