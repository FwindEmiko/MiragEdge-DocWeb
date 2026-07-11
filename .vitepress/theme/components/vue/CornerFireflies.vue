<script setup>
// 萤火虫/光点组件
import { ref, onMounted, onBeforeUnmount } from 'vue'

const fireflies = ref([])
const isVisible = ref(false)
let showTimer = null

onMounted(() => {
  showTimer = setTimeout(() => {
    isVisible.value = true
  }, 500)

  // 生成萤火虫
  for (let i = 0; i < 12; i++) { // 减少数量
    fireflies.value.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
      xRange: 30 + Math.random() * 50,
      yRange: 20 + Math.random() * 30
    })
  }
})

onBeforeUnmount(() => {
  clearTimeout(showTimer)
})
</script>

<template>
  <div class="fireflies-container" :class="{ visible: isVisible }">
    <div
      v-for="fly in fireflies"
      :key="fly.id"
      class="firefly"
      :style="{
        left: fly.left + '%',
        top: fly.top + '%',
        width: fly.size + 'px',
        height: fly.size + 'px',
        animationDelay: fly.delay + 's',
        animationDuration: fly.duration + 's',
        '--x-range': fly.xRange + 'px',
        '--y-range': fly.yRange + 'px'
      }"
    ></div>
  </div>
</template>

<style scoped>
.fireflies-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9997;
  opacity: 0;
  transition: opacity 1s ease;
}

.fireflies-container.visible {
  opacity: 1;
}

.firefly {
  position: absolute;
  background: #fff9c4;
  border-radius: 50%;
  box-shadow:
    0 0 10px #fff59d,
    0 0 20px #ffee58,
    0 0 30px #ffeb3b;
  will-change: transform, opacity;
  animation: fly-around ease-in-out infinite;
}

@keyframes fly-around {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    transform: translate(var(--x-range), calc(var(--y-range) * -1));
    opacity: 0.8;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}
</style>
