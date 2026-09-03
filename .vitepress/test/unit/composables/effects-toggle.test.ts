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
 * 注意：afterEach 里的 vi.unstubAllGlobals() 会清除 stub，因此需要在
 * 每个测试前重新安装。
 */
function installLocalStorageMock() {
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
}

beforeAll(() => {
  installLocalStorageMock()
})

// 动态导入，确保在 mock 生效后加载被测模块
const {
  initEffectsToggleState,
  useEffectsToggle,
  effectsEnabled,
  isStaticLowEndDevice,
  isSuspectTablet,
  hasStoredEffectsPreference,
  isAutoModeActive,
  getAutoEffectsReason,
  applyAutoEffects,
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
    document.documentElement.classList.remove('effects-disabled')
    delete document.documentElement.dataset.effectsAuto
    vi.unstubAllGlobals()
    installLocalStorageMock()
    localStorage.clear()
    // 默认桌面端视口宽度
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
    // 重置全局 ref 到默认值 true（SSR/首帧默认）
    effectsEnabled.value = true
    // 通过初始化重置模块内部的自适应状态（autoModeActive/autoReason）
    initEffectsToggleState()
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

describe('useEffectsToggle: 自适应性能降级', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('effects-disabled')
    delete document.documentElement.dataset.effectsAuto
    vi.unstubAllGlobals()
    installLocalStorageMock()
    localStorage.clear()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
    effectsEnabled.value = true
    initEffectsToggleState()
  })

  describe('isStaticLowEndDevice: 静态低配信号', () => {
    it('无任何低配信号时应返回 false', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        connection: { saveData: false },
      })
      expect(isStaticLowEndDevice()).toBe(false)
    })

    it('deviceMemory <= 2 时应判定为低配', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 2,
        hardwareConcurrency: 8,
      })
      expect(isStaticLowEndDevice()).toBe(true)
    })

    it('hardwareConcurrency <= 2 时应判定为低配', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 4,
        hardwareConcurrency: 2,
      })
      expect(isStaticLowEndDevice()).toBe(true)
    })

    it('开启流量节省模式时应判定为低配', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 4,
        hardwareConcurrency: 4,
        connection: { saveData: true },
      })
      expect(isStaticLowEndDevice()).toBe(true)
    })

    it('信号缺失（undefined）时按非低配处理', () => {
      vi.stubGlobal('navigator', { userAgent: 'test' })
      expect(isStaticLowEndDevice()).toBe(false)
    })
  })

  describe('isSuspectTablet: 横屏触摸平板检测', () => {
    const coarseMedia = {
      matches: true,
      media: '(hover: none) and (pointer: coarse)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    it('横屏 + 粗指针主输入 → 判定为疑似平板', () => {
      window.innerWidth = 1280
      ;(window.matchMedia as any).mockImplementation((query: string) => ({
        ...coarseMedia,
        media: query,
        matches: query === '(hover: none) and (pointer: coarse)',
      }))

      expect(isSuspectTablet()).toBe(true)
    })

    it('竖屏宽度（<=767px）不算横屏平板', () => {
      window.innerWidth = 700
      ;(window.matchMedia as any).mockImplementation((query: string) => ({
        ...coarseMedia,
        media: query,
        matches: true,
      }))

      expect(isSuspectTablet()).toBe(false)
    })

    it('精细指针（鼠标）设备不算疑似平板', () => {
      window.innerWidth = 1280
      ;(window.matchMedia as any).mockImplementation((query: string) => ({
        ...coarseMedia,
        media: query,
        matches: false,
      }))

      expect(isSuspectTablet()).toBe(false)
    })
  })

  describe('hasStoredEffectsPreference: 显式偏好检测', () => {
    it('无记录时返回 false', () => {
      expect(hasStoredEffectsPreference()).toBe(false)
    })

    it('有记录时返回 true', () => {
      localStorage.setItem(STORAGE_KEY, 'false')
      expect(hasStoredEffectsPreference()).toBe(true)
    })
  })

  describe('applyAutoEffects: 探针结果落地', () => {
    it('无显式偏好时自动关闭特效并同步 DOM，但不写入 localStorage', () => {
      const applied = applyAutoEffects(false, '帧率不达标')

      expect(applied).toBe(true)
      expect(effectsEnabled.value).toBe(false)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)
      expect(document.documentElement.dataset.effectsAuto).toBe('off')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(isAutoModeActive()).toBe(true)
      expect(getAutoEffectsReason()).toBe('帧率不达标')
    })

    it('自动关闭后可自动恢复开启', () => {
      applyAutoEffects(false, '帧率不达标')
      const applied = applyAutoEffects(true, '')

      expect(applied).toBe(true)
      expect(effectsEnabled.value).toBe(true)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
      expect(document.documentElement.dataset.effectsAuto).toBe('on')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('已有显式偏好时不干预并返回 false', () => {
      localStorage.setItem(STORAGE_KEY, 'true')
      effectsEnabled.value = true

      const applied = applyAutoEffects(false, '帧率不达标')

      expect(applied).toBe(false)
      expect(effectsEnabled.value).toBe(true)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(false)
      expect(document.documentElement.dataset.effectsAuto).toBeUndefined()
      expect(isAutoModeActive()).toBe(false)
    })

    it('自动降级后用户手动切换应清除自动接管状态并持久化', () => {
      applyAutoEffects(false, '帧率不达标')
      const { toggleEffects } = useEffectsToggle()

      toggleEffects()

      expect(effectsEnabled.value).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
      expect(document.documentElement.dataset.effectsAuto).toBeUndefined()
      expect(isAutoModeActive()).toBe(false)
      expect(getAutoEffectsReason()).toBe('')
    })
  })

  describe('initEffectsToggleState: 静态低配默认关闭', () => {
    it('桌面宽度但静态低配设备默认关闭', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 2,
        hardwareConcurrency: 8,
      })
      window.innerWidth = 1280

      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(false)
      expect(document.documentElement.classList.contains('effects-disabled')).toBe(true)
    })

    it('静态低配时显式开启偏好仍优先', () => {
      vi.stubGlobal('navigator', {
        ...window.navigator,
        deviceMemory: 2,
        hardwareConcurrency: 8,
      })
      localStorage.setItem(STORAGE_KEY, 'true')

      initEffectsToggleState()

      expect(effectsEnabled.value).toBe(true)
    })
  })
})
