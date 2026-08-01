<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { init3DTiltEffect } from '../js/feature.js'

const decorated = new Set<HTMLElement>()

let intersectionObserver: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null
let scanFrame: number | null = null

function resetFeatureCard(card: HTMLElement) {
  card.style.removeProperty('--rotate-x')
  card.style.removeProperty('--rotate-y')
  card.style.removeProperty('--bg-x')
  card.style.removeProperty('--bg-y')
}

function scanTargets() {
  scanFrame = null

  const targets = document.querySelectorAll<HTMLElement>(
    '.vp-doc h2, .vp-doc h3, .VPHome .VPFeature',
  )

  targets.forEach((target, index) => {
    if (target.dataset.atmosphereDecorated) return

    target.dataset.atmosphereDecorated = 'true'
    target.style.setProperty('--atmosphere-delay', `${Math.min(index, 12) * 26}ms`)
    target.classList.add('atmosphere-target')
    decorated.add(target)
    intersectionObserver?.observe(target)
  })

  init3DTiltEffect()
}

function scheduleScan() {
  if (scanFrame !== null) return
  scanFrame = requestAnimationFrame(scanTargets)
}

onMounted(() => {
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        const target = entry.target as HTMLElement
        target.classList.add('atmosphere-revealed')
        intersectionObserver?.unobserve(target)
      })
    },
    { rootMargin: '0px 0px -12%', threshold: 0.12 },
  )

  mutationObserver = new MutationObserver(scheduleScan)
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  scheduleScan()
})

onBeforeUnmount(() => {
  if (scanFrame !== null) cancelAnimationFrame(scanFrame)
  intersectionObserver?.disconnect()
  mutationObserver?.disconnect()

  decorated.forEach((target) => {
    target.classList.remove('atmosphere-target', 'atmosphere-revealed')
    target.style.removeProperty('--atmosphere-delay')
    delete target.dataset.atmosphereDecorated

    if (target.matches('.VPHome .VPFeature')) resetFeatureCard(target)
  })

  decorated.clear()
  intersectionObserver = null
  mutationObserver = null
  scanFrame = null
})
</script>

<template>
  <!-- 修复 hydration mismatch：空模板组件 SSR 输出 0 节点、客户端输出 1 个注释锚点，
       导致 router-wrapper 内后续节点整体错位，VitePress lean 模块水合失败清空正文。
       改为渲染一个隐藏占位 div，SSR 与客户端结构一致。 -->
  <div class="atmosphere-details" aria-hidden="true"></div>
</template>

<style scoped>
.atmosphere-details {
  display: none;
}
</style>
