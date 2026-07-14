/**
 * Service Worker — 外部图片按需水印 + 缓存
 *
 * 拦截两类请求：
 *   1. 同源 /external-wm/* — 来自 SmartImage 组件（URL 已重写）
 *   2. 跨域 oss.miragedge.top/* — 来自 Markdown ![]() 图片（URL 未重写）
 *
 * 处理流程：
 *   1. 检查 Cache API → 命中则直接返回
 *   2. 未命中 → fetch 原始 OSS 图片 → Canvas 加水印 → 缓存 → 返回
 *   3. 失败 → 透传原始请求（无水印兜底）
 *
 * 前提：OSS 需配置 CORS 允许 miragedge.top，否则 fetch 跨域图片会失败。
 */

const CACHE_NAME = 'external-wm-v1';
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
 * 策略与构建时 watermark.mjs 一致：
 *   ≥16px → 斜向文字覆盖全图
 *   ≥64px → 右下角品牌角标
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

  drawTileWatermark(ctx, w, h, minDim);

  if (minDim >= 64) {
    drawCornerWatermark(ctx, w, h, minDim);
  }

  const type = blob.type || 'image/png';
  const outType = type.includes('jpeg') ? 'image/jpeg'
    : type.includes('webp') ? 'image/webp'
    : 'image/png';
  const quality = type.includes('jpeg') ? 0.92 : type.includes('webp') ? 0.90 : undefined;
  return canvas.convertToBlob({ type: outType, quality });
}

function drawTileWatermark(ctx, w, h, minDim) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-35 * Math.PI / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  const fontSize = Math.max(14, Math.round(minDim / 10));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = '锐界幻境 MiragEdge';
  const metrics = ctx.measureText(text);
  const stepX = Math.max(metrics.width + 60, minDim / 2);
  const stepY = Math.max(fontSize * 3, minDim / 2);

  for (let y = -h; y < h * 2; y += stepY) {
    for (let x = -w; x < w * 2; x += stepX) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}

function drawCornerWatermark(ctx, w, h, minDim) {
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#E05252';
  const fontSize = Math.max(10, Math.round(minDim * 0.035));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('MiragEdge', w - 10, h - 10);
  ctx.restore();
}

// =============== 请求处理 ===============

async function handleWatermark(request, originalUrl) {
  const cache = await caches.open(CACHE_NAME);

  // 1. 检查缓存（用 originalUrl 作为缓存键）
  const cacheKey = new Request(originalUrl);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 2. 从 OSS 下载（使用 cors 模式）
  try {
    const res = await fetch(originalUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const contentType = blob.type || 'image/png';

    // 3. Canvas 加水印
    let watermarkedBlob;
    try {
      watermarkedBlob = await addWatermark(blob);
    } catch (e) {
      console.warn('[SW] 水印失败，返回原图:', originalUrl, e);
      watermarkedBlob = blob;
    }

    // 4. 构建响应并缓存
    const response = new Response(watermarkedBlob, {
      headers: {
        'Content-Type': watermarkedBlob.type || contentType,
        'Cache-Control': 'max-age=31536000, immutable',
      }
    });
    cache.put(cacheKey, response.clone());
    return response;
  } catch (e) {
    console.error('[SW] 下载失败，透传原始请求:', originalUrl, e);
    // 5. 失败兜底：透传原始请求（无水印）
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
        return handleWatermark(event.request, originalUrl);
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
          return handleWatermark(event.request, originalUrl);
        }
        // 不在映射表中，透传
        return fetch(event.request);
      })
    );
    return;
  }
});
