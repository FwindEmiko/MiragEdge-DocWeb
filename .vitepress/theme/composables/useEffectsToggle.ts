// 页面特殊效果开关：全局单例状态 + localStorage 持久化
// 默认开启；用户偏好长期保存在 localStorage，并在 <html> 上同步 effects-disabled 类
// config.mts 中的内联 head 脚本会在 Vue 水合前同步设置 effects-disabled 类
import { ref } from 'vue'
import { inBrowser } from 'vitepress'

const STORAGE_KEY = 'miragedge-effects-enabled'

// 同步读取 localStorage 初始化状态，确保刷新后开关显示与实际状态一致
function getInitialValue(): boolean {
  if (!inBrowser) return true
  // 优先从 <html> class 读取（head 内联脚本已设置）
  if (document.documentElement.classList.contains('effects-disabled')) {
    return false
  }
  // 兜底：直接读 localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {}
  // 无存储记录时，移动端默认关闭
  return window.innerWidth > 767
}

const effectsEnabled = ref(getInitialValue())

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
