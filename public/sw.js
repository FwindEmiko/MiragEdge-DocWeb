/**
 * Service Worker — 外部图片按需水印 + 缓存
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
 * 前提：OSS 需配置 CORS 允许 miragedge.top。
 * 若 OSS 启用了 Referer 防盗链，需勾选"允许空 Referer"，
 * 否则 SW 环境下的 fetch 可能因 Referer 为空被拒绝。
 */

const CACHE_NAME = 'external-wm-v5';
let forwardMap = null; // originalUrl → localPath
let reverseMap = null; // localPath → originalUrl
let urlSet = null;     // Set<originalUrl> — 快速判断是否需要拦截

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
 * 策略与构建时 watermark.mjs v3 一致（尺寸自适应）：
 *   <16px       → 跳过
 *   16-48px     → 中心狐狸耳（核心防盗）
 *   49-127px    → 对角线 + 中心狐狸耳 + 角标
 *   128-599px   → 斜向文字 + 中心狐狸耳 + 角标
 *   >=600px     → 斜向文字 + 中心狐狸耳 + 品牌角标
 */
async function addWatermark(blob) {
  const bitmap = await createImageBitmap(blob);
  const w = bitmap.width;
  const h = bitmap.height;
  const minDim = Math.min(w, h);

  if (minDim < 16) return blob;

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  if (minDim < 49) {
    // 超小图：仅中心狐狸耳
    drawCenterFox(ctx, w, h, minDim);
  } else if (minDim < 128) {
    // 小图：对角线 + 中心狐狸耳 + 角标（无全图偏色）
    drawDiagonalLines(ctx, w, h);
    drawCenterFox(ctx, w, h, minDim);
    drawFoxCorner(ctx, w, h, minDim);
  } else if (minDim < 600) {
    // 中图：斜向文字 + 中心狐狸耳 + 角标（无全图偏色）
    drawTileWatermark(ctx, w, h, minDim);
    drawCenterFox(ctx, w, h, minDim);
    drawFoxCorner(ctx, w, h, minDim);
  } else {
    // 大图：斜向文字 + 中心狐狸耳 + 品牌角标
    drawTileWatermark(ctx, w, h, minDim);
    drawCenterFox(ctx, w, h, minDim);
    drawTextCorner(ctx, w, h, minDim);
  }

  const type = blob.type || 'image/png';
  const outType = type.includes('jpeg') ? 'image/jpeg'
    : type.includes('webp') ? 'image/webp'
    : 'image/png';
  const quality = type.includes('jpeg') ? 0.92 : type.includes('webp') ? 0.90 : undefined;
  return canvas.convertToBlob({ type: outType, quality });
}

// 中心狐狸耳（覆盖图像核心区域，无法裁剪去除）
function drawCenterFox(ctx, w, h, minDim) {
  const ratio = minDim < 49 ? 0.55 : minDim < 128 ? 0.45 : 0.30;
  const size = Math.round(minDim * ratio);
  const x0 = w / 2 - size / 2;
  const y0 = h / 2 - size / 2;
  const op1 = minDim < 49 ? 0.28 : 0.20;
  const op2 = minDim < 49 ? 0.20 : 0.14;
  const op3 = minDim < 49 ? 0.12 : 0.08;

  ctx.save();
  ctx.fillStyle = '#E05252';
  // 左耳
  ctx.globalAlpha = op1;
  ctx.beginPath();
  ctx.moveTo(x0 + size * 0.1, y0 + size * 0.9);
  ctx.lineTo(x0 + size * 0.5, y0 + size * 0.05);
  ctx.lineTo(x0 + size * 0.6, y0 + size * 0.45);
  ctx.closePath();
  ctx.fill();
  // 右耳
  ctx.globalAlpha = op2;
  ctx.beginPath();
  ctx.moveTo(x0 + size * 0.5, y0 + size * 0.05);
  ctx.lineTo(x0 + size * 0.9, y0 + size * 0.9);
  ctx.lineTo(x0 + size * 0.4, y0 + size * 0.45);
  ctx.closePath();
  ctx.fill();
  // 面部轮廓
  ctx.globalAlpha = op3;
  ctx.beginPath();
  ctx.ellipse(x0 + size * 0.5, y0 + size * 0.7, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 小图对角线（低透明度，不破坏可读性）
function drawDiagonalLines(ctx, w, h) {
  const spacing = Math.max(8, Math.round(Math.min(w, h) / 6));
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#E05252';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -h; i < w + h; i += spacing) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
  }
  ctx.stroke();
  ctx.restore();
}

// 狐狸耳角标（右下角，按图片尺寸缩放）
function drawFoxCorner(ctx, w, h, minDim) {
  const size = Math.max(16, Math.min(80, Math.round(minDim * 0.15)));
  const padding = Math.max(2, Math.round(minDim * 0.02));
  const x = w - size - padding;
  const y = h - size - padding;

  ctx.save();
  // 左耳
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#E05252';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y + size * 0.9);
  ctx.lineTo(x + size * 0.5, y + size * 0.05);
  ctx.lineTo(x + size * 0.6, y + size * 0.45);
  ctx.closePath();
  ctx.fill();
  // 右耳
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.05);
  ctx.lineTo(x + size * 0.9, y + size * 0.9);
  ctx.lineTo(x + size * 0.4, y + size * 0.45);
  ctx.closePath();
  ctx.fill();
  // 面部轮廓
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.5, y + size * 0.7, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 斜向文字覆盖（字号自适应）
function drawTileWatermark(ctx, w, h, minDim) {
  const fontSize = Math.max(12, Math.min(48, Math.round(minDim / 8)));
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-35 * Math.PI / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = '锐界幻境 MiragEdge';
  const metrics = ctx.measureText(text);
  const stepX = Math.max(metrics.width + fontSize * 2, fontSize * 8);
  const stepY = fontSize * 3;

  for (let y = -h; y < h * 2; y += stepY) {
    for (let x = -w; x < w * 2; x += stepX) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}

// 品牌文字角标（右下角，大图用）
function drawTextCorner(ctx, w, h, minDim) {
  const boxW = Math.max(120, Math.min(300, Math.round(minDim * 0.3)));
  const boxH = Math.round(boxW * 0.3);
  const padding = Math.max(8, Math.round(minDim * 0.015));
  const x = w - boxW - padding;
  const y = h - boxH - padding;

  ctx.save();
  // 渐变背景
  const grad = ctx.createLinearGradient(x, y, x + boxW, y);
  grad.addColorStop(0, 'rgba(224, 82, 82, 0)');
  grad.addColorStop(0.3, 'rgba(224, 82, 82, 0.06)');
  grad.addColorStop(1, 'rgba(224, 82, 82, 0.12)');
  ctx.fillStyle = grad;
  // 圆角矩形
  const r = Math.round(boxH * 0.15);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + boxW - r, y);
  ctx.quadraticCurveTo(x + boxW, y, x + boxW, y + r);
  ctx.lineTo(x + boxW, y + boxH - r);
  ctx.quadraticCurveTo(x + boxW, y + boxH, x + boxW - r, y + boxH);
  ctx.lineTo(x + r, y + boxH);
  ctx.quadraticCurveTo(x, y + boxH, x, y + boxH - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();

  // 文字
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.20;
  ctx.font = `bold ${Math.round(boxH * 0.45)}px sans-serif`;
  ctx.fillText('锐界幻境', x + boxW / 2, y + boxH * 0.4);
  ctx.globalAlpha = 0.10;
  ctx.font = `${Math.round(boxH * 0.22)}px sans-serif`;
  ctx.fillText('MiragEdge', x + boxW / 2, y + boxH * 0.75);
  ctx.restore();
}

// =============== 请求处理 ===============

async function handleWatermark(request, originalUrl, isRewrittenPath) {
  const cache = await caches.open(CACHE_NAME);

  // 1. 检查缓存（用 originalUrl 作为缓存键）
  const cacheKey = new Request(originalUrl);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 2. 准备 Referer
  //    SW 环境下 request.referrer 可能是 "about:client"（无效值）或空字符串
  //    需确保使用有效的 https URL 匹配 OSS Referer 白名单
  let referrerUrl = request.referrer;
  if (!referrerUrl || !referrerUrl.startsWith('http')) {
    referrerUrl = self.location.origin + '/';
  }

  // 3. 从 OSS 下载（cors 模式，需要读取内容做水印）
  //    cache: 'no-cache' 避免浏览器复用 <img> 标签的 non-cors 缓存响应
  //    （该响应不含 Access-Control-Allow-Origin 头，会导致 CORS 失败）
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
    //    返回 opaque 响应，<img> 可直接显示，但无法读取内容做水印
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

    // 7. 兜底 2: 重写路径 → 302 重定向到 OSS（浏览器直接加载，带正确 Referer）
    //          直接 URL → 透传原始请求
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
  // 只拦截映射表中存在的 URL
  if (url.hostname === 'oss.miragedge.top') {
    event.respondWith(
      loadMap().then(() => {
        // 去除 query/fragment 后比较
        const cleanUrl = url.origin + url.pathname;
        if (urlSet.has(cleanUrl) || urlSet.has(event.request.url)) {
          const originalUrl = urlSet.has(event.request.url) ? event.request.url : cleanUrl;
          return handleWatermark(event.request, originalUrl, false);
        }
        // 不在映射表中，透传
        return fetch(event.request);
      })
    );
    return;
  }
});
