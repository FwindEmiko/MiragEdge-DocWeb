// 页面特殊效果开关：全局单例状态 + localStorage 持久化
// - 默认开启；手机端（<768px）默认关闭
// - 用户偏好长期保存在 localStorage，并在 <html> 上同步 effects-disabled 类
// - SSR 与客户端首帧均为 true，真实偏好延迟到 onMounted 应用，杜绝水合不一致
import { ref } from 'vue'
import { inBrowser } from 'vitepress'

const STORAGE_KEY = 'miragedge-effects-enabled'

// 与 VitePress 移动端断点一致：<768px 视为手机
const isMobile = () =>
  inBrowser && window.matchMedia('(max-width: 767px)').matches

const defaultEnabled = () => !isMobile()

// SSR 与客户端首帧均为 true，保证水合一致
const effectsEnabled = ref(true)
// 装饰组件门控：SSR 与首帧为 false，onMounted 后置 true，避免水合不一致
const effectsMounted = ref(false)

function readPreference(): boolean {
  if (!inBrowser) return true
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {}
  // 未存过偏好时：手机默认关闭，桌面默认开启
  if (stored === null) return defaultEnabled()
  return stored === 'true'
}

function syncHtmlClass(v: boolean) {
  if (!inBrowser) return
  document.documentElement.classList.toggle('effects-disabled', !v)
}

/**
 * 在 layout.vue 的 onMounted 中调用：
 * 读取持久化偏好（含手机默认关闭），更新状态与 <html> class
 */
export function initEffects() {
  if (!inBrowser || effectsMounted.value) return
  effectsMounted.value = true
  const val = readPreference()
  effectsEnabled.value = val
  syncHtmlClass(val)
}

export function useEffectsToggle() {
  const toggleEffects = () => {
    effectsEnabled.value = !effectsEnabled.value
    syncHtmlClass(effectsEnabled.value)
    try {
      localStorage.setItem(STORAGE_KEY, String(effectsEnabled.value))
    } catch {}
  }
  return { effectsEnabled, effectsMounted, toggleEffects }
}

export { effectsEnabled, effectsMounted }
