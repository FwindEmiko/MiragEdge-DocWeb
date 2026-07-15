// 右侧「本页目录」自动滚动跟随
// 问题：VitePress 默认 .aside-container 是 fixed + overflow-y:auto，但页面滚动
// 让 active 链接变化时，aside 容器本身不会自动滚动，导致长目录的 marker/active
// 项跑出 aside 可视区（被裁剪或不可见）。
// 方案：监听 window scroll（VitePress 的 active 由 scroll 驱动），当 active 链接
// 变化时，平滑滚动 aside 使 active 处于可视区舒适位置（约上 1/3 处），首末项自然
// 贴边。仅在 active 真正变化时介入，避免与用户手动滚动 aside 抢夺控制权。
import { onMounted, onUnmounted, watch } from 'vue'
import { inBrowser, useRoute } from 'vitepress'

export function useTocAutoScroll() {
  if (!inBrowser) return

  const route = useRoute()
  let lastActiveHref: string | null = null
  let scrollTimer: ReturnType<typeof setTimeout> | null = null
  let initTimer: ReturnType<typeof setTimeout> | null = null
  let animFrame: number | null = null

  // 取 aside 内所有顶层 outline 链接，用于判断 active 是否首/末项
  function getEdgeInfo(aside: HTMLElement, active: HTMLElement) {
    const root = aside.querySelector('.VPDocAsideOutline .root')
    if (!root) return { isFirst: false, isLast: false }
    // 顶层链接 = .root > li > .outline-link（不含嵌套子项）
    const topLinks = Array.from(
      root.querySelectorAll(':scope > li > .outline-link')
    ) as HTMLElement[]
    if (topLinks.length === 0) return { isFirst: false, isLast: false }
    return {
      isFirst: active === topLinks[0],
      isLast: active === topLinks[topLinks.length - 1]
    }
  }

  // 平滑滚动 aside 到目标 scrollTop（缓动动画，非瞬间跳变）
  function smoothScrollTo(aside: HTMLElement, target: number) {
    if (animFrame !== null) cancelAnimationFrame(animFrame)
    const start = aside.scrollTop
    const diff = target - start
    if (Math.abs(diff) < 1) {
      aside.scrollTop = target
      return
    }
    const duration = 320
    const startTime = performance.now()
    // easeOutCubic：先快后慢，自然减速
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    function step(now: number) {
      const p = Math.min((now - startTime) / duration, 1)
      aside.scrollTop = start + diff * ease(p)
      if (p < 1) {
        animFrame = requestAnimationFrame(step)
      } else {
        animFrame = null
      }
    }
    animFrame = requestAnimationFrame(step)
  }

  // 让 active 链接在 aside 可视区内处于舒适位置
  function scrollActiveIntoView() {
    const aside = document.querySelector('.aside-container') as HTMLElement | null
    if (!aside) return
    // 目录不超长则无需处理
    if (aside.scrollHeight <= aside.clientHeight) return
    const active = aside.querySelector('.outline-link.active') as HTMLElement | null
    if (!active) {
      // 无 active（通常页面回顶 scrollY<1 时 VitePress 清除 active）：
      // 平滑回滚目录到顶部，让目录整体回到最上方
      if (lastActiveHref !== null) {
        lastActiveHref = null
        smoothScrollTo(aside, 0)
      }
      return
    }
    const href = active.getAttribute('href')
    // active 未变化：不抢夺用户对 aside 的手动滚动
    if (href === lastActiveHref) return
    lastActiveHref = href

    const maxScroll = aside.scrollHeight - aside.clientHeight
    // active 相对 aside 内容顶部的偏移：累加 offsetTop 链直到 aside
    // （active.offsetParent 是 .root(relative)，需逐级累加到 aside）
    let activeTop = 0
    let node: HTMLElement | null = active
    while (node && node !== aside) {
      activeTop += node.offsetTop
      node = node.offsetParent as HTMLElement | null
    }
    const activeHeight = active.offsetHeight || 30
    // 目标：让 active 处于 aside 可视区上 1/3 处（视觉舒适，不贴边）
    let target = activeTop - Math.floor(aside.clientHeight / 3) + Math.floor(activeHeight / 2)

    // 边界处理：首项贴顶、末项贴底（目录整体在对应边缘）
    const { isFirst, isLast } = getEdgeInfo(aside, active)
    if (isFirst) {
      target = 0
    } else if (isLast) {
      target = maxScroll
    } else {
      // 夹紧到合法范围
      target = Math.max(0, Math.min(maxScroll, target))
    }

    smoothScrollTo(aside, target)
  }

  function onScroll() {
    if (scrollTimer) return
    scrollTimer = setTimeout(() => {
      scrollTimer = null
      scrollActiveIntoView()
    }, 80)
  }

  function reset() {
    lastActiveHref = null
    if (animFrame !== null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
    // 路由切换后 aside DOM 重建，复位滚动位置并延迟重新定位当前 active
    const aside = document.querySelector('.aside-container') as HTMLElement | null
    if (aside) aside.scrollTop = 0
    if (initTimer) clearTimeout(initTimer)
    initTimer = setTimeout(scrollActiveIntoView, 300)
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    initTimer = setTimeout(scrollActiveIntoView, 300)
  })

  // 路由变化时重置（页面切换后 outline 重建）
  watch(
    () => route.path,
    () => reset()
  )

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    if (scrollTimer) clearTimeout(scrollTimer)
    if (initTimer) clearTimeout(initTimer)
    if (animFrame !== null) cancelAnimationFrame(animFrame)
  })
}
