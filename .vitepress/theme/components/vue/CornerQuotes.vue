<script setup>
// 角落随机格言组件
import { ref, onMounted, onBeforeUnmount } from 'vue'

const quotes = [
  { text: '每一页文档都是一段旅程~', author: '狐魇星玖' },
  { text: '代码改变世界 ✨', author: '狐魇星玖' },
  { text: '休息一下，喝杯茶 🍵', author: '狐魇星玖' },
  { text: '探索未知，发现美好 🦊', author: '狐魇星玖' },
  { text: '今天的你也很棒呢!', author: '狐魇星玖' },
  { text: '记得保持好奇心~', author: '狐魇星玖' },
  { text: 'Minecraft is Life 🎮', author: '狐魇星玖' },
  { text: '欢迎来到锐界幻境 ✨', author: '狐魇星玖' },
  { text: '挖到钻石了吗？💎', author: '狐魇星玖' },
  { text: '别忘了给小麦浇水 🌾', author: '狐魇星玖' },
  { text: '史蒂夫不需要睡眠 💤', author: '狐魇星玖' },
  { text: '猪灵们会爱你 💰', author: '狐魇星玖' },
  { text: '下界也有风景~ 🔥', author: '狐魇星玖' },
  { text: '末地外域等你探索 🟣', author: '狐魇星玖' },
  { text: '合成，创造无限可能 ⚙️', author: '狐魇星玖' },
  { text: '苦力怕：因为害羞而爆炸 💚', author: '狐魇星玖' },
  { text: '僵尸村民也需要关爱 🧟', author: '狐魇星玖' },
  { text: '铁傀儡会保护村民 🤖', author: '狐魇星玖' },
  { text: '流浪商人的羊驼呢？🐫', author: '狐魇星玖' },
  { text: '猪群众：我不止是能骑 🐖', author: '狐魇星玖' },
  { text: '-doc 文档永远读不完 📚', author: '狐魇星玖' },
  { text: '我会记得备份存档！💾', author: '狐魇星玖' },
]

const currentQuote = ref(quotes[0])
const showQuote = ref(false)

let showTimer = null
let switchInterval = null
let hideTimer = null

onMounted(() => {
  // 延迟显示，页面加载1秒后再出现
  showTimer = setTimeout(() => {
    showQuote.value = true
  }, 1000)

  // 每30秒切换一次格言
  switchInterval = setInterval(() => {
    showQuote.value = false
    hideTimer = setTimeout(() => {
      currentQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
      showQuote.value = true
    }, 300)
  }, 30000)
})

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  if (switchInterval) clearInterval(switchInterval)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div class="quote-container bottom-right" aria-hidden="true">
    <transition name="fade">
      <div v-if="showQuote" class="quote-box">
        <p class="quote-text">"{{ currentQuote.text }}"</p>
        <span v-if="currentQuote.author" class="quote-author">— {{ currentQuote.author }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.quote-container {
  position: fixed;
  z-index: 9997;
  pointer-events: none;
}

.bottom-right {
  bottom: 20px;
  right: 20px;
  max-width: 280px;
}

.quote-box {
  background: linear-gradient(135deg, rgba(60, 135, 114, 0.1) 0%, rgba(90, 158, 143, 0.1) 100%);
  border-left: 3px solid var(--vp-c-brand-1, #3c8772);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  backdrop-filter: blur(8px);
}

.quote-text {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-1, #333);
  line-height: 1.5;
}

.quote-author {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
  text-align: right;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
