<script setup>
// 鼠标点击粒子特效组件 - 优化版本
// 问题修复:
// 1. 不再使用持续运行的动画循环，改为事件驱动
// 2. 使用时间戳跟踪而非 setTimeout，确保粒子正确清理
// 3. 添加 RAF 管理器，避免重复启动动画

import { ref, onMounted, onUnmounted } from 'vue'

const particles = ref([])
let idCounter = 0
let animationFrameId = null
let lastTime = 0
let mountTimer = null
let listenerAdded = false
const particleLifetime = 1000 // 粒子存活时间 ms

const handleClick = (e) => {
  const x = e.clientX
  const y = e.clientY
  const clickId = ++idCounter
  const particleCount = 8

  const newParticles = []
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
    const speed = 50 + Math.random() * 50
    const size = 3 + Math.random() * 4
    const hue = Math.random() * 60 + 150

    newParticles.push({
      id: clickId * 1000 + i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      hue,
      life: 1,
      birthTime: performance.now()
    })
  }

  particles.value.push(...newParticles)

  // 确保动画运行
  if (!animationFrameId) {
    lastTime = performance.now()
    animationFrameId = requestAnimationFrame(updateAnimations)
  }
}

const updateAnimations = (currentTime) => {
  const deltaTime = (currentTime - lastTime) / 1000 // 转换为秒
  lastTime = currentTime

  // 更新所有粒子
  particles.value = particles.value
    .map(p => ({
      ...p,
      x: p.x + p.vx * deltaTime,
      y: p.y + p.vy * deltaTime,
      vy: p.vy + 200 * deltaTime, // 重力
      life: 1 - (currentTime - p.birthTime) / particleLifetime
    }))
    .filter(p => p.life > 0)

  // 如果还有粒子，继续动画
  if (particles.value.length > 0) {
    animationFrameId = requestAnimationFrame(updateAnimations)
  } else {
    animationFrameId = null
  }
}

onMounted(() => {
  // 移动端不绑定全局 click 监听：触摸事件路径长，且点击粒子与触摸滚动易冲突
  // 移动端特效默认关闭，此处仅防御用户主动开启特效的低性能场景
  if (window.matchMedia('(max-width: 767px)').matches) return
  // 延迟显示，页面加载0.5秒后再启用点击特效
  mountTimer = setTimeout(() => {
    document.addEventListener('click', handleClick)
    listenerAdded = true
  }, 500)
})

onUnmounted(() => {
  if (mountTimer) {
    clearTimeout(mountTimer)
    mountTimer = null
  }
  // 只有真正添加过监听器时才移除
  if (listenerAdded) {
    document.removeEventListener('click', handleClick)
    listenerAdded = false
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})
</script>

<template>
  <div class="particle-effects">
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{
        left: p.x + 'px',
        top: p.y + 'px',
        width: p.size + 'px',
        height: p.size + 'px',
        opacity: p.life,
        background: `hsl(${p.hue}, 80%, 60%)`,
        boxShadow: `0 0 ${p.size * 2}px hsl(${p.hue}, 80%, 60%)`
      }"
    ></div>
  </div>
</template>

<style scoped>
.particle-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>
