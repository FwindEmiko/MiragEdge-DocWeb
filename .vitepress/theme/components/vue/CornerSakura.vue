<script setup>
// 漂浮樱花瓣组件
import { ref, onMounted, onUnmounted } from 'vue'

const petals = ref([])
const isVisible = ref(false)
let showTimer = null
let petalIdCounter = 0

const createPetal = () => ({
  id: ++petalIdCounter,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 8 + Math.random() * 4,
  size: 8 + Math.random() * 8,
  opacity: 0.3 + Math.random() * 0.5
})

onMounted(() => {
  // 延迟显示
  showTimer = setTimeout(() => {
    isVisible.value = true
  }, 500)

  // 初始化生成一批樱花
  for (let i = 0; i < 15; i++) { // 减少数量
    petals.value.push(createPetal())
  }
})

onUnmounted(() => clearTimeout(showTimer))
</script>

<template>
  <div class="sakura-container" :class="{ visible: isVisible }" aria-hidden="true">
    <div
      v-for="petal in petals"
      :key="petal.id"
      class="petal"
      :style="{
        left: petal.left + '%',
        animationDelay: petal.delay + 's',
        animationDuration: petal.duration + 's',
        width: petal.size + 'px',
        height: petal.size + 'px',
        opacity: petal.opacity
      }"
    ></div>
  </div>
</template>

<style scoped>
.sakura-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
  opacity: 0;
  transition: opacity 1s ease;
}

.sakura-container.visible {
  opacity: 1;
}

.petal {
  position: absolute;
  top: -20px;
  background: linear-gradient(135deg, #ffb7c5 0%, #ffc0cb 50%, #fff0f5 100%);
  border-radius: 100% 0 100% 0;
  will-change: transform, opacity;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg) translateX(0);
  }
  25% {
    transform: translateY(25vh) rotate(90deg) translateX(20px);
  }
  50% {
    transform: translateY(50vh) rotate(180deg) translateX(-20px);
  }
  75% {
    transform: translateY(75vh) rotate(270deg) translateX(20px);
  }
  100% {
    transform: translateY(105vh) rotate(360deg) translateX(0);
  }
}
</style>
