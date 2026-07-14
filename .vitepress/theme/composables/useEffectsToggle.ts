// 页面特殊效果开关：全局单例状态 + localStorage 持久化
// 默认开启；用户偏好长期保存在 localStorage，并在 <html> 上同步 effects-disabled 类
import { ref, onMounted } from 'vue'
import { inBrowser } from 'vitepress'

const STORAGE_KEY = 'miragedge-effects-enabled'

// SSR 与客户端首帧均使用默认 true，保证水合一致；
// 真实偏好在 onMounted 后再应用，避免水合不一致告警
const effectsEnabled = ref(true)

if (inBrowser) {
  onMounted(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {}

    // 移动端（宽度 <= 767px）默认关闭特效；桌面端默认开启
    const isMobile = window.innerWidth <= 767
    const defaultValue = isMobile ? false : true
    const initial = stored === null ? defaultValue : stored === 'true'

    effectsEnabled.value = initial
    document.documentElement.classList.toggle('effects-disabled', !initial)
  })
}

function persist(v: boolean) {
  if (!inBrowser) return
  document.documentElement.classList.toggle('effects-disabled', !v)
  try {
    localStorage.setItem(STORAGE_KEY, String(v))
  } catch {}
}

export function useEffectsToggle() {
  const toggleEffects = () => {
    effectsEnabled.value = !effectsEnabled.value
    persist(effectsEnabled.value)
  }
  return { effectsEnabled, toggleEffects }
}

export { effectsEnabled }
