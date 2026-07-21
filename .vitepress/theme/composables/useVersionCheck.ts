// 构建版本检测 + chunk 加载失败兜底
// 目的：解决 ESA 边缘缓存旧 HTML + 源站新 assets 导致的 CSS/chunk 404 问题
//
// 工作流程：
// 1. 读取当前 HTML 的 <meta name="x-build-id"> 作为本页构建版本
// 2. 路由切换后 + 定时（每 10 分钟）以 no-store 拉取 /version.json
// 3. 版本不一致 → reload，用 sessionStorage 防止同一版本重复 reload
// 4. 资源加载失败 / 动态 import reject → reload 一次（session 级防循环）
// 5. 任何 fetch 失败静默忽略，绝不影响正常浏览
import { inBrowser, withBase } from 'vitepress'

const VERSION_URL = withBase('/version.json')
const VERSION_RELOAD_KEY = 'miragedge-version-reloaded-to'
const CHUNK_RELOAD_KEY = 'miragedge-chunk-reloaded'
const CHECK_INTERVAL = 10 * 60 * 1000  // 定时检测间隔：10 分钟
const FIRST_CHECK_DELAY = 30 * 1000    // 首次检测延迟：30s（避开首屏）

/** 读取当前 HTML 注入的构建版本号 */
function currentBuildId(): string | null {
  if (!inBrowser) return null
  const meta = document.querySelector('meta[name="x-build-id"]')
  return meta?.getAttribute('content') || null
}

/** 同一 session 内已为该版本 reload 过则跳过，避免 reload 循环 */
function shouldReload(targetId: string): boolean {
  if (!inBrowser) return false
  try {
    if (sessionStorage.getItem(VERSION_RELOAD_KEY) === targetId) return false
  } catch {}
  return true
}

function markReloaded(targetId: string) {
  try { sessionStorage.setItem(VERSION_RELOAD_KEY, targetId) } catch {}
}

/** 以 no-store 拉取最新构建版本号；失败返回 null（静默） */
async function fetchLatestBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.buildId === 'string' ? data.buildId : null
  } catch {
    return null
  }
}

/** 单次版本检测：发现新版本则强制 reload */
async function checkOnce() {
  if (!inBrowser) return
  const current = currentBuildId()
  if (!current) return              // 无版本标识，跳过（如 dev 模式）
  const latest = await fetchLatestBuildId()
  if (!latest) return               // 拉取失败，静默
  if (latest === current) return    // 已是最新
  if (!shouldReload(latest)) return // 已为该版本 reload 过
  markReloaded(latest)
  window.location.reload()
}

let timer: number | null = null
let routeCheckTimer: number | null = null
let chunkHandlerInstalled = false

/** 在 theme setup 的 onMounted 调用：启动定时版本检测 + chunk 失败兜底 */
export function initVersionCheck() {
  if (!inBrowser) return
  // 幂等守卫：dev HMR 或组件重挂时避免重复启动定时器与监听器
  if (timer !== null) return
  setTimeout(checkOnce, FIRST_CHECK_DELAY)
  timer = window.setInterval(checkOnce, CHECK_INTERVAL)
  initChunkErrorHandler()
}

/** 在 router.onAfterRouteChanged 调用：路由切换后延迟检测一次 */
export function checkVersionOnRouteChange() {
  if (!inBrowser) return
  // 快速连续路由切换时只保留最后一次检测，避免 timeout 堆积
  if (routeCheckTimer !== null) clearTimeout(routeCheckTimer)
  routeCheckTimer = window.setTimeout(() => {
    routeCheckTimer = null
    checkOnce()
  }, 2000)
}

/**
 * chunk / 资源加载失败兜底：自动 reload 一次以加载新版本
 * - <script> / <link> 加载失败不冒泡，需在捕获阶段监听 error
 * - 动态 import() 失败会触发 unhandledrejection
 * - sessionStorage 标记防循环：同一 session 只 reload 一次
 */
function initChunkErrorHandler() {
  if (!inBrowser || chunkHandlerInstalled) return
  chunkHandlerInstalled = true
  // 资源加载失败（捕获阶段）
  window.addEventListener('error', (event) => {
    const t = event.target as HTMLElement | null
    if (t instanceof HTMLScriptElement || t instanceof HTMLLinkElement) {
      try {
        if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
      } catch {}
      setTimeout(() => window.location.reload(), 0)
    }
  }, true)
  // 动态 import() reject
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const msg = (reason && (reason.message || String(reason))) || ''
    if (/Loading chunk|Failed to fetch dynamically imported module|ChunkLoadError|error loading dynamically imported module/i.test(msg)) {
      try {
        if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
      } catch {}
      window.location.reload()
    }
  })
}
