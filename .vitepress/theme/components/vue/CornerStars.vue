<script setup>
// 角落浮动小星星组件
import { ref, onMounted, onBeforeUnmount } from 'vue'

const stars = ref([
  { id: 1, top: '10%', left: '5%', delay: 0, duration: 3 },
  { id: 2, top: '20%', right: '8%', delay: 0.5, duration: 4 },
  { id: 3, bottom: '15%', left: '10%', delay: 1, duration: 3.5 },
  { id: 4, bottom: '25%', right: '5%', delay: 1.5, duration: 4.5 },
  { id: 5, top: '40%', left: '3%', delay: 2, duration: 3 },
  { id: 6, top: '60%', right: '3%', delay: 0.8, duration: 5 },
])

const isVisible = ref(false)
let showTimer = null

onMounted(() => {
  showTimer = setTimeout(() => {
    isVisible.value = true
  }, 500)
})

onBeforeUnmount(() => {
  clearTimeout(showTimer)
})
</script>

<template>
  <div class="stars-container" :class="{ visible: isVisible }">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        top: star.top,
        left: star.left,
        right: star.right,
        bottom: star.bottom,
        animationDelay: star.delay + 's',
        animationDuration: star.duration + 's'
      }"
    >✦</div>
  </div>
</template>

<style scoped>
.stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  opacity: 0;
  transition: opacity 1s ease;
}

.stars-container.visible {
  opacity: 1;
}

.star {
  position: absolute;
  color: #ffd700;
  font-size: 20px;
  will-change: transform, opacity;
  animation: twinkle ease-in-out infinite;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
