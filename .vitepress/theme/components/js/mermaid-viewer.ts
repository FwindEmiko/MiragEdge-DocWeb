import { h, render } from 'vue'
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.2
const VIEWER_ATTRIBUTE = 'data-mermaid-viewer'

type IconComponent = typeof ZoomIn

type MermaidViewerState = {
  diagram: HTMLElement
  viewer: HTMLElement
  viewport: HTMLElement
  canvas: HTMLElement
  svg: SVGSVGElement
  toolbar: HTMLElement
  zoomOutput: HTMLElement
  fullscreenButton: HTMLButtonElement
  cleanup: () => void
  updateFullscreenButton: () => void
}

const viewers = new Map<HTMLElement, MermaidViewerState>()
let fullscreenListenerInstalled = false

function mountIcon(button: HTMLButtonElement, icon: IconComponent) {
  render(
    h(icon, {
      size: 17,
      strokeWidth: 2,
      'aria-hidden': 'true',
    }),
    button,
  )
}

function makeButton(
  icon: IconComponent,
  label: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'mermaid-viewer__button'
  button.dataset.tooltip = label
  button.title = label
  button.setAttribute('aria-label', label)
  mountIcon(button, icon)
  button.addEventListener('click', onClick)
  return button
}

function readViewBox(svg: SVGSVGElement) {
  const viewBox = svg.getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number)

  if (!viewBox || viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    return { width: 1, height: 1 }
  }

  return {
    width: Math.max(viewBox[2], 1),
    height: Math.max(viewBox[3], 1),
  }
}

function createViewer(diagram: HTMLElement, svg: SVGSVGElement): MermaidViewerState {
  const viewer = document.createElement('section')
  viewer.className = 'mermaid-viewer'
  viewer.setAttribute('role', 'region')
  viewer.setAttribute('aria-label', 'Mermaid 图表')
  viewer.setAttribute(VIEWER_ATTRIBUTE, 'true')

  const toolbar = document.createElement('div')
  toolbar.className = 'mermaid-viewer__toolbar'
  toolbar.setAttribute('role', 'toolbar')
  toolbar.setAttribute('aria-label', '图表查看工具')

  const viewport = document.createElement('div')
  viewport.className = 'mermaid-viewer__viewport'
  viewport.tabIndex = 0
  viewport.setAttribute('aria-label', 'Mermaid 图表画布，可滚动查看')

  const canvas = document.createElement('div')
  canvas.className = 'mermaid-viewer__canvas'

  const zoomOutput = document.createElement('output')
  zoomOutput.className = 'mermaid-viewer__zoom'
  zoomOutput.setAttribute('aria-live', 'polite')

  let state: MermaidViewerState
  let zoom = 1
  let baseWidth = 0
  let baseHeight = 0
  let drag: { x: number; y: number; scrollLeft: number; scrollTop: number } | null = null
  let pinchDistance = 0
  let pinchZoom = 1

  const viewBox = readViewBox(svg)
  const ratio = viewBox.width / viewBox.height

  const getBaseSize = () => {
    const availableWidth = Math.max(viewport.clientWidth - 24, 320)
    const readableWidth = viewBox.width * 0.45
    const upperBound = Math.max(960, availableWidth * 1.25)
    const width = Math.max(availableWidth, Math.min(readableWidth, upperBound))
    return { width, height: width / ratio }
  }

  const updateZoomOutput = () => {
    const percentage = `${Math.round(zoom * 100)}%`
    zoomOutput.value = percentage
    zoomOutput.textContent = percentage
    zoomOutput.setAttribute('aria-label', `当前缩放 ${percentage}`)
  }

  const applySize = () => {
    canvas.style.width = `${baseWidth * zoom}px`
    canvas.style.height = `${baseHeight * zoom}px`
    diagram.style.width = `${baseWidth}px`
    diagram.style.height = `${baseHeight}px`
    svg.style.width = `${baseWidth}px`
    svg.style.height = `${baseHeight}px`
    svg.style.maxWidth = 'none'
    svg.style.display = 'block'
    svg.style.transformOrigin = 'top left'
    svg.style.transform = zoom === 1 ? '' : `scale(${zoom})`
    updateZoomOutput()
  }

  const updateBaseSize = (preserveCenter = false) => {
    const next = getBaseSize()
    if (Math.abs(next.width - baseWidth) < 1) return

    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / Math.max(baseWidth * zoom, 1)
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / Math.max(baseHeight * zoom, 1)
    baseWidth = next.width
    baseHeight = next.height
    applySize()

    if (preserveCenter) {
      viewport.scrollLeft = centerX * baseWidth * zoom - viewport.clientWidth / 2
      viewport.scrollTop = centerY * baseHeight * zoom - viewport.clientHeight / 2
    }
  }

  const setZoom = (nextZoom: number, focusX?: number, focusY?: number) => {
    const previousZoom = zoom
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(2))))
    if (zoom === previousZoom) return

    const x = focusX ?? viewport.clientWidth / 2
    const y = focusY ?? viewport.clientHeight / 2
    const contentX = (viewport.scrollLeft + x) / previousZoom
    const contentY = (viewport.scrollTop + y) / previousZoom
    applySize()
    viewport.scrollLeft = contentX * zoom - x
    viewport.scrollTop = contentY * zoom - y
  }

  const reset = () => {
    zoom = 1
    applySize()
    viewport.scrollLeft = 0
    viewport.scrollTop = 0
  }

  const zoomAtViewportCenter = (amount: number) => {
    setZoom(zoom + amount, viewport.clientWidth / 2, viewport.clientHeight / 2)
  }

  const zoomInButton = makeButton(ZoomIn, '放大图表', () => zoomAtViewportCenter(ZOOM_STEP))
  const zoomOutButton = makeButton(ZoomOut, '缩小图表', () => zoomAtViewportCenter(-ZOOM_STEP))
  const resetButton = makeButton(RotateCcw, '重置视图', reset)
  const fullscreenButton = makeButton(Maximize2, '进入全屏', () => {
    if (document.fullscreenElement === viewer) {
      void document.exitFullscreen?.()
      return
    }
    void viewer.requestFullscreen?.()
  })

  toolbar.append(zoomOutButton, zoomOutput, zoomInButton, resetButton, fullscreenButton)
  viewport.appendChild(canvas)
  viewer.append(toolbar, viewport)
  diagram.setAttribute(VIEWER_ATTRIBUTE, 'true')

  const parent = diagram.parentElement
  if (!parent) throw new Error('Mermaid diagram has no parent')
  parent.insertBefore(viewer, diagram)
  canvas.appendChild(diagram)

  const updateFullscreenButton = () => {
    const isFullscreen = document.fullscreenElement === viewer
    const icon = isFullscreen ? Minimize2 : Maximize2
    render(null, fullscreenButton)
    mountIcon(fullscreenButton, icon)
    const label = isFullscreen ? '退出全屏' : '进入全屏'
    fullscreenButton.dataset.tooltip = label
    fullscreenButton.title = label
    fullscreenButton.setAttribute('aria-label', label)
    fullscreenButton.setAttribute('aria-pressed', String(isFullscreen))
  }

  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    const rect = viewport.getBoundingClientRect()
    setZoom(
      zoom * (event.deltaY < 0 ? 1 + ZOOM_STEP / 2 : 1 - ZOOM_STEP / 2),
      event.clientX - rect.left,
      event.clientY - rect.top,
    )
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomAtViewportCenter(ZOOM_STEP)
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      zoomAtViewportCenter(-ZOOM_STEP)
    } else if (event.key === '0') {
      event.preventDefault()
      reset()
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault()
      fullscreenButton.click()
    }
  }

  const onDoubleClick = (event: MouseEvent) => {
    if (toolbar.contains(event.target as Node)) return
    const rect = viewport.getBoundingClientRect()
    setZoom(zoom === 1 ? 1.5 : 1, event.clientX - rect.left, event.clientY - rect.top)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0 || toolbar.contains(event.target as Node)) return
    drag = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    }
    viewport.classList.add('is-dragging')
    viewport.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!drag) return
    event.preventDefault()
    viewport.scrollLeft = drag.scrollLeft - (event.clientX - drag.x)
    viewport.scrollTop = drag.scrollTop - (event.clientY - drag.y)
  }

  const stopDragging = (event: PointerEvent) => {
    if (!drag) return
    drag = null
    viewport.classList.remove('is-dragging')
    viewport.releasePointerCapture?.(event.pointerId)
  }

  const touchDistance = (touches: TouchList) => {
    const first = touches[0]
    const second = touches[1]
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
  }

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 2) return
    pinchDistance = touchDistance(event.touches)
    pinchZoom = zoom
    event.preventDefault()
  }

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 2 || pinchDistance === 0) return
    const rect = viewport.getBoundingClientRect()
    const first = event.touches[0]
    const second = event.touches[1]
    const focusX = (first.clientX + second.clientX) / 2 - rect.left
    const focusY = (first.clientY + second.clientY) / 2 - rect.top
    setZoom(pinchZoom * (touchDistance(event.touches) / pinchDistance), focusX, focusY)
    event.preventDefault()
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (event.touches.length < 2) pinchDistance = 0
  }

  viewport.addEventListener('wheel', onWheel, { passive: false })
  viewport.addEventListener('keydown', onKeyDown)
  viewport.addEventListener('dblclick', onDoubleClick)
  viewport.addEventListener('pointerdown', onPointerDown)
  viewport.addEventListener('pointermove', onPointerMove)
  viewport.addEventListener('pointerup', stopDragging)
  viewport.addEventListener('pointercancel', stopDragging)
  viewport.addEventListener('touchstart', onTouchStart, { passive: false })
  viewport.addEventListener('touchmove', onTouchMove, { passive: false })
  viewport.addEventListener('touchend', onTouchEnd)
  document.addEventListener('fullscreenchange', updateFullscreenButton)

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => updateBaseSize())
    : null
  resizeObserver?.observe(viewport)

  const size = getBaseSize()
  baseWidth = size.width
  baseHeight = size.height
  applySize()
  viewport.scrollLeft = 0
  viewport.scrollTop = 0
  updateFullscreenButton()

  state = {
    diagram,
    viewer,
    viewport,
    canvas,
    svg,
    toolbar,
    zoomOutput,
    fullscreenButton,
    updateFullscreenButton,
    cleanup: () => {
      resizeObserver?.disconnect()
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('keydown', onKeyDown)
      viewport.removeEventListener('dblclick', onDoubleClick)
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', stopDragging)
      viewport.removeEventListener('pointercancel', stopDragging)
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchmove', onTouchMove)
      viewport.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('fullscreenchange', updateFullscreenButton)
      render(null, zoomInButton)
      render(null, zoomOutButton)
      render(null, resetButton)
      render(null, fullscreenButton)
    },
  }

  return state
}

function cleanupDetachedViewers() {
  for (const [diagram, state] of viewers) {
    if (diagram.isConnected) continue
    state.cleanup()
    viewers.delete(diagram)
  }
}

function enhanceMermaidDiagrams() {
  cleanupDetachedViewers()
  const diagrams = Array.from(
    document.querySelectorAll<HTMLElement>(`.vp-doc .mermaid:not([${VIEWER_ATTRIBUTE}])`),
  )

  for (const diagram of diagrams) {
    const svg = diagram.querySelector<SVGSVGElement>('svg')
    if (!svg || viewers.has(diagram)) continue
    try {
      viewers.set(diagram, createViewer(diagram, svg))
    } catch (error) {
      console.warn('[MermaidViewer] 初始化失败:', error)
    }
  }
}

function installFullscreenListener() {
  if (fullscreenListenerInstalled) return
  fullscreenListenerInstalled = true
  document.addEventListener('fullscreenchange', () => {
    cleanupDetachedViewers()
    for (const state of viewers.values()) state.updateFullscreenButton()
  })
}

export function initMermaidViewers() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}

  installFullscreenListener()
  enhanceMermaidDiagrams()

  let scheduled = false
  const scheduleEnhance = () => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      enhanceMermaidDiagrams()
    })
  }

  const observer = typeof MutationObserver !== 'undefined'
    ? new MutationObserver(scheduleEnhance)
    : null
  observer?.observe(document.body, { childList: true, subtree: true })

  return () => {
    observer?.disconnect()
    cleanupDetachedViewers()
  }
}
