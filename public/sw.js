/**
 * Service Worker v4.0 — 外部图片按需水印 + 缓存
 *
 * 拦截两类请求：
 *   1. 同源 /external-wm/* — 来自 SmartImage 组件（URL 已重写）
 *   2. 跨域 oss.miragedge.top/* — 来自 Markdown ![]() 图片（URL 未重写）
 *
 * 处理流程：
 *   1. 检查 Cache API → 命中则直接返回
 *   2. cors 模式 fetch OSS → Canvas 加水印 → 缓存 → 返回
 *   3. cors 失败 → no-cors 模式 fetch（仅显示，无水印）
 *   4. 均失败 → 重写路径 302 重定向 / 直接 URL 透传原始请求
 *
 * 水印策略（与 scripts/watermark.mjs v4.0 保持一致）：
 *   < 16px         → 跳过
 *   16-32px        → 中心 2x2 标记 + 像素指纹
 *   33-64px        → 中心狐狸耳 logo + 像素指纹
 *   65-127px       → 斜向狐狸耳图层 + 右下角狐狸耳角标
 *   128-599px      → 仅右下角文字角标（MiragEdge）
 *   >= 600px       → 仅右下角文字角标（MiragEdge + miragedge.top）
 *
 * 前提：OSS 需配置 CORS 允许 miragedge.top。
 * 若 OSS 启用了 Referer 防盗链，需勾选"允许空 Referer"，
 * 否则 SW 环境下的 fetch 可能因 Referer 为空被拒绝。
 */

const CACHE_NAME = 'external-wm-v6';
let forwardMap = null; // originalUrl → localPath
let reverseMap = null; // localPath → originalUrl
let urlSet = null;     // Set<originalUrl> — 快速判断是否需要拦截

// =============== 品牌资产 ===============

const BRAND = '#E05252';
const BRAND_DARK = '#4A0E0E';
const TEXT_MAIN = 'MiragEdge';
const TEXT_DOMAIN = 'miragedge.top';
const FONT_STACK = '"Helvetica Neue", "Arial", "Noto Sans", sans-serif';

/**
 * 狐狸耳 logo path 数据（viewBox 100x100，与 watermark.mjs 一致）
 * 双层结构：外耳（亮色）+ 内耳（深色阴影），贝塞尔曲线流线型
 */
const FOX_PATHS = {
  leftEar:   'M 50,82 C 42,70 28,50 18,18 C 16,12 22,10 28,14 C 36,22 46,42 52,62 Z',
  rightEar:  'M 50,82 C 58,70 72,50 82,18 C 84,12 78,10 72,14 C 64,22 54,42 48,62 Z',
  leftInner: 'M 49,72 C 43,62 33,46 25,24 C 24,20 28,18 32,21 C 38,27 45,42 50,56 Z',
  rightInner:'M 51,72 C 57,62 67,46 75,24 C 76,20 72,18 68,21 C 62,27 55,42 50,56 Z',
};

// 预编译 Path2D（避免每次绘制重新解析）
const FOX_PATH_LEFT  = new Path2D(FOX_PATHS.leftEar);
const FOX_PATH_RIGHT = new Path2D(FOX_PATHS.rightEar);
const FOX_PATH_LEFT_INNER  = new Path2D(FOX_PATHS.leftInner);
const FOX_PATH_RIGHT_INNER = new Path2D(FOX_PATHS.rightInner);

/**
 * 绘制狐狸耳 logo（在 ctx 当前坐标系下，logo 居中于 (0,0) 到 (size,size) 的方框）
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size - logo 尺寸
 * @param {number} x - 左上角 x
 * @param {number} y - 左上角 y
 * @param {object} opts - { outer, inner, highlight, stroke }
 */
function drawFoxLogo(ctx, size, x, y, opts = {}) {
  const outer = opts.outer ?? 0.22;
  const inner = opts.inner ?? 0.14;
  const highlight = opts.highlight === true;
  const strokeOp = opts.stroke ?? 0;
  const scale = size / 100;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 外耳填充
  ctx.globalAlpha = outer;
  ctx.fillStyle = BRAND;
  ctx.fill(FOX_PATH_LEFT);
  ctx.fill(FOX_PATH_RIGHT);

  // 外耳描边（提升轮廓清晰度）
  if (strokeOp > 0) {
    ctx.globalAlpha = strokeOp;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.lineJoin = 'round';
    ctx.stroke(FOX_PATH_LEFT);
    ctx.stroke(FOX_PATH_RIGHT);
  }

  // 内耳阴影
  ctx.globalAlpha = inner;
  ctx.fillStyle = BRAND_DARK;
  ctx.fill(FOX_PATH_LEFT_INNER);
  ctx.fill(FOX_PATH_RIGHT_INNER);

  // 顶部高光（仅 highlight=true）
  if (highlight) {
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(22, 16);
    ctx.bezierCurveTo(24, 14, 26, 14, 28, 16);
    ctx.moveTo(78, 16);
    ctx.bezierCurveTo(76, 14, 74, 14, 72, 16);
    ctx.stroke();
  }

  ctx.restore();
}

// =============== 映射表加载 ===============

async function loadMap() {
  if (forwardMap) return;
  try {
    const res = await fetch('/external-wm-map.json', { cache: 'no-cache' });
    const data = await res.json();
    forwardMap = data;
    reverseMap = {};
    urlSet = new Set();
    for (const [origUrl, localPath] of Object.entries(data)) {
      reverseMap[localPath] = origUrl;
      urlSet.add(origUrl);
    }
  } catch (e) {
    console.error('[SW] 映射表加载失败:', e);
    forwardMap = {};
    reverseMap = {};
    urlSet = new Set();
  }
}

// =============== Canvas 水印 ===============

/**
 * 用 OffscreenCanvas 给图片加水印
 * 策略与构建时 watermark.mjs v4.0 一致（尺寸自适应）
 */
async function addWatermark(blob) {
  const bitmap = await createImageBitmap(blob);
  const w = bitmap.width;
  const h = bitmap.height;
  const minDim = Math.min(w, h);

  if (minDim < 16) {
    bitmap.close();
    return blob;
  }

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  if (minDim <= 32) {
    // 极小贴图：中心 2x2 标记 + 像素指纹
    drawCenterMark(ctx, w, h);
    drawPixelFingerprint(ctx, w, h, minDim);
  } else if (minDim <= 64) {
    // 小贴图：中心 logo + 像素指纹
    drawCenterFox(ctx, w, h, minDim);
    drawPixelFingerprint(ctx, w, h, minDim);
  } else if (minDim < 128) {
    // 中等小贴图：斜向狐狸耳图层 + 右下角角标
    drawDiagonalFox(ctx, w, h, minDim);
    drawFoxCorner(ctx, w, h, minDim);
  } else if (minDim < 600) {
    // 中图：仅右下角文字角标
    drawTextCorner(ctx, w, h, minDim, false);
  } else {
    // 大图：右下角文字角标 + 域名
    drawTextCorner(ctx, w, h, minDim, true);
  }

  const type = blob.type || 'image/png';
  const outType = type.includes('jpeg') ? 'image/jpeg'
    : type.includes('webp') ? 'image/webp'
    : 'image/png';
  const quality = type.includes('jpeg') ? 0.92 : type.includes('webp') ? 0.90 : undefined;
  return canvas.convertToBlob({ type: outType, quality });
}

// 中心 2x2 像素标记（极小贴图用，避免复杂 logo 细节丢失）
function drawCenterMark(ctx, w, h) {
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = BRAND;
  ctx.fillRect(cx - 1, cy - 1, 2, 2);
  ctx.restore();
}

// 中心狐狸耳 logo（覆盖图像核心区域，无法裁剪去除）
function drawCenterFox(ctx, w, h, minDim) {
  const ratio = minDim < 49 ? 0.40 : 0.35;
  const size = Math.round(minDim * ratio);
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  const outer = 0.30;
  const inner = 0.20;
  const stroke = minDim >= 50 ? 0.15 : 0;
  drawFoxLogo(ctx, size, x, y, { outer, inner, highlight: false, stroke });
}

// 右下角像素指纹（小贴图防盗追溯）
function drawPixelFingerprint(ctx, w, h, minDim) {
  const pxSize = minDim < 33 ? 1 : 2;
  const padding = minDim < 24 ? 1 : 2;
  const x = w - pxSize - padding;
  const y = h - pxSize - padding;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = BRAND;
  ctx.fillRect(x, y, pxSize, pxSize);
  ctx.restore();
}

// 斜向狐狸耳图层（65-127px 中等小贴图，替代斜向文字）
function drawDiagonalFox(ctx, w, h, minDim) {
  const logoSize = Math.round(minDim * 0.16);
  const stepX = logoSize * 4.5;
  const stepY = logoSize * 4.5;
  const expandW = w * 1.6;
  const expandH = h * 1.6;
  const offsetX = (expandW - w) / 2;
  const offsetY = (expandH - h) / 2;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-30 * Math.PI / 180);
  ctx.translate(-w / 2 - offsetX, -h / 2 - offsetY);

  let row = 0;
  for (let y = 0; y < expandH; y += stepY) {
    const xOffset = (row % 2) * (stepX / 2);
    for (let x = 0; x < expandW; x += stepX) {
      drawFoxLogo(ctx, logoSize, x + xOffset, y, {
        outer: 0.06, inner: 0.03, highlight: false
      });
    }
    row++;
  }
  ctx.restore();
}

// 右下角狐狸耳角标（65-127px 中等小贴图）
function drawFoxCorner(ctx, w, h, minDim) {
  const size = Math.max(20, Math.min(80, Math.round(minDim * 0.20)));
  const padding = Math.max(3, Math.round(minDim * 0.04));
  const x = w - size - padding;
  const y = h - size - padding;
  drawFoxLogo(ctx, size, x, y, { outer: 0.32, inner: 0.22, highlight: size >= 40, stroke: 0.18 });
}

// 右下角文字角标（128px+ 中图/大图）
function drawTextCorner(ctx, w, h, minDim, withDomain) {
  const boxW = Math.max(140, Math.min(360, Math.round(minDim * (withDomain ? 0.32 : 0.28))));
  const boxH = withDomain ? Math.round(boxW * 0.34) : Math.round(boxW * 0.26);
  const padding = Math.max(10, Math.round(minDim * 0.02));
  const x = w - boxW - padding;
  const y = h - boxH - padding;
  const r = Math.round(boxH * 0.18);

  ctx.save();

  // 渐变背景（左透明 → 右品牌色）
  const grad = ctx.createLinearGradient(x, y, x + boxW, y);
  grad.addColorStop(0, 'rgba(224, 82, 82, 0)');
  grad.addColorStop(0.4, 'rgba(224, 82, 82, 0.06)');
  grad.addColorStop(1, 'rgba(224, 82, 82, 0.18)');
  ctx.fillStyle = grad;
  // 圆角矩形
  roundedRectPath(ctx, x, y, boxW, boxH, r);
  ctx.fill();

  // 左侧 logo
  const logoSize = Math.round(boxH * 0.75);
  const logoX = x + Math.round(boxH * 0.18);
  const logoY = y + Math.round((boxH - logoSize) / 2);
  drawFoxLogo(ctx, logoSize, logoX, logoY, {
    outer: 0.30, inner: 0.20, highlight: logoSize >= 32, stroke: 0.16
  });

  // 右侧文字
  const fontSize1 = Math.round(boxH * (withDomain ? 0.42 : 0.52));
  const textX = logoX + logoSize + Math.round(boxH * 0.20);
  const textCenterX = (textX + x + boxW - Math.round(boxH * 0.15)) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize1}px ${FONT_STACK}`;
  ctx.globalAlpha = 0.28;
  ctx.fillText(TEXT_MAIN, textCenterX, y + boxH * (withDomain ? 0.42 : 0.52));

  if (withDomain) {
    const fontSize2 = Math.round(boxH * 0.22);
    ctx.font = `${fontSize2}px ${FONT_STACK}`;
    ctx.globalAlpha = 0.14;
    ctx.fillText(TEXT_DOMAIN, textCenterX, y + boxH * 0.78);
  }

  ctx.restore();
}

// 圆角矩形路径辅助函数
function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// =============== 请求处理 ===============

async function handleWatermark(request, originalUrl, isRewrittenPath) {
  const cache = await caches.open(CACHE_NAME);

  // 1. 检查缓存（用 originalUrl 作为缓存键）
  const cacheKey = new Request(originalUrl);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 2. 准备 Referer（SW 环境下 request.referrer 可能无效）
  let referrerUrl = request.referrer;
  if (!referrerUrl || !referrerUrl.startsWith('http')) {
    referrerUrl = self.location.origin + '/';
  }

  // 3. 从 OSS 下载（cors 模式，需要读取内容做水印）
  try {
    const res = await fetch(originalUrl, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
      referrer: referrerUrl,
      referrerPolicy: 'unsafe-url',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const contentType = blob.type || 'image/png';

    // 4. Canvas 加水印
    let watermarkedBlob;
    try {
      watermarkedBlob = await addWatermark(blob);
    } catch (e) {
      console.warn('[SW] 水印失败，返回原图:', originalUrl, e);
      watermarkedBlob = blob;
    }

    // 5. 构建响应并缓存
    const response = new Response(watermarkedBlob, {
      headers: {
        'Content-Type': watermarkedBlob.type || contentType,
        'Cache-Control': 'max-age=31536000, immutable',
      }
    });
    cache.put(cacheKey, response.clone());
    return response;
  } catch (e) {
    console.error('[SW] CORS 下载失败:', originalUrl, e.message);

    // 6. 兜底 1: no-cors 模式（仅显示，无水印）
    try {
      const opaqueRes = await fetch(originalUrl, {
        mode: 'no-cors',
        credentials: 'omit',
        cache: 'no-cache',
        referrer: referrerUrl,
        referrerPolicy: 'unsafe-url',
      });
      if (opaqueRes && opaqueRes.type === 'opaque') {
        return opaqueRes;
      }
    } catch (e2) {
      console.error('[SW] no-cors 兜底也失败:', e2.message);
    }

    // 7. 兜底 2: 重写路径 → 302 重定向到 OSS；直接 URL → 透传
    if (isRewrittenPath) {
      return Response.redirect(originalUrl, 302);
    }
    return fetch(request);
  }
}

// =============== 事件监听 ===============

self.addEventListener('install', (event) => {
  event.waitUntil(loadMap().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Case 1: 同源 /external-wm/* （来自 SmartImage，URL 已重写）
  if (url.origin === self.location.origin && url.pathname.startsWith('/external-wm/')) {
    event.respondWith(
      loadMap().then(() => {
        const originalUrl = reverseMap[url.pathname];
        if (!originalUrl) return fetch(event.request);
        return handleWatermark(event.request, originalUrl, true);
      })
    );
    return;
  }

  // Case 2: 跨域 oss.miragedge.top/* （来自 Markdown ![]() 图片）
  if (url.hostname === 'oss.miragedge.top') {
    event.respondWith(
      loadMap().then(() => {
        const cleanUrl = url.origin + url.pathname;
        if (urlSet.has(cleanUrl) || urlSet.has(event.request.url)) {
          const originalUrl = urlSet.has(event.request.url) ? event.request.url : cleanUrl;
          return handleWatermark(event.request, originalUrl, false);
        }
        return fetch(event.request);
      })
    );
    return;
  }
});
