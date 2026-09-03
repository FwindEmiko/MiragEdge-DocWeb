// 页面特殊效果开关：全局单例状态 + localStorage 持久化 + 自适应性能降级
// - 用户手动开关长期保存在 localStorage（miragedge-effects-enabled），优先级最高
// - 未设置过手动偏好时，按「移动端竖屏 / 静态低配信号」先给默认值
// - 自适应探针（useAdaptiveEffects）可以在本会话内自动降级，不写入 localStorage
import { ref } from 'vue'
import { inBrowser } from 'vitepress'

const STORAGE_KEY = 'miragedge-effects-enabled'

// SSR 与客户端首帧均使用默认 true，保证水合一致
const effectsEnabled = ref(true)

// 自适应降级是否正在接管（本会话内）。用户手动切换后即失效。
let autoModeActive = false
// 最近一次自适应降级的原因，便于 UI / 控制台提示
let autoReason = ''

/**
 * 静态低配信号：在无用户手动偏好时，让明显的低端设备在首帧前就默认关闭特效，
 * 避免「先渲染重特效、探针判定后再关闭」的闪动与白耗。
 *
 * 保守原则：只命中信号非常明确的设备（2GB 及以下内存 / <=2 逻辑核心 /
 * 开启流量节省）。老旧核显笔记本通常不满足这些硬信号，交由动态帧率探针判定。
 */
export function isStaticLowEndDevice(): boolean {
  if (!inBrowser || typeof navigator === 'undefined') return false

  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number
      hardwareConcurrency?: number
      connection?: { saveData?: boolean }
    }

    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true
    if (nav.connection?.saveData === true) return true
  } catch {
    // 任何读取失败都按非低配处理，避免误伤
  }

  return false
}

/**
 * 疑似低性能平板：横屏 + 主输入为触摸（hover:none & pointer:coarse）。
 * 华为/Kirin 等弱 GPU 平板属于此列；iPad 也命中，但属于「默认关闭、
 * 用户可手动恢复」的保守策略，而不是永久禁用。
 * 移动端竖屏（<=767px）仍由 isMobile 分支处理，这里只针对横屏。
 */
export function isSuspectTablet(): boolean {
  if (!inBrowser) return false
  try {
    return (
      window.innerWidth > 767 &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    )
  } catch {
    return false
  }
}

/** 用户是否已经手动设置过特效开关（有 localStorage 记录即为显式偏好） */
export function hasStoredEffectsPreference(): boolean {
  if (!inBrowser) return false
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/** 自适应降级是否在本会话内生效 */
export function isAutoModeActive(): boolean {
  return autoModeActive
}

/** 最近一次自适应降级的原因（未降级时为空串） */
export function getAutoEffectsReason(): string {
  return autoReason
}

function syncDomClass(enabled: boolean) {
  if (!inBrowser) return
  document.documentElement.classList.toggle('effects-disabled', !enabled)
  if (autoModeActive) {
    document.documentElement.dataset.effectsAuto = enabled ? 'on' : 'off'
  } else {
    delete document.documentElement.dataset.effectsAuto
  }
}

/**
 * 在组件 setup / onMounted 中调用，从 localStorage 恢复真实状态。
 * 必须在有活跃组件实例的上下文中调用（如 layout.vue 的 onMounted）。
 *
 * 默认值：移动端竖屏（<=767px）或静态低配设备 → 关闭；其余 → 开启。
 * 该逻辑需与 .vitepress/config.mts 的水合前内联脚本保持一致。
 */
export function initEffectsToggleState() {
  if (!inBrowser) return
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {}

  autoModeActive = false
  autoReason = ''

  const isMobile = window.innerWidth <= 767
  const defaultValue = isMobile || isStaticLowEndDevice() || isSuspectTablet() ? false : true
  const initial = stored === null ? defaultValue : stored === 'true'

  effectsEnabled.value = initial
  syncDomClass(initial)
}

/**
 * 自适应探针结果落地：本会话内自动关闭/开启特效，不写 localStorage。
 * - 用户已有手动偏好时不干预（返回 false，调用方可据此停止后续工作）
 * - 与当前状态一致时跳过，避免重复触发 DOM 操作与 Vue 响应式更新
 */
export function applyAutoEffects(enabled: boolean, reason = ''): boolean {
  if (!inBrowser) return false
  if (hasStoredEffectsPreference()) {
    autoModeActive = false
    autoReason = ''
    delete document.documentElement.dataset.effectsAuto
    return false
  }

  autoModeActive = true
  autoReason = reason

  if (effectsEnabled.value === enabled) {
    // 状态一致，仅同步 dataset 与原因（如静态低配默认关闭后的「探针确认」）
    syncDomClass(enabled)
    return true
  }

  effectsEnabled.value = enabled
  syncDomClass(enabled)

  if (!enabled && reason && typeof console !== 'undefined') {
    console.info(`[effects-auto] 已自动关闭页面特效（${reason}），可点击导航栏特效开关手动恢复`)
  }

  return true
}

function persist(v: boolean) {
  if (!inBrowser) return
  autoModeActive = false
  autoReason = ''
  syncDomClass(v)
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
