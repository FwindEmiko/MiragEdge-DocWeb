// 自适应特效降级：在客户端测量「帧率健康度 / 长任务 / 交互延迟 / 静态低配信号」，
// 由 useEffectsToggle.applyAutoEffects 落地为 effects-disabled（不写 localStorage）。
//
// 目标设备：横屏老旧平板、老旧核显笔记本等「视口宽度 > 767 但渲染能力弱」的设备。
// 这类设备不受移动端竖屏默认关闭策略保护，需要实测渲染表现后自动降级。
//
// 测量设计：
// 1. 先读 sessionStorage 缓存：同一标签页会话内不重复探测（保底 60s 过期）。
// 2. 静态信号（isStaticLowEndDevice）已由 useEffectsToggle 在首帧前处理。
// 3. 水合稳定后（requestIdleCallback / 200ms 兜底），连续采样 rAF 帧间隔 ~0.8s，
//    同时监听 longtask 与 event-timing（交互延迟）。
// 4. 汇总成 verdict：明确「掉帧」或「主线程长任务过多」才判定 slow，避免误伤
//    正常设备（例如首帧抖动、单次 GC）。
//
// 原则：
// - 用户手动设置过开关（localStorage）→ 完全跳过，绝不覆盖用户选择
// - prefers-reduced-motion → 跳过（CSS 已关闭动画，组件也不挂载）
// - 只降级不自动升级：静态低配设备即使探针通过也不自动开启特效，
//   避免「开启后立刻卡顿再关闭」的来回振荡；用户可手动恢复
import { inBrowser } from 'vitepress'
import {
  applyAutoEffects,
  hasStoredEffectsPreference,
  isStaticLowEndDevice,
} from './useEffectsToggle'

const SESSION_KEY = 'miragedge-effects-auto'
const SESSION_TTL_MS = 60_000

/** rAF 采样参数：8 帧热身 + 40 帧有效样本，超时兜底 */
const WARMUP_FRAMES = 8
const SAMPLE_FRAMES = 40
const SAMPLE_TIMEOUT_MS = 1600

/** 交互延迟样本阈值：event-timing 中 duration 超过该值的输入事件记为一笔慢交互 */
const SLOW_INTERACTION_MS = 90

export interface FrameMetrics {
  /** 有效帧间隔样本数 */
  frames: number
  /** 中位帧间隔（ms） */
  medianFrameMs: number
  /** P90 帧间隔（ms） */
  p90FrameMs: number
  /** 掉帧比例：帧间隔 > 1.75 倍中位间隔 的样本占比 */
  droppedRatio: number
}

export interface InteractionMetrics {
  samples: number
  slowCount: number
  p90LatencyMs: number
}

export interface ProbeSignals {
  frame: FrameMetrics | null
  longTasks: number
  longTaskTotalMs: number
  interaction: InteractionMetrics
  staticLowEnd: boolean
  saveData: boolean
  viewportPixels: number
}

export interface ProbeVerdict {
  slow: boolean
  reasons: string[]
}

interface CacheEntry {
  t: number
  slow: boolean
}

/** 纯函数：根据汇总信号判定是否降级（便于单测） */
export function evaluatePerformanceSignals(s: ProbeSignals): ProbeVerdict {
  const reasons: string[] = []

  const frameSlow =
    s.frame !== null &&
    s.frame.frames >= 16 &&
    (s.frame.p90FrameMs >= 40 || s.frame.droppedRatio >= 0.2)

  const frameVerySlow =
    s.frame !== null &&
    s.frame.frames >= 16 &&
    (s.frame.p90FrameMs >= 48 || s.frame.droppedRatio >= 0.35)

  const longTaskHeavy = s.longTasks >= 3 && s.longTaskTotalMs >= 200
  const longTaskExtreme = s.longTasks >= 5 && s.longTaskTotalMs >= 400
  const interactionSlow =
    s.interaction.samples >= 3 && s.interaction.p90LatencyMs >= 150
  const interactionExtreme = s.interaction.slowCount >= 2

  if (frameSlow) {
    reasons.push('帧间隔 P90=' + s.frame!.p90FrameMs.toFixed(1) + 'ms')
  }
  if (longTaskHeavy) {
    reasons.push('长任务 ' + s.longTasks + ' 次/' + s.longTaskTotalMs.toFixed(0) + 'ms')
  }
  if (interactionSlow) {
    reasons.push('交互延迟 P90=' + s.interaction.p90LatencyMs.toFixed(0) + 'ms')
  }

  // 判定：动态信号为主；静态低配仅在同时出现动态掉帧时加权确认
  let slow = false
  if (frameVerySlow) {
    slow = true
  } else if (frameSlow && (longTaskHeavy || interactionSlow || s.staticLowEnd || s.saveData)) {
    slow = true
  } else if (longTaskExtreme || interactionExtreme) {
    slow = true
  } else if (frameSlow && longTaskTotalMsCapped(s.longTaskTotalMs) >= 120 && s.longTasks >= 2) {
    // 掉帧 + 少量长任务的次强组合
    slow = true
  }

  if (slow && reasons.length === 0) {
    reasons.push('渲染性能不达标')
  }

  return { slow, reasons }
}

// 仅用于组合判定，避免误用极端阈值
function longTaskTotalMsCapped(total: number): number {
  return Number.isFinite(total) ? total : 0
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  )
  return sorted[index]
}

export function computeFrameMetrics(intervals: number[]): FrameMetrics {
  const samples = [...intervals]
  if (samples.length === 0) {
    return { frames: 0, medianFrameMs: 0, p90FrameMs: 0, droppedRatio: 0 }
  }

  const med = median(samples)
  const dropped = med > 0
    ? samples.filter((d) => d > med * 1.75).length / samples.length
    : 0

  return {
    frames: samples.length,
    medianFrameMs: med,
    p90FrameMs: percentile(samples, 90),
    droppedRatio: dropped,
  }
}

export function computeInteractionMetrics(latencies: number[]): InteractionMetrics {
  const samples = [...latencies].filter((v) => Number.isFinite(v))
  return {
    samples: samples.length,
    slowCount: samples.filter((v) => v >= SLOW_INTERACTION_MS).length,
    p90LatencyMs: percentile(samples, 90),
  }
}

/** 采样 rAF 帧间隔：先热身若干帧，再收集有效样本，超时兜底 */
function sampleFrames(
  warmup: number,
  maxSamples: number,
  timeoutMs: number,
): Promise<FrameMetrics> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      resolve({ frames: 0, medianFrameMs: 0, p90FrameMs: 0, droppedRatio: 0 })
      return
    }

    const intervals: number[] = []
    let rafId = 0
    let lastTimestamp = 0
    let frameCount = 0
    let timeoutId = 0

    const finish = () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      resolve(computeFrameMetrics(intervals))
    }

    const tick = (now: number) => {
      frameCount += 1
      if (frameCount === 1) {
        lastTimestamp = now
        rafId = requestAnimationFrame(tick)
        return
      }

      const delta = now - lastTimestamp
      lastTimestamp = now

      if (frameCount > warmup + 1 && delta > 0 && delta < 1000) {
        intervals.push(delta)
        if (intervals.length >= maxSamples) {
          finish()
          return
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    timeoutId = window.setTimeout(finish, timeoutMs)
  })
}

/** 会话缓存：避免 SPA 内多次挂载或同标签页刷新时重复探测 */
function readCache(): CacheEntry | null {
  if (!inBrowser) return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry
    if (typeof parsed?.t !== 'number' || typeof parsed?.slow !== 'boolean') return null
    if (Date.now() - parsed.t > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCache(slow: boolean) {
  if (!inBrowser) return
  try {
    const entry: CacheEntry = { t: Date.now(), slow }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry))
  } catch {}
}

function readStaticSignals() {
  if (!inBrowser) {
    return { staticLowEnd: false, saveData: false, viewportPixels: 0 }
  }

  let saveData = false
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    saveData = nav.connection?.saveData === true
  } catch {}

  const dpr = window.devicePixelRatio || 1
  return {
    staticLowEnd: isStaticLowEndDevice(),
    saveData,
    viewportPixels: window.innerWidth * window.innerHeight * dpr * dpr,
  }
}

/** 启动自适应降级探针。返回 cleanup（layout.vue onUnmounted 调用） */
export function initAdaptiveEffects(): () => void {
  if (!inBrowser) return () => {}

  // 用户已手动选择 → 不干预
  if (hasStoredEffectsPreference()) return () => {}

  // 系统级减少动态偏好 → CSS 已关闭动画，跳过
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  } catch {}

  // 会话缓存：命中 slow 则直接落地，命中 fast 则跳过
  const cached = readCache()
  if (cached) {
    if (cached.slow) {
      applyAutoEffects(false, '本会话渲染表现不达标（会话缓存）')
    }
    return () => {}
  }

  let disposed = false
  const longTasks: number[] = []
  const interactions: number[] = []
  let longTaskObserver: PerformanceObserver | null = null
  let eventObserver: PerformanceObserver | null = null
  let idleId = 0

  const cleanup = () => {
    disposed = true
    if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId)
    try {
      longTaskObserver?.disconnect()
      eventObserver?.disconnect()
    } catch {}
  }

  const tryObserveLongTasks = () => {
    if (typeof PerformanceObserver === 'undefined') return
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= 50) longTasks.push(entry.duration)
        }
      })
      longTaskObserver.observe({ type: 'longtask', buffered: true })
    } catch {
      longTaskObserver = null
    }
  }

  const tryObserveInteractions = () => {
    if (typeof PerformanceObserver === 'undefined') return
    try {
      eventObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 0) interactions.push(entry.duration)
        }
      })
      // 不传 durationThreshold：浏览器默认阈值（约 100ms）即可，
      // 我们只关心真正拖慢交互的事件，且能规避 TS 版本对扩展字段的报错
      eventObserver.observe({ type: 'event', buffered: true })
    } catch {
      eventObserver = null
    }
  }

  const run = async () => {
    if (disposed) return

    tryObserveLongTasks()
    tryObserveInteractions()

    const frame = await sampleFrames(WARMUP_FRAMES, SAMPLE_FRAMES, SAMPLE_TIMEOUT_MS)
    if (disposed) return

    const staticSignals = readStaticSignals()
    const interactionMetrics = computeInteractionMetrics(interactions)
    const verdict = evaluatePerformanceSignals({
      frame,
      longTasks: longTasks.length,
      longTaskTotalMs: longTasks.reduce((sum, v) => sum + v, 0),
      interaction: interactionMetrics,
      ...staticSignals,
    })

    writeCache(verdict.slow)
    if (verdict.slow) {
      applyAutoEffects(false, verdict.reasons.join('、') || '渲染性能不达标')
    }
    cleanup()
  }

  if (typeof requestIdleCallback === 'function') {
    idleId = requestIdleCallback(() => { void run() }, { timeout: 400 })
  } else {
    idleId = window.setTimeout(() => { void run() }, 200) as unknown as number
  }

  return cleanup
}
