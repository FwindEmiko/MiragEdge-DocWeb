<script setup>
// 随机小惊喜组件 - 定时弹出
import { ref, onMounted, onUnmounted } from 'vue'

const surprises = ref([])
let scheduleTimer = null
let startTimer = null
const removeTimers = new Set()

const surpriseItems = [
  { emoji: '🎁', text: '恭喜发现隐藏惊喜！' },
  { emoji: '🎀', text: '叮~ 魔法惊喜！' },
  { emoji: '🌈', text: '彩虹通行证！' },
  { emoji: '💎', text: '钻石！是我的钻石！' },
  { emoji: '🍪', text: '曲奇饼时间~' },
  { emoji: '🧡', text: '来自服务器的爱心~' },
  { emoji: '⭐', text: '你发现了一颗星！' },
  { emoji: '🎉', text: '庆祝时刻！' },
  { emoji: '🔮', text: '魔法水晶球说：你好~' },
  { emoji: '🦊', text: '狐狸爱你！' },
]

const createSurprise = () => {
  const item = surpriseItems[Math.floor(Math.random() * surpriseItems.length)]
  const id = Date.now()
  const position = 20 + Math.random() * 60 // 20-80% 位置

  surprises.value.push({
    id,
    ...item,
    left: position,
    top: position,
  })

  // 3秒后移除
  const removeTimer = setTimeout(() => {
    surprises.value = surprises.value.filter(s => s.id !== id)
    removeTimers.delete(removeTimer)
  }, 3000)
  removeTimers.add(removeTimer)
}

onMounted(() => {
  // 延迟启动惊喜计时器，页面加载5秒后再开始
  startTimer = setTimeout(() => {
    const scheduleNext = () => {
      const delay = 360000 + Math.random() * 60000
      scheduleTimer = setTimeout(() => {
        createSurprise()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
  }, 5000)
})

onUnmounted(() => {
  if (startTimer) clearTimeout(startTimer)
  if (scheduleTimer) clearTimeout(scheduleTimer)
  removeTimers.forEach(t => clearTimeout(t))
  removeTimers.clear()
})
</script>

<template>
  <div class="surprises-container">
    <transition-group name="surprise">
      <div
        v-for="surprise in surprises"
        :key="surprise.id"
        class="surprise-item"
        :style="{
          left: surprise.left + '%',
          top: surprise.top + '%'
        }"
      >
        <span class="emoji">{{ surprise.emoji }}</span>
        <span class="text">{{ surprise.text }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.surprises-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}

.surprise-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.95) 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -50%);
}

.emoji {
  font-size: 40px;
  animation: bounce 0.6s ease infinite;
}

.text {
  margin-top: 4px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.surprise-enter-active {
  animation: pop-in 0.4s ease-out;
}

.surprise-leave-active {
  animation: pop-out 0.4s ease-in forwards;
}

@keyframes pop-in {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes pop-out {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}
</style>
