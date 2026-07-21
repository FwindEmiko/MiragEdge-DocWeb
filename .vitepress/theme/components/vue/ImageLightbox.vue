<template>
  <Teleport to="body">
    <div
      v-if="mounted"
      ref="rootRef"
      class="lightbox-root"
      :class="rootClasses"
      :style="rootStyle"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      @click.self="onBackdropClick"
      @wheel.prevent="onWheel"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @dblclick="onDblClick"
    >
      <!-- 图片舞台 -->
      <div class="lightbox-stage" @click.self="onBackdropClick">
        <!-- 加载中状态 -->
        <div v-if="loading && !error" class="lightbox-state">
          <div class="lightbox-state-icon"></div>
          <span>加载中…</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="lightbox-state is-error">
          <span class="lightbox-state-icon">⚠</span>
          <span>图片加载失败</span>
          <button class="lightbox-retry" @click="retry">重试</button>
        </div>

        <!-- 图片本体 -->
        <img
          v-show="!error"
          ref="imageRef"
          class="lightbox-image"
          :class="imageClasses"
          :src="currentSrc"
          :alt="currentAlt"
          @load="onImageLoad"
          @error="onImageError"
          @click.stop
          draggable="false"
        />
      </div>

      <!-- 缩放比例指示器 -->
      <div class="lightbox-zoom-indicator" :class="{ 'is-visible': showZoomIndicator }">
        {{ Math.round(scale * 100) }}%
      </div>

      <!-- 首次提示（仅桌面） -->
      <div v-if="showHint && !isMobile" class="lightbox-hint">
        滚轮缩放 · 双击切换 · ESC 关闭 · ← → 切换
      </div>

      <!-- 顶部工具栏：关闭 -->
      <div class="lightbox-controls lightbox-toolbar">
        <button
          class="lightbox-btn"
          title="关闭 (Esc)"
          aria-label="关闭"
          @click="close"
        >
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- 底部工具栏：导航 + 缩放 + 计数 -->
      <div class="lightbox-controls lightbox-bottombar">
        <!-- 上一张 -->
        <button
          v-if="hasMultiple"
          class="lightbox-btn"
          title="上一张 (←)"
          aria-label="上一张"
          :disabled="state.items.length <= 1"
          @click="prev"
        >
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <!-- 缩小 -->
        <button
          class="lightbox-btn"
          data-action="zoom-out"
          title="缩小 (-)"
          aria-label="缩小"
          :disabled="scale <= 1"
          @click="zoomOut"
        >
          <svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
        </button>

        <!-- 重置缩放 -->
        <button
          class="lightbox-btn"
          :class="{ 'is-active': scale !== 1 }"
          title="重置缩放"
          aria-label="重置缩放"
          @click="resetZoom"
        >
          <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>

        <!-- 放大 -->
        <button
          class="lightbox-btn"
          data-action="zoom-in"
          title="放大 (+)"
          aria-label="放大"
          :disabled="scale >= config.maxZoom"
          @click="zoomIn"
        >
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>

        <!-- 计数 -->
        <template v-if="hasMultiple">
          <div class="lightbox-divider"></div>
          <div class="lightbox-counter">
            <span class="lightbox-counter-current">{{ state.index + 1 }}</span>
            <span> / {{ state.items.length }}</span>
          </div>
        </template>

        <!-- 下一张 -->
        <button
          v-if="hasMultiple"
          class="lightbox-btn"
          title="下一张 (→)"
          aria-label="下一张"
          :disabled="state.items.length <= 1"
          @click="next"
        >
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <!-- 标题 -->
      <div v-if="currentCaption" class="lightbox-caption">
        {{ currentCaption }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLightbox } from '../../composables/useLightbox'

const { state, config, close: stateClose, next, prev } = useLightbox()

// ============ 基础引用与状态 ============
const rootRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

const mounted = ref(false)        // 控制 DOM 挂载（用于退场动画）
const isClosing = ref(false)      // 是否在退场中
const loading = ref(false)
const error = ref(false)
const showHint = ref(false)        // 首次提示
const showZoomIndicator = ref(false)

// 缩放与平移状态
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

// FLIP 动画进行中标志（避免 updateTransform 干扰）
const isFlipping = ref(false)
// FLIP 是否已执行（避免图片未加载时跳过，加载后重试）
const flipPerformed = ref(false)

// 拖拽中标志
const isDragging = ref(false)

// 切换动画方向
const slideDirection = ref<'left' | 'right' | null>(null)

// ============ 计算属性 ============
const rootClasses = computed(() => ({
  'is-open': !isClosing.value && state.open,
  'is-closing': isClosing.value,
}))

const rootStyle = computed(() => ({
  '--lightbox-bg': config.background,
  '--lightbox-blur': `${config.blur}px`,
}) as Record<string, string>)

const imageClasses = computed(() => ({
  'is-zoomed': scale.value > 1,
  'is-dragging': isDragging.value,
  'is-entering-right': slideDirection.value === 'right',
  'is-entering-left': slideDirection.value === 'left',
}))

const hasMultiple = computed(() => state.items.length > 1)

const currentItem = computed(() => state.items[state.index] || null)

const currentSrc = computed(() => currentItem.value?.src || '')

const currentAlt = computed(() => currentItem.value?.alt || '图片预览')

const currentCaption = computed(() => currentItem.value?.caption || '')

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
})

// ============ 动画时长（尊重 prefers-reduced-motion） ============
const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
// reduced-motion 下动画时长 ~0，否则与 CSS --duration-slow 对齐（320ms）
const ANIM_MS = prefersReducedMotion ? 1 : 320

// isOpening 标志：区分「初始打开」与「同组切换」
// 初始打开时 state.index 可能从 0 变为非 0（如点击同组第二张图片），
// 此时不应触发滑动动画，否则会与 FLIP 入场动画冲突
let isOpening = false

// ============ 核心：同步 transform 到 DOM ============
/**
 * 将当前 scale/translate 同步到 imageRef 的 inline style
 * 在 FLIP 动画期间（isFlipping=true）跳过，避免覆盖 FLIP transform
 */
function updateTransform() {
  if (isFlipping.value) return
  const img = imageRef.value
  if (!img) return
  img.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}

// 监听 scale/translate 变化，同步到 DOM
watch([scale, translateX, translateY], () => {
  updateTransform()
})

// ============ 监听 state.openId 触发入场 ============
// 使用 openId 而非 open：当用户在退场动画期间（state.open 仍为 true）
// 再次点击图片时，open() 会递增 openId，此处可靠触发重新入场
watch(
  () => state.openId,
  async () => {
    if (!state.open) return
    // 如果正在退场中，中断关闭流程
    if (isClosing.value) {
      // 标记当前 closeToken 为 aborted，让 closeLightbox 的 await 后不再继续
      closeToken.aborted = true
      isClosing.value = false
      // 清除退场动画残留的 inline style
      const img = imageRef.value
      if (img) {
        img.style.transition = 'none'
        img.style.transform = ''
        img.style.opacity = ''
      }
    }
    await openLightbox()
  }
)

// 监听 index 变化，处理同组切换
watch(
  () => state.index,
  (newIdx, oldIdx) => {
    // isOpening 期间跳过：初始打开时 index 可能从 0 变为非 0，
    // 此时应由 openLightbox 的 FLIP 入场接管，不应触发滑动切换动画
    if (isOpening) return
    if (!state.open || oldIdx === undefined) return
    const total = state.items.length
    if (total <= 1) return

    // 判断切换方向
    const isWrapForward = oldIdx === total - 1 && newIdx === 0
    const isWrapBackward = oldIdx === 0 && newIdx === total - 1
    if (isWrapForward) slideDirection.value = 'right'
    else if (isWrapBackward) slideDirection.value = 'left'
    else slideDirection.value = newIdx > oldIdx ? 'right' : 'left'

    // 重置状态
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    loading.value = true
    error.value = false

    // 切换动画结束后清除 class
    setTimeout(() => {
      slideDirection.value = null
    }, ANIM_MS)
  }
)

// ============ 入场流程 ============
let hasShownHint = false

async function openLightbox() {
  // 标记正在初始打开，阻止 state.index watch 触发滑动动画
  // 此标志在 await nextTick() 后清除（此时 index watch 已在当前 tick 执行完毕）
  isOpening = true

  // 重置状态
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  loading.value = true
  error.value = false
  isClosing.value = false
  isFlipping.value = false
  flipPerformed.value = false
  slideDirection.value = null
  showHint.value = false

  // 挂载 DOM
  mounted.value = true

  // 锁定 body 滚动
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  await nextTick()
  // index watch 已在当前 tick 执行完毕，释放标志
  isOpening = false

  // FLIP 入场：用 rAF 等待图片元素完成布局
  const origin = state.originEl
  if (origin) {
    requestAnimationFrame(() => {
      performFlipEnter(origin)
    })
  }

  // 首次提示（仅一次）
  if (!hasShownHint && !isMobile.value) {
    showHint.value = true
    hasShownHint = true
    setTimeout(() => {
      showHint.value = false
    }, 2400)
  }
}

/**
 * FLIP 入场动画
 * First: 触发元素的 getBoundingClientRect()
 * Last: 大图当前位置的 getBoundingClientRect()
 * Invert: 用 inline transform 把大图"瞬间"移到 First 位置
 * Play: 下一帧清空 inline transform，启用过渡让大图回到 Last 位置
 */
function performFlipEnter(originEl: HTMLElement) {
  const img = imageRef.value
  if (!img) return

  // First / Last
  const firstRect = originEl.getBoundingClientRect()
  const lastRect = img.getBoundingClientRect()

  // 如果大图尺寸为 0（图片还没加载完成），跳过 FLIP
  // 等 onImageLoad 触发后重试
  if (lastRect.width === 0 || lastRect.height === 0) {
    return
  }

  flipPerformed.value = true

  const dx = firstRect.left + firstRect.width / 2 - (lastRect.left + lastRect.width / 2)
  const dy = firstRect.top + firstRect.height / 2 - (lastRect.top + lastRect.height / 2)
  const sx = firstRect.width / lastRect.width || 0.01
  const sy = firstRect.height / lastRect.height || 0.01

  // Invert：同步设置 inline style（禁用过渡），阻止 watch 干扰
  isFlipping.value = true
  img.style.transition = 'none'
  img.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
  img.style.opacity = '0.5'

  // 强制 reflow 确保 Invert 状态被浏览器捕获
  void img.offsetWidth

  // Play：下一帧切换到 Last 位置，启用过渡
  requestAnimationFrame(() => {
    img.style.transition = 'transform var(--duration-slow) var(--ease-out-expo), opacity var(--duration-slow) var(--ease-out-expo)'
    img.style.transform = `translate(0px, 0px) scale(${scale.value})`
    img.style.opacity = '1'

    // 过渡结束后释放 isFlipping，让 watch 接管后续 transform 同步
    setTimeout(() => {
      isFlipping.value = false
      if (img) img.style.transition = ''
    }, ANIM_MS)
  })
}

/**
 * 退场动画：反向 FLIP，从当前位置过渡回触发元素位置
 */
function performFlipExit(): Promise<void> {
  return new Promise((resolve) => {
    const img = imageRef.value
    const origin = state.originEl
    if (!img || !origin) {
      resolve()
      return
    }

    // 阻止 watch 干扰退场 transform
    isFlipping.value = true

    const firstRect = img.getBoundingClientRect()
    const lastRect = origin.getBoundingClientRect()

    const dx = lastRect.left + lastRect.width / 2 - (firstRect.left + firstRect.width / 2)
    const dy = lastRect.top + lastRect.height / 2 - (firstRect.top + firstRect.height / 2)
    const sx = lastRect.width / firstRect.width || 0.01
    const sy = lastRect.height / firstRect.height || 0.01

    img.style.transition = 'transform var(--duration-slow) var(--ease-out-expo), opacity var(--duration-slow) var(--ease-out-expo)'
    img.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    img.style.opacity = '0.4'

    setTimeout(() => {
      resolve()
    }, ANIM_MS)
  })
}

// ============ 退场流程 ============
// 退场中断 token：每次 closeLightbox 创建新 token，watch openId 中断时标记 aborted
let closeToken = { aborted: false }

async function closeLightbox() {
  if (isClosing.value) return
  isClosing.value = true
  closeToken = { aborted: false }
  const token = closeToken

  // 执行 FLIP 退场
  await performFlipExit()

  // 如果退场期间被用户重新打开中断，不继续关闭流程
  if (token.aborted) {
    isClosing.value = false
    return
  }

  // 恢复 body 滚动
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  // 触发 state close（清空数据）
  stateClose()

  // 等数据清空后再卸载 DOM
  await nextTick()
  mounted.value = false
  isClosing.value = false
  isFlipping.value = false
}

function close() {
  closeLightbox()
}

// ============ 图片加载事件 ============
function onImageLoad() {
  loading.value = false
  error.value = false
  // 如果 FLIP 还没执行（图片刚才才加载完），现在重试
  if (!flipPerformed.value && state.originEl) {
    nextTick(() => {
      requestAnimationFrame(() => {
        if (state.originEl && !flipPerformed.value) {
          performFlipEnter(state.originEl)
        }
      })
    })
  }
}

function onImageError() {
  loading.value = false
  error.value = true
}

function retry() {
  if (!imageRef.value) return
  loading.value = true
  error.value = false
  const src = currentSrc.value
  const sep = src.includes('?') ? '&' : '?'
  imageRef.value.src = `${src}${sep}_r=${Date.now()}`
}

// ============ 缩放控制 ============
const ZOOM_STEP = 0.2

function zoomIn() {
  setScale(scale.value + ZOOM_STEP)
}

function zoomOut() {
  setScale(scale.value - ZOOM_STEP)
}

function resetZoom() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  flashZoomIndicator()
}

function setScale(next: number, originX?: number, originY?: number) {
  const clamped = Math.max(1, Math.min(config.maxZoom, next))
  if (originX === undefined || originY === undefined) {
    scale.value = clamped
    if (clamped === 1) {
      translateX.value = 0
      translateY.value = 0
    }
  } else {
    // 以鼠标位置为原点缩放
    const oldScale = scale.value
    if (clamped === oldScale) return
    const img = imageRef.value
    if (!img) {
      scale.value = clamped
      return
    }
    const rect = img.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const ox = originX - cx
    const oy = originY - cy
    // 缩放后保持鼠标点视觉位置不变
    const ratio = clamped / oldScale
    translateX.value = translateX.value + ox * (1 - ratio)
    translateY.value = translateY.value + oy * (1 - ratio)
    scale.value = clamped
  }
  flashZoomIndicator()
}

let zoomIndicatorTimer: number | null = null
function flashZoomIndicator() {
  showZoomIndicator.value = true
  if (zoomIndicatorTimer) clearTimeout(zoomIndicatorTimer)
  zoomIndicatorTimer = window.setTimeout(() => {
    showZoomIndicator.value = false
  }, 1200)
}

// ============ 滚轮缩放 ============
function onWheel(e: WheelEvent) {
  if (!config.wheelZoom) return
  // preventDefault 已通过 @wheel.prevent 处理
  const delta = -e.deltaY * 0.002
  const next = scale.value + delta * scale.value
  setScale(next, e.clientX, e.clientY)
}

// ============ 双击切换 1x/2x ============
function onDblClick(e: MouseEvent) {
  if (!config.dblClickZoom) return
  // dblclick 会先触发两次 click，但因 imageRef 上是 @click.stop，click 不会冒泡到 root
  // 这里 dblclick 在 root 上监听，需要阻止默认选中文本
  if (scale.value > 1) {
    resetZoom()
  } else {
    setScale(2, e.clientX, e.clientY)
  }
}

// ============ 拖拽（桌面） ============
let dragStartX = 0
let dragStartY = 0
let dragStartTranslateX = 0
let dragStartTranslateY = 0

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  // 缩放 = 1 时不允许拖拽（避免与点击背景关闭冲突）
  if (scale.value <= 1) return
  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartTranslateX = translateX.value
  dragStartTranslateY = translateY.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  translateX.value = dragStartTranslateX + (e.clientX - dragStartX)
  translateY.value = dragStartTranslateY + (e.clientY - dragStartY)
}

function onMouseUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

// ============ 触摸手势（移动端） ============
interface TouchState {
  startX: number
  startY: number
  startTranslateX: number
  startTranslateY: number
  startScale: number
  startDistance: number
  startCenterX: number
  startCenterY: number
  startTime: number
  isPinching: boolean
  isDragging: boolean
  isSwiping: boolean
}

let touchState: TouchState | null = null

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    const t = e.touches[0]
    touchState = {
      startX: t.clientX,
      startY: t.clientY,
      startTranslateX: translateX.value,
      startTranslateY: translateY.value,
      startScale: scale.value,
      startDistance: 0,
      startCenterX: t.clientX,
      startCenterY: t.clientY,
      startTime: Date.now(),
      isPinching: false,
      isDragging: scale.value > 1,
      isSwiping: scale.value === 1,
    }
  } else if (e.touches.length === 2) {
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY
    const distance = Math.hypot(dx, dy)
    const cx = (t1.clientX + t2.clientX) / 2
    const cy = (t1.clientY + t2.clientY) / 2
    touchState = {
      startX: cx,
      startY: cy,
      startTranslateX: translateX.value,
      startTranslateY: translateY.value,
      startScale: scale.value,
      startDistance: distance,
      startCenterX: cx,
      startCenterY: cy,
      startTime: Date.now(),
      isPinching: true,
      isDragging: false,
      isSwiping: false,
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (!touchState) return

  if (touchState.isPinching && e.touches.length === 2) {
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY
    const distance = Math.hypot(dx, dy)
    const ratio = distance / (touchState.startDistance || 1)
    const next = touchState.startScale * ratio
    setScale(next, touchState.startCenterX, touchState.startCenterY)
  } else if (touchState.isDragging && e.touches.length === 1) {
    const t = e.touches[0]
    translateX.value = touchState.startTranslateX + (t.clientX - touchState.startX)
    translateY.value = touchState.startTranslateY + (t.clientY - touchState.startY)
  } else if (touchState.isSwiping && e.touches.length === 1) {
    const t = e.touches[0]
    const dx = t.clientX - touchState.startX
    const dy = t.clientY - touchState.startY
    if (Math.abs(dy) > Math.abs(dx) && dy > 0) {
      // 下拉：图片轻微跟随
      if (imageRef.value) {
        imageRef.value.style.opacity = String(Math.max(0.3, 1 - dy / 400))
        imageRef.value.style.transform = `translateY(${dy * 0.5}px)`
      }
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // 横向滑动：图片轻微跟随
      if (imageRef.value) {
        imageRef.value.style.transform = `translateX(${dx}px)`
        imageRef.value.style.opacity = String(Math.max(0.5, 1 - Math.abs(dx) / 600))
      }
    }
  }
}

function onTouchEnd(e: TouchEvent) {
  if (!touchState) return

  const elapsed = Date.now() - touchState.startTime

  if (touchState.isSwiping) {
    // 重置图片 inline 样式（恢复由 watch 接管）
    const img = imageRef.value
    if (img) {
      img.style.opacity = ''
      img.style.transform = ''
    }
    // 重新同步 transform
    updateTransform()

    const t = e.changedTouches[0]
    const dx = t.clientX - touchState.startX
    const dy = t.clientY - touchState.startY
    const vy = dy / Math.max(elapsed, 1)

    // 下拉关闭
    if (dy > config.gapThreshold && vy > 0.5 && Math.abs(dy) > Math.abs(dx)) {
      touchState = null
      closeLightbox()
      return
    }

    // 横向滑动切换
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        next()
      } else {
        prev()
      }
    }
  }

  touchState = null
}

// ============ 背景点击关闭 ============
function onBackdropClick() {
  if (isDragging.value) return
  closeLightbox()
}

// ============ 键盘交互 ============
function onKeydown(e: KeyboardEvent) {
  if (!state.open) return
  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      closeLightbox()
      break
    case 'ArrowLeft':
      if (hasMultiple.value) {
        e.preventDefault()
        prev()
      }
      break
    case 'ArrowRight':
      if (hasMultiple.value) {
        e.preventDefault()
        next()
      }
      break
    case '+':
    case '=':
      e.preventDefault()
      zoomIn()
      break
    case '-':
    case '_':
      e.preventDefault()
      zoomOut()
      break
    case '0':
      e.preventDefault()
      resetZoom()
      break
  }
}

// ============ 生命周期 ============
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<script lang="ts">
// 全局组件注册名
export default {
  name: 'ImageLightbox',
}
</script>
