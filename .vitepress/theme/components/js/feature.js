// 3D倾斜效果函数
export function init3DTiltEffect() {
  // SSR 守卫：VitePress 在 Node 端执行主题代码时无 document
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const cards = document.querySelectorAll('.VPHome .VPFeature');
  const resetCard = (card) => {
    card.style.removeProperty('--rotate-x')
    card.style.removeProperty('--rotate-y')
    card.style.removeProperty('--bg-x')
    card.style.removeProperty('--bg-y')
  }

  if (document.documentElement.classList.contains('effects-disabled')) {
    cards.forEach(resetCard)
    return
  }

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  cards.forEach(card => {
    // 幂等：避免 HMR 或重复调用时累积多份监听器
    if (card.dataset.tiltProcessed) return
    card.dataset.tiltProcessed = '1'
    let animationFrameId = null
    let pendingEvent = null

    card.addEventListener('mousemove', (e) => {
      pendingEvent = e
      if (animationFrameId !== null) return
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null
        if (document.documentElement.classList.contains('effects-disabled')) {
          resetCard(card)
          return
        }
        if (!pendingEvent || !card.isConnected) return
        const rect = card.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        const x = pendingEvent.clientX - rect.left
        const y = pendingEvent.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10

        card.style.setProperty('--rotate-x', `${rotateX}deg`)
        card.style.setProperty('--rotate-y', `${rotateY}deg`)
        card.style.setProperty('--bg-x', `${x}px`)
        card.style.setProperty('--bg-y', `${y}px`)
      })
    });

    // 鼠标离开时复位
    card.addEventListener('mouseleave', () => {
      pendingEvent = null
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      resetCard(card)
    });
  });
}
