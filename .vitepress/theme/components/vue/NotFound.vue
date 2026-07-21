<template>
  <div class="not-found">
    <!-- 角落装饰元素 -->
    <CornerSakura v-if="effectsActive" />
    <CornerStars v-if="effectsActive" />
    <CornerQuotes v-if="effectsActive" />

    <div class="cat-container">
      <div class="cat">
        <div class="cat-ear">
          <div class="ear-left"></div>
          <div class="ear-right"></div>
        </div>
        <div class="cat-face">
          <div class="eye left">
            <div class="pupil"></div>
          </div>
          <div class="eye right">
            <div class="pupil"></div>
          </div>
          <div class="nose"></div>
          <div class="mouth">
            <div class="mouth-left"></div>
            <div class="mouth-right"></div>
          </div>
          <div class="whiskers">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="cat-body"></div>
        <div class="paws">
          <div class="paw left"></div>
          <div class="paw right"></div>
        </div>
        <div class="tail"></div>
      </div>
      <div class="confused-stars">
        <span class="star">✦</span>
        <span class="star">✧</span>
        <span class="star">✦</span>
      </div>
    </div>

    <h1 class="error-code">404</h1>
    <p class="message">喵呜~ 这个页面走丢啦!</p>
    <p class="hint">小鼠鼠找不到回家的路了,你可以...</p>

    <div class="actions">
      <a :href="homeUrl" class="home-btn">
        <span class="icon">🏠</span>
        回到首页
      </a>
      <button @click="goBack" class="back-btn">
        <span class="icon">↩</span>
        返回上页
      </button>
    </div>

    <div class="search-hint">
      <p>或者使用搜索寻找目标~</p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { effectsEnabled } from '../../composables/useEffectsToggle'

// Corner 装饰组件异步加载，减少主 bundle 体积（与 layout.vue 保持一致）
const CornerSakura = defineAsyncComponent(() => import('./CornerSakura.vue'))
const CornerStars = defineAsyncComponent(() => import('./CornerStars.vue'))
const CornerQuotes = defineAsyncComponent(() => import('./CornerQuotes.vue'))
const homeUrl = withBase('/')
const prefersReducedMotion = ref(false)
const effectsActive = computed(() => effectsEnabled.value && !prefersReducedMotion.value)
let motionQuery = null
let motionHandler = null

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionHandler = (event) => {
    prefersReducedMotion.value = event.matches
  }
  prefersReducedMotion.value = motionQuery.matches
  motionQuery.addEventListener?.('change', motionHandler)
})

onUnmounted(() => {
  motionQuery?.removeEventListener?.('change', motionHandler)
})

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
    return
  }
  window.location.assign(homeUrl)
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px 20px;
  text-align: center;
}

.cat-container {
  position: relative;
  margin-bottom: 20px;
}

.cat {
  position: relative;
  width: 120px;
  height: 100px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cat-ear {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 30px;
}

.ear-left, .ear-right {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 30px solid #4a3f35;
}

.ear-left {
  left: 5px;
  transform: rotate(-15deg);
}

.ear-right {
  right: 5px;
  transform: rotate(15deg);
}

.cat-face {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 60px;
  background: #f5e6d3;
  border-radius: 50% 50% 45% 45%;
}

.eye {
  position: absolute;
  top: 15px;
  width: 18px;
  height: 18px;
  background: #2d2d2d;
  border-radius: 50%;
  animation: blink 4s ease-in-out infinite;
}

.eye.left { left: 15px; }
.eye.right { right: 15px; }

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

.pupil {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
}

.nose {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 8px;
  background: #ff9a9a;
  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
}

.mouth {
  position: absolute;
  top: 38px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 10px;
}

.mouth-left, .mouth-right {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #4a3f35;
  border-top: none;
  border-left: none;
  border-radius: 0 0 50% 50%;
}

.mouth-left {
  left: 0;
  transform: rotate(-10deg);
}

.mouth-right {
  right: 0;
  transform: rotate(10deg);
}

.whiskers span {
  position: absolute;
  width: 20px;
  height: 2px;
  background: #8b7355;
}

.whiskers span:nth-child(1) { top: 30px; left: -5px; transform: rotate(-10deg); }
.whiskers span:nth-child(2) { top: 35px; left: -8px; transform: rotate(0deg); }
.whiskers span:nth-child(3) { top: 40px; left: -5px; transform: rotate(10deg); }
.whiskers span:nth-child(4) { top: 30px; right: -5px; transform: rotate(10deg); }
.whiskers span:nth-child(5) { top: 35px; right: -8px; transform: rotate(0deg); }
.whiskers span:nth-child(6) { top: 40px; right: -5px; transform: rotate(-10deg); }

.cat-body {
  position: absolute;
  top: 55px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 40px;
  background: linear-gradient(180deg, #f5e6d3 0%, #e8d5c4 100%);
  border-radius: 50% 50% 45% 45%;
}

.paws {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  display: flex;
  justify-content: space-between;
}

.paw {
  width: 20px;
  height: 15px;
  background: #f5e6d3;
  border-radius: 50% 50% 45% 45%;
}

.tail {
  position: absolute;
  bottom: 10px;
  right: 5px;
  width: 40px;
  height: 12px;
  background: #4a3f35;
  border-radius: 10px;
  transform-origin: left center;
  animation: tail-wag 1s ease-in-out infinite;
}

@keyframes tail-wag {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
}

.confused-stars {
  position: absolute;
  top: -20px;
  right: -20px;
  animation: float 2s ease-in-out infinite;
}

.star {
  position: absolute;
  font-size: 20px;
  color: #ffd700;
}

.star:nth-child(1) { top: 0; left: 0; animation: float 1.5s ease-in-out infinite; }
.star:nth-child(2) { top: 15px; left: 20px; animation: float 1.8s ease-in-out infinite 0.3s; }
.star:nth-child(3) { top: -10px; left: 25px; animation: float 2s ease-in-out infinite 0.6s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(10deg); }
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: var(--vp-c-brand-1, #3c8772);
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(60, 135, 114, 0.3);
}

.message {
  font-size: 24px;
  color: var(--vp-c-text-1, #333);
  margin: 10px 0;
  font-weight: 600;
}

.hint {
  font-size: 16px;
  color: var(--vp-c-text-2, #666);
  margin: 10px 0 30px;
}

.actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.home-btn, .back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--vp-c-brand-1, #3c8772);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 4px 15px rgba(60, 135, 114, 0.3);
}

.home-btn:hover, .back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(60, 135, 114, 0.4);
  opacity: 0.9;
}

.back-btn {
  background: var(--vp-c-brand-2, #5a9e8f);
}

.icon {
  font-size: 18px;
}

.search-hint {
  margin-top: 30px;
  padding: 15px 25px;
  background: var(--vp-c-bg-soft, #f5f5f5);
  border-radius: 10px;
}

.search-hint p {
  margin: 0;
  color: var(--vp-c-text-2, #666);
  font-size: 14px;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 60px;
  }

  .message {
    font-size: 20px;
  }

  .actions {
    flex-direction: column;
    width: 100%;
    max-width: 250px;
  }

  .home-btn, .back-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cat,
  .eye,
  .tail,
  .confused-stars,
  .star {
    animation: none;
  }

  .home-btn,
  .back-btn {
    transition: none;
  }

  .home-btn:hover,
  .back-btn:hover {
    transform: none;
  }
}
</style>
