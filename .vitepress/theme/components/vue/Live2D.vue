<script setup>
// 狐狸看板娘组件 - 简约可爱风格
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isVisible = ref(false)
const showHeart = ref(false)
const timers = new Set()

onMounted(() => {
  const t = setTimeout(() => {
    isVisible.value = true
    timers.delete(t)
  }, 500)
  timers.add(t)
})

const handleClick = () => {
  showHeart.value = true
  const t = setTimeout(() => {
    showHeart.value = false
    timers.delete(t)
  }, 1500)
  timers.add(t)
}

onBeforeUnmount(() => {
  timers.forEach(t => clearTimeout(t))
  timers.clear()
})
</script>

<template>
  <div class="fox-wrapper" :class="{ visible: isVisible }">
    <div class="fox" @click="handleClick">
      <!-- 头 -->
      <div class="head">
        <div class="ear left"></div>
        <div class="ear right"></div>
        <div class="face">
          <div class="eye left"></div>
          <div class="eye right"></div>
          <div class="nose"></div>
        </div>
      </div>
      <!-- 身体 -->
      <div class="body">
        <div class="belly"></div>
      </div>
      <!-- 尾巴 -->
      <div class="tail"></div>
    </div>
    <!-- 爱心 -->
    <div class="heart" v-if="showHeart">喵喵喵~💕</div>
  </div>
</template>

<style scoped>
.fox-wrapper {
  position: fixed;
  bottom: 0;
  right: 15px;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.fox-wrapper.visible {
  opacity: 1;
  pointer-events: auto;
}

.fox {
  position: relative;
  width: 60px;
  height: 55px;
  cursor: pointer;
}

/* 头 */
.head {
  position: absolute;
  top: 0;
  left: 5px;
  width: 50px;
  height: 40px;
  background: #ff9f43;
  border-radius: 25px 25px 20px 20px;
}

.ear {
  position: absolute;
  top: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #ff9f43;
}

.ear.left {
  left: 4px;
  transform: rotate(-15deg);
}

.ear.right {
  right: 4px;
  transform: rotate(15deg);
}

.face {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 35px;
  height: 22px;
  background: #fff;
  border-radius: 18px 18px 15px 15px;
}

.eye {
  position: absolute;
  top: 5px;
  width: 5px;
  height: 6px;
  background: #333;
  border-radius: 50%;
}

.eye.left { left: 7px; }
.eye.right { right: 7px; }

.nose {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 5px;
  background: #333;
  border-radius: 50%;
}

/* 身体 */
.body {
  position: absolute;
  top: 35px;
  left: 10px;
  width: 40px;
  height: 28px;
  background: #ff9f43;
  border-radius: 20px 20px 15px 15px;
}

.belly {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 18px;
  background: #fff;
  border-radius: 13px 13px 10px 10px;
}

/* 尾巴 */
.tail {
  position: absolute;
  top: 38px;
  left: -8px;
  width: 28px;
  height: 35px;
  background: #ff9f43;
  border-radius: 50% 20% 50% 50%;
  transform: rotate(-20deg);
  transform-origin: bottom left;
  animation: tailWag 2s ease-in-out infinite;
}

.tail::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 3px;
  width: 14px;
  height: 18px;
  background: #fff;
  border-radius: 50% 30% 50% 50%;
}

@keyframes tailWag {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-10deg); }
}

/* 爱心 */
.heart {
  position: absolute;
  top: -15px;
  right: 0;
  font-size: 16px;
  z-index: 100;
  animation: heartPop 1.5s ease-out forwards;
  pointer-events: none;
}

@keyframes heartPop {
  0% { opacity: 0; transform: translateY(5px) scale(0.5); }
  50% { opacity: 1; transform: translateY(-8px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-15px) scale(1); }
}

/* 移动端：首页右下角空间有限，看板娘会遮挡首页按钮/内容，直接隐藏
   首页是移动端用户进入最频繁的页面，优先保证内容可读性与可点击性 */
@media (max-width: 767px) {
  .fox-wrapper {
    display: none;
  }
}
</style>
