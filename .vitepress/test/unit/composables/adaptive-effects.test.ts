import { describe, it, expect } from 'vitest'

// 纯函数测试：useAdaptiveEffects 中与 DOM 无关的判定逻辑
// 实际浏览器探针（rAF/PerformanceObserver/sessionStorage）在单测中不可靠，
// 这里只覆盖「信号 → 是否降级」的核心阈值逻辑。
const {
  evaluatePerformanceSignals,
  computeFrameMetrics,
  computeInteractionMetrics,
  isInteractionJank,
} = await import('../../../theme/composables/useAdaptiveEffects')

const emptyInteraction = () => ({ samples: 0, slowCount: 0, p90LatencyMs: 0 })

describe('computeFrameMetrics: 帧间隔统计', () => {
  it('空样本返回零值', () => {
    expect(computeFrameMetrics([])).toEqual({
      frames: 0,
      medianFrameMs: 0,
      p90FrameMs: 0,
      droppedRatio: 0,
    })
  })

  it('稳定 60fps 样本：中位 16.7ms，无掉帧', () => {
    const intervals = Array.from({ length: 40 }, () => 16.7)
    const metrics = computeFrameMetrics(intervals)

    expect(metrics.frames).toBe(40)
    expect(metrics.medianFrameMs).toBeCloseTo(16.7, 5)
    expect(metrics.p90FrameMs).toBeCloseTo(16.7, 5)
    expect(metrics.droppedRatio).toBe(0)
  })

  it('偶发长帧会计入掉帧比例', () => {
    const intervals = Array.from({ length: 20 }, () => 16.7)
    intervals.push(50, 60, 80)
    const metrics = computeFrameMetrics(intervals)

    expect(metrics.p90FrameMs).toBeGreaterThanOrEqual(50)
    expect(metrics.droppedRatio).toBeGreaterThan(0)
  })
})

describe('computeInteractionMetrics: 交互延迟统计', () => {
  it('过滤非有限值并统计慢交互', () => {
    const metrics = computeInteractionMetrics([20, 30, 95, 120, NaN, Infinity])

    expect(metrics.samples).toBe(4)
    expect(metrics.slowCount).toBe(2)
    expect(metrics.p90LatencyMs).toBe(120)
  })
})

describe('isInteractionJank: 交互期掉帧判定', () => {
  it('样本不足（frames < 12）不判定为掉帧', () => {
    expect(isInteractionJank({ frames: 8, medianFrameMs: 40, p90FrameMs: 80, droppedRatio: 0.6 })).toBe(false)
  })

  it('P90 帧间隔 >= 44ms 判定为掉帧', () => {
    expect(isInteractionJank({ frames: 20, medianFrameMs: 33, p90FrameMs: 46, droppedRatio: 0.2 })).toBe(true)
  })

  it('掉帧比例 >= 35% 判定为掉帧', () => {
    expect(isInteractionJank({ frames: 20, medianFrameMs: 25, p90FrameMs: 40, droppedRatio: 0.4 })).toBe(true)
  })

  it('健康帧率不判定为掉帧', () => {
    expect(isInteractionJank({ frames: 20, medianFrameMs: 16.7, p90FrameMs: 18, droppedRatio: 0.05 })).toBe(false)
  })
})

describe('evaluatePerformanceSignals: 降级判定', () => {
  it('健康设备（60fps、无长任务、无慢交互）不降级', () => {
    const verdict = evaluatePerformanceSignals({
      frame: {
        frames: 40,
        medianFrameMs: 16.7,
        p90FrameMs: 17.2,
        droppedRatio: 0.02,
      },
      longTasks: 0,
      longTaskTotalMs: 0,
      interaction: emptyInteraction(),
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1920 * 1080,
    })

    expect(verdict.slow).toBe(false)
  })

  it('严重掉帧（P90 >= 48ms）直接降级', () => {
    const verdict = evaluatePerformanceSignals({
      frame: { frames: 40, medianFrameMs: 33, p90FrameMs: 52, droppedRatio: 0.4 },
      longTasks: 0,
      longTaskTotalMs: 0,
      interaction: emptyInteraction(),
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1920 * 1080,
    })

    expect(verdict.slow).toBe(true)
    expect(verdict.reasons.length).toBeGreaterThan(0)
  })

  it('轻微掉帧 + 静态低配信号 → 降级', () => {
    const verdict = evaluatePerformanceSignals({
      frame: { frames: 40, medianFrameMs: 20, p90FrameMs: 44, droppedRatio: 0.22 },
      longTasks: 0,
      longTaskTotalMs: 0,
      interaction: emptyInteraction(),
      staticLowEnd: true,
      saveData: false,
      viewportPixels: 1024 * 768,
    })

    expect(verdict.slow).toBe(true)
  })

  it('轻微掉帧但无其它证据 → 不降级（避免误伤）', () => {
    const verdict = evaluatePerformanceSignals({
      frame: { frames: 40, medianFrameMs: 19, p90FrameMs: 42, droppedRatio: 0.21 },
      longTasks: 1,
      longTaskTotalMs: 60,
      interaction: emptyInteraction(),
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1920 * 1080,
    })

    expect(verdict.slow).toBe(false)
  })

  it('主线程长任务极端严重 → 降级', () => {
    const verdict = evaluatePerformanceSignals({
      frame: null,
      longTasks: 5,
      longTaskTotalMs: 420,
      interaction: emptyInteraction(),
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1920 * 1080,
    })

    expect(verdict.slow).toBe(true)
  })

  it('交互延迟极端（两笔慢交互）→ 降级', () => {
    const verdict = evaluatePerformanceSignals({
      frame: null,
      longTasks: 0,
      longTaskTotalMs: 0,
      interaction: { samples: 3, slowCount: 2, p90LatencyMs: 300 },
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1920 * 1080,
    })

    expect(verdict.slow).toBe(true)
  })

  it('样本不足（frames < 16）时帧信号不参与判定', () => {
    const verdict = evaluatePerformanceSignals({
      frame: { frames: 5, medianFrameMs: 100, p90FrameMs: 120, droppedRatio: 0.9 },
      longTasks: 0,
      longTaskTotalMs: 0,
      interaction: emptyInteraction(),
      staticLowEnd: false,
      saveData: false,
      viewportPixels: 1024 * 768,
    })

    expect(verdict.slow).toBe(false)
  })
})
