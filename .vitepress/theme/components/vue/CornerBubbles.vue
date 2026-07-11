<script setup>
// 漂浮泡泡组件
import { ref, onMounted, onBeforeUnmount } from 'vue'

const bubbles = ref([])
const isVisible = ref(false)

onMounted(() => {
  // 延迟显示，页面加载0.5秒后再出现
  setTimeout(() => {
    isVisible.value = true
  }, 500)

  // 生成泡泡
  for (let i = 0; i < 10; i++) { // 减少数量
    bubbles.value.push({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 15,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      hue: Math.random() * 60 + 170
    })
  }
})
</script>

<template>
  <div class="bubbles-container" :class="{ visible: isVisible }">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble"
      :style="{
        left: bubble.left + '%',
        width: bubble.size + 'px',
        height: bubble.size + 'px',
        animationDelay: bubble.delay + 's',
        animationDuration: bubble.duration + 's',
        background: `linear-gradient(135deg, hsla(${bubble.hue}, 70%, 70%, 0.3), hsla(${bubble.hue + 20}, 60%, 80%, 0.1))`
      }"
    ></div>
  </div>
</template>

<style scoped>
.bubbles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9996;
  overflow: hidden;
  opacity: 0;
  transition: opacity 1s ease;
}

.bubbles-container.visible {
  opacity: 1;
}

.bubble {
  position: absolute;
  bottom: -50px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  will-change: transform, opacity;
  animation: rise linear infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-110vh) scale(0.8);
    opacity: 0;
  }
}
</style>
