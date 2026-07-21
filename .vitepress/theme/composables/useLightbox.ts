// .vitepress/theme/composables/useLightbox.ts
// 图片查看器（Lightbox）全局状态管理
// 单例模式：整个应用共享同一份响应式状态，避免多实例内存泄漏

import { reactive, markRaw } from 'vue'

export interface LightboxItem {
  /** 大图地址（通常为原图或 zoomSrc） */
  src: string
  /** 替代文本 */
  alt: string
  /** 标题（展示在底部） */
  caption: string
  /** 触发元素的原始 DOM 节点（用于 FLIP 入场动画） */
  originEl?: HTMLElement | null
}

export interface LightboxConfig {
  /** 最大缩放倍数 */
  maxZoom: number
  /** 是否启用双击缩放 */
  dblClickZoom: boolean
  /** 是否启用滚轮缩放 */
  wheelZoom: boolean
  /** 背景色 */
  background: string
  /** 背景模糊度（px） */
  blur: number
  /** 移动端下拉关闭阈值（px） */
  gapThreshold: number
}

/** 默认全局配置 */
const defaultConfig: LightboxConfig = {
  maxZoom: 4,
  dblClickZoom: true,
  wheelZoom: true,
  background: 'rgba(0, 0, 0, 0.92)',
  blur: 16,
  gapThreshold: 100,
}

/** 全局单例状态（模块级，整个应用共享） */
const state = reactive({
  /** 是否打开 */
  open: false,
  /** 打开信号：每次 open() 递增，用于可靠触发 watch（即使 state.open 已为 true） */
  openId: 0,
  /** 当前组图片列表 */
  items: [] as LightboxItem[],
  /** 当前索引 */
  index: 0,
  /** 触发元素（markRaw 避免 Vue 跟踪 DOM 节点） */
  originEl: null as HTMLElement | null,
  /** 配置 */
  config: { ...defaultConfig } as LightboxConfig,
})

/** 分组注册表：key 为组名，value 为该组的图片列表（顺序加入） */
const groupRegistry = new Map<string, LightboxItem[]>()

/**
 * 注册某个图片到分组（用于同组切换）
 * @returns 该图片在分组中的索引
 */
export function registerToGroup(group: string, item: LightboxItem): number {
  if (!group) return -1
  let list = groupRegistry.get(group)
  if (!list) {
    list = []
    groupRegistry.set(group, list)
  }
  // 通过 src 去重，避免重复注册
  const existing = list.findIndex((it) => it.src === item.src)
  if (existing >= 0) {
    // 更新已有项的 originEl（DOM 引用可能变化）
    list[existing] = { ...list[existing], ...item }
    return existing
  }
  list.push(item)
  return list.length - 1
}

/**
 * 从分组中移除某个图片（组件卸载时调用）
 */
export function unregisterFromGroup(group: string, src: string): void {
  if (!group) return
  const list = groupRegistry.get(group)
  if (!list) return
  const idx = list.findIndex((it) => it.src === src)
  if (idx >= 0) list.splice(idx, 1)
  if (list.length === 0) groupRegistry.delete(group)
}

/**
 * 更新全局配置（与默认配置合并）
 */
export function setLightboxConfig(partial: Partial<LightboxConfig>): void {
  Object.assign(state.config, partial)
}

/**
 * 打开查看器
 * @param item 当前图片信息
 * @param group 可选分组名（若提供则使用注册表中的同组列表）
 */
function open(item: LightboxItem, group?: string): void {
  // 取消任何待执行的 close 清空操作
  // 否则旧 close 的 setTimeout 会清空新打开的 items，导致 currentSrc 变空 → 加载失败
  if (closeTimer !== null) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  let items: LightboxItem[] = [item]
  let index = 0

  if (group) {
    const list = groupRegistry.get(group)
    if (list && list.length > 0) {
      items = list.map((it) => ({ ...it }))
      const idx = list.findIndex((it) => it.src === item.src)
      index = idx >= 0 ? idx : 0
    }
  }

  state.items = items
  state.index = index
  // markRaw 避免 Vue 把 DOM 节点变成响应式代理（会导致性能问题）
  state.originEl = markRaw(item.originEl || null) as HTMLElement | null
  state.open = true
  state.openId++ // 递增打开信号，触发 ImageLightbox 的 watch
}

/** close 延迟清空的 timer（用于 open 时取消，避免竞态） */
let closeTimer: number | null = null

/** 关闭查看器 */
function close(): void {
  state.open = false
  if (closeTimer !== null) clearTimeout(closeTimer)
  closeTimer = window.setTimeout(() => {
    // 双重保险：如果在退场动画期间被重新打开，不要清空数据
    if (state.open) {
      closeTimer = null
      return
    }
    state.items = []
    state.index = 0
    state.originEl = null
    closeTimer = null
  }, 340)
}

/** 下一张 */
function next(): void {
  if (state.items.length === 0) return
  state.index = (state.index + 1) % state.items.length
  // 同步 originEl 到新图片对应的注册节点（若有）
  const item = state.items[state.index]
  state.originEl = markRaw(item?.originEl || null) as HTMLElement | null
}

/** 上一张 */
function prev(): void {
  if (state.items.length === 0) return
  state.index = (state.index - 1 + state.items.length) % state.items.length
  const item = state.items[state.index]
  state.originEl = markRaw(item?.originEl || null) as HTMLElement | null
}

/** 跳转到指定索引 */
function goto(idx: number): void {
  if (idx < 0 || idx >= state.items.length) return
  state.index = idx
  const item = state.items[state.index]
  state.originEl = markRaw(item?.originEl || null) as HTMLElement | null
}

export function useLightbox() {
  return {
    state,
    config: state.config,
    open,
    close,
    next,
    prev,
    goto,
  }
}
