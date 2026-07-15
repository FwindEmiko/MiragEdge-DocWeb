import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

/**
 * Mock vitepress 的 inBrowser 为 true，使 composable 执行浏览器分支逻辑。
 * 使用 vi.mock 在模块加载前替换，确保被测模块拿到 mock 后的 inBrowser。
 */
vi.mock('vitepress', () => ({
  inBrowser: true,
}))

/**
 * 提供完整的 localStorage mock：happy-dom 20.x 在 Node 22 环境下
 * localStorage 方法可能缺失，这里用内存 Map 实现标准 Storage 接口。
 */
beforeAll(() => {
  const store = new Map<string, string>()
  const localStorageMock: Storage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, String(value)) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size },
  }
  vi.stubGlobal('localStorage', localStorageMock)
})

// 动态导入，确保在 mock 生效后加载被测模块
const {
  initEffectsToggleState,
  useEffectsToggle,
  effectsEnabled,
} = await import('../../../theme/composables/useEffectsToggle')

const STORAGE_KEY = 'miragedge-effects-enabled'

/**
 * useEffectsToggle 真实 composable 测试
 *
 * 测试目标：验证特效开关的状态初始化（localStorage/移动端默认/桌面端默认）、
 * 切换逻辑、DOM 类名同步与 localStorage 持久化。
 * composable 是项目实际使用的全局单例状态，测试覆盖其核心路径。
 */
describe('useEffectsToggle: 特效开关 composable', () => {
  beforeEach(() => {
    // 每个用例前重置环境
    localStorage.clear()
    document.documentElement.classList.remove('effects-disabled')
    // 默认桌面端视口宽度
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
    // 重置全局 ref 到默认值 true（SSR/首帧默认）
    effectsEnabled.value = true
  })

  describe('initEffectsToggleState: 状态初始化', () => {
    it('无存储偏好时桌面端应默认开启', () => {
      window.innerWidth = 1280
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(true)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
    })

    it('无存储偏好时移动端应默认关闭', () => {
      window.innerWidth = 375
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(false)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)
    })

    it('移动端断点 767px 应判定为移动端（默认关闭）', () => {
      window.innerWidth = 767
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(false)
    })

    it('桌面端断点 768px 应判定为桌面端（默认开启）', () => {
      window.innerWidth = 768
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(true)
    })

    it('localStorage 存储为 "true" 时应恢复开启状态', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(true)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
    })

    it('localStorage 存储为 "false" 时应恢复关闭状态', () => {
      localStorage.setItem(STORAGE_KEY, 'false')
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(false)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)
    })

    it('localStorage 存储值优先于移动端默认值', () => {
      // 移动端默认关闭，但用户明确存储了 true，应尊重用户偏好
      window.innerWidth = 375
      localStorage.setItem(STORAGE_KEY, 'true')
      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(true)
    })
  })

  describe('useEffectsToggle: 切换与持久化', () => {
    it('初始状态为 true 时 toggle 应切换为 false', () => {
      effectsEnabled.value = true
      const { toggleEffects } = useEffectsToggle()

      toggleEffects()

      expect(effectsEnabled.value).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)
    })

    it('当前状态为 false 时 toggle 应切换为 true', () => {
      effectsEnabled.value = false
      const { toggleEffects } = useEffectsToggle()

      toggleEffects()

      expect(effectsEnabled.value).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
    })

    it('连续 toggle 应在 true/false 间来回切换并同步持久化', () => {
      effectsEnabled.value = true
      const { toggleEffects } = useEffectsToggle()

      toggleEffects()
      expect(effectsEnabled.value).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false')

      toggleEffects()
      expect(effectsEnabled.value).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    })

    it('toggle 后 DOM 类名应同步更新', () => {
      effectsEnabled.value = true
      document.documentElement.classList.remove('effects-disabled')
      const { toggleEffects } = useEffectsToggle()

      toggleEffects()
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)

      toggleEffects()
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
    })

    it('useEffectsToggle 返回的 effectsEnabled 应与全局 ref 同步', () => {
      const { effectsEnabled: returnedRef } = useEffectsToggle()
      expect(returnedRef).toBe(effectsEnabled)
    })
  })
})
