<template>
  <div class="christmas-container">
    <!-- 标题部分 -->
    <div class="header">
      <h1 class="title">🎄 给宝宝的圣诞礼物 🎄</h1>
      <div class="love-timer">
        <div class="timer-box">
          <span class="timer-label">我们恋爱已经</span>
          <div class="timer-number">{{ loveDays }}</div>
          <span class="timer-label">天</span>
        </div>
        <div class="date-info">从 {{ startDate }} 到今天</div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧祝福语区域 -->
      <div class="messages-section">
        <div class="messages-container">
          <h2 class="section-title">💝 给宝宝的话</h2>
          <div class="love-messages">
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              class="message-card"
              :class="{ active: currentMessageIndex === index }"
              @click="setCurrentMessage(index)"
            >
              {{ message }}
            </div>
          </div>
          <div class="current-message-display">
            <div class="message-bubble">
              <div class="message-content">{{ currentMessage }}</div>
              <div class="message-author">爱你的宝宝 ❤️</div>
            </div>
          </div>
          <div class="interactive-section">
            <button class="btn surprise-btn" @click="showSurprise">
              {{ showSurpriseText ? "再点一次" : "点击查看惊喜" }}
            </button>
            <div v-if="showSurpriseText" class="surprise-text">
              <p>宝宝，和你在一起的{{ loveDays }}天，是我生命中最美好的时光。</p>
              <p>每一天都因为有你而变得特别，圣诞快乐，我的宝宝！🎅🎁</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 圣诞树区域 -->
      <div class="tree-section">
        <div class="tree-container">
          <!-- 圣诞树 -->
          <div class="tree">
            <!-- 树冠层 -->
            <div class="tree-layer layer-1"></div>
            <div class="tree-layer layer-2"></div>
            <div class="tree-layer layer-3"></div>
            <div class="tree-layer layer-4"></div>
            
            <!-- 树干 -->
            <div class="tree-trunk"></div>
            
            <!-- 树顶星星 -->
            <div class="tree-star">★</div>
            
            <!-- 装饰物 - 彩灯 -->
            <div 
              v-for="(light, index) in lights" 
              :key="'light-' + index"
              class="light"
              :class="`color-${light.color}`"
              :style="{
                left: light.x + 'px',
                top: light.y + 'px',
                animationDelay: light.delay + 's'
              }"
            ></div>
            
            <!-- 装饰物 - 小球 -->
            <div 
              v-for="(ball, index) in balls" 
              :key="'ball-' + index"
              class="ball"
              :class="`ball-color-${ball.color}`"
              :style="{
                left: ball.x + 'px',
                top: ball.y + 'px'
              }"
            ></div>
            
            <!-- 装饰物 - 礼物盒 -->
            <div 
              v-for="(gift, index) in gifts" 
              :key="'gift-' + index"
              class="gift"
              :class="`gift-${gift.color}`"
              :style="{
                left: gift.x + 'px',
                bottom: gift.y + 'px'
              }"
            >
              <div class="gift-lid"></div>
              <div class="gift-bow"></div>
            </div>
            
            <!-- 飘落的雪花 -->
            <div 
              v-for="(snowflake, index) in snowflakes" 
              :key="'snow-' + index"
              class="snowflake"
              :style="{
                left: snowflake.x + 'vw',
                animationDelay: snowflake.delay + 's',
                animationDuration: snowflake.duration + 's',
                fontSize: snowflake.size + 'px',
                opacity: snowflake.opacity
              }"
            >❄</div>
          </div>
          
          <!-- 树下文字 -->
          <div class="tree-footer">
            <p class="tree-message">宝宝，愿我们的爱情如这圣诞树般长青永恒！</p>
            <div class="hearts">
              <span v-for="n in 8" :key="'heart-' + n" class="heart">❤</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>❤️ 特别的爱给特别的你 - 宝宝，圣诞快乐！ ❤️</p>
      <p class="footer-date">制作于 {{ currentYear }} 年圣诞节</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 恋爱开始日期（根据1032天推算）
const startDate = ref('2022-02-27')
const loveDays = ref(1032)

// 当前年份
const currentYear = new Date().getFullYear()

// 给嵘融的祝福语
const messages = ref([
  "宝宝，遇见你是我一生中最幸运的事",
  "每一天都比前一天更爱你",
  "你的笑容是我最大的幸福",
  "愿我们的爱情像圣诞树一样永远闪耀",
  "和你在一起的时光总是那么美好",
  "你是我最珍贵的圣诞礼物",
  "爱你不是一时兴起，而是一生承诺",
  "愿每个圣诞都有你在我身边",
  "你让我的世界充满了色彩",
  "执子之手，与子偕老，永远爱你"
])

const currentMessageIndex = ref(0)
const currentMessage = computed(() => messages.value[currentMessageIndex.value])
const showSurpriseText = ref(false)

// 切换祝福语
const setCurrentMessage = (index) => {
  currentMessageIndex.value = index
}

// 显示惊喜
const showSurprise = () => {
  showSurpriseText.value = !showSurpriseText.value
}

// 圣诞树装饰数据
const lights = ref([])
const balls = ref([])
const gifts = ref([])
const snowflakes = ref([])

// 初始化圣诞树装饰
const initTreeDecorations = () => {
  // 初始化彩灯
  lights.value = []
  const lightColors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange']
  for (let i = 0; i < 30; i++) {
    lights.value.push({
      x: Math.random() * 200 + 50,
      y: Math.random() * 250 + 20,
      color: lightColors[Math.floor(Math.random() * lightColors.length)],
      delay: Math.random() * 5
    })
  }
  
  // 初始化装饰球
  balls.value = []
  const ballColors = ['gold', 'silver', 'red', 'blue']
  for (let i = 0; i < 15; i++) {
    balls.value.push({
      x: Math.random() * 200 + 50,
      y: Math.random() * 250 + 20,
      color: ballColors[Math.floor(Math.random() * ballColors.length)]
    })
  }
  
  // 初始化礼物盒
  gifts.value = []
  const giftColors = ['red', 'green', 'blue', 'gold']
  for (let i = 0; i < 6; i++) {
    gifts.value.push({
      x: Math.random() * 300 + 20,
      y: Math.random() * 40 + 10,
      color: giftColors[Math.floor(Math.random() * giftColors.length)]
    })
  }
  
  // 初始化雪花
  snowflakes.value = []
  for (let i = 0; i < 50; i++) {
    snowflakes.value.push({
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 10,
      size: Math.random() * 10 + 10,
      opacity: Math.random() * 0.5 + 0.3
    })
  }
}

// 自动切换祝福语的定时器
let messageInterval
onMounted(() => {
  initTreeDecorations()
  
  // 每5秒自动切换一条祝福语
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.value.length
  }, 5000)
})

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
})
</script>

<style scoped>
.christmas-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a2e38 0%, #1a5f7a 100%);
  color: #fff;
  padding: 20px;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 40, 60, 0.7);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 2.5rem;
  color: #ffdf5e;
  text-shadow: 0 0 10px #ff9e00;
  margin-bottom: 20px;
}

.love-timer {
  display: inline-block;
  background: rgba(139, 0, 0, 0.8);
  padding: 15px 30px;
  border-radius: 10px;
  border: 2px solid #ffdf5e;
}

.timer-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.timer-number {
  font-size: 2.8rem;
  font-weight: bold;
  color: #ffdf5e;
  text-shadow: 0 0 5px #ff0000;
}

.timer-label {
  font-size: 1.2rem;
  color: #fff;
}

.date-info {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 8px;
}

/* 主要内容区域布局 - 修改关键部分 */
.main-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center; /* 添加这个实现垂直居中 */
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  flex: 1; /* 占据可用空间 */
  min-height: 500px; /* 确保最小高度，以便居中显示 */
}

/* 左侧祝福语区域 - 修改高度和对齐 */
.messages-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  align-items: center; /* 内部垂直居中 */
}

.messages-container {
  background: rgba(0, 40, 60, 0.8);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 500px; /* 与圣诞树区域高度匹配 */
}

.section-title {
  font-size: 1.8rem;
  color: #4dccbd;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4dccbd;
}

.love-messages {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 25px;
  flex: 1; /* 占据可用空间 */
  align-content: center; /* 网格内容垂直居中 */
}

.message-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.message-card.active {
  background: rgba(255, 30, 60, 0.3);
  border-color: #ff1e3c;
  box-shadow: 0 0 10px rgba(255, 30, 60, 0.5);
}

.current-message-display {
  margin: 15px 0;
}

.message-bubble {
  background: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
  border-radius: 20px;
  padding: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(255, 0, 100, 0.3);
}

.message-bubble:after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid #ff758c;
}

.message-content {
  font-size: 1.3rem;
  line-height: 1.4;
  margin-bottom: 10px;
}

.message-author {
  text-align: right;
  font-size: 1.1rem;
  font-style: italic;
  color: #fff;
}

.interactive-section {
  text-align: center;
  margin-top: 15px;
}

.btn {
  background: linear-gradient(to right, #ff416c, #ff4b2b);
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 65, 108, 0.6);
}

.surprise-text {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  border-left: 4px solid #ffdf5e;
}

.surprise-text p {
  margin: 10px 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

/* 圣诞树区域 - 修改高度和对齐 */
.tree-section {
  flex: 1;
  min-width: 300px;
  max-width: 600px;
  display: flex;
  align-items: center; /* 内部垂直居中 */
}

.tree-container {
  background: rgba(0, 30, 50, 0.7);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 500px; /* 与左侧区域高度匹配 */
}

/* 圣诞树样式 */
.tree {
  width: 300px;
  height: 400px;
  position: relative;
  margin: 0 auto 20px;
}

.tree-layer {
  position: absolute;
  background: #0a5c36;
  border-radius: 50% 50% 0 0;
}

.layer-1 {
  width: 200px;
  height: 120px;
  bottom: 120px;
  left: 50px;
  background: #0a5c36;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.layer-2 {
  width: 170px;
  height: 100px;
  bottom: 190px;
  left: 65px;
  background: #0b6e40;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
}

.layer-3 {
  width: 140px;
  height: 80px;
  bottom: 250px;
  left: 80px;
  background: #0c804a;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
}

.layer-4 {
  width: 110px;
  height: 60px;
  bottom: 300px;
  left: 95px;
  background: #0d9254;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
}

.tree-trunk {
  position: absolute;
  width: 30px;
  height: 60px;
  background: #8b4513;
  bottom: 60px;
  left: 135px;
  border-radius: 5px;
}

.tree-star {
  position: absolute;
  font-size: 40px;
  color: #ffdf5e;
  bottom: 340px;
  left: 130px;
  text-shadow: 0 0 15px #ff9e00;
  animation: star-twinkle 2s infinite alternate;
}

@keyframes star-twinkle {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 1; }
}

/* 彩灯样式 */
.light {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: light-blink 1.5s infinite alternate;
}

@keyframes light-blink {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.color-red { background: #ff0000; box-shadow: 0 0 10px #ff0000; }
.color-blue { background: #0088ff; box-shadow: 0 0 10px #0088ff; }
.color-yellow { background: #ffff00; box-shadow: 0 0 10px #ffff00; }
.color-green { background: #00ff00; box-shadow: 0 0 10px #00ff00; }
.color-purple { background: #aa00ff; box-shadow: 0 0 10px #aa00ff; }
.color-orange { background: #ff8800; box-shadow: 0 0 10px #ff8800; }

/* 装饰球样式 */
.ball {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.3);
}

.ball-color-gold { background: radial-gradient(circle at 30% 30%, #ffdf5e, #b8860b); }
.ball-color-silver { background: radial-gradient(circle at 30% 30%, #f0f0f0, #a0a0a0); }
.ball-color-red { background: radial-gradient(circle at 30% 30%, #ff5555, #cc0000); }
.ball-color-blue { background: radial-gradient(circle at 30% 30%, #5555ff, #0000cc); }

/* 礼物盒样式 */
.gift {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 5px;
}

.gift-red { background: #ff0000; }
.gift-green { background: #00aa00; }
.gift-blue { background: #0088ff; }
.gift-gold { background: #ffaa00; }

.gift-lid {
  position: absolute;
  width: 44px;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  top: -5px;
  left: -2px;
  border-radius: 3px;
}

.gift-bow {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffdf5e;
  top: -10px;
  left: 10px;
  border-radius: 50% 50% 0 50%;
  transform: rotate(45deg);
}

.gift-bow:after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffdf5e;
  top: 0;
  left: 0;
  border-radius: 50% 50% 50% 0;
}

/* 雪花样式 */
.snowflake {
  position: absolute;
  color: white;
  top: -20px;
  animation: snow-fall linear infinite;
  user-select: none;
  pointer-events: none;
}

@keyframes snow-fall {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(360deg); }
}

/* 树下文字 */
.tree-footer {
  margin-top: 20px;
}

.tree-message {
  font-size: 1.4rem;
  color: #ffdf5e;
  margin-bottom: 15px;
}

.hearts {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.heart {
  font-size: 1.5rem;
  animation: heartbeat 1.5s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.heart:nth-child(2n) {
  animation-delay: 0.3s;
  color: #ff7eb3;
}

.heart:nth-child(3n) {
  animation-delay: 0.6s;
  color: #ff758c;
}

/* 页脚 */
.footer {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  background: rgba(0, 20, 40, 0.8);
  border-radius: 10px;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.footer-date {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    align-items: stretch; /* 移动端恢复默认对齐 */
  }
  
  .messages-section, .tree-section {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .timer-number {
    font-size: 2.2rem;
  }
  
  .love-messages {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .tree {
    transform: scale(0.9);
  }
  
  .messages-container, .tree-container {
    min-height: auto; /* 移动端取消最小高度 */
  }
}
</style>