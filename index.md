---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: MiragEdge 文档中心

hero:
  name: "锐界幻境"
  text: "Minecraft 生存服务器"
  tagline: 👼🏻 远离困扰之地（锐界）和天堂般的境地（幻境），在数字荒漠中打造一片绿洲，让每个玩家都能找到属于自己的幻境
  image:
    src: /resourcepack/items_skin/food/sweet_berries_cupcake.png
    alt: MiragEdge
  actions:
    - theme: brand
      text: 玩家指南
      link: /manual/review.md
    - theme: alt
      text: 玩法介绍
      link: /features

features:
  - icon: 🚢
    title: 创新玩法
    details: 独家轻 RPG 系统、星露谷、附魔等多维度玩法
  - icon: 💾
    title: 高性能优化
    details: 高性能设备，先进架构优化，多线路负载均衡
  - icon: ❤️
    title: 优秀社区
    details: 公益化纯净体验，7×24 小时管理在线，跨次元社交生态
  - icon: 🔧
    title: 稳定保障
    details: 长期开服不换档，每日增量备份 + 异地容灾，强力反作弊，自动白名单
  - icon: 🔄
    title: 持续更新
    details: 长期更新优化，不断添加趣味功能与修复问题
---

## 🚀 服务器概况

**锐界幻境** 是一个致力于打造开放创新 Minecraft 游戏平台的公益服务器。我们相信每个玩家都值得拥有一个自由、纯净、有趣的游戏环境。

### 核心理念

- 🎮 **高品质体验** - 精心配置，只为更好的游戏感受
- 🤝 **社区驱动** - 玩家声音是我们进步的动力
- 🔒 **安全稳定** - 专业运维，数据安全有保障
- 💡 **持续创新** - 不断探索新的玩法和可能性

## 💻 硬件配置

服务器采用高性能硬件配置，确保游戏流畅运行：

- **处理器** - 英特尔 i5 14600KF（5.6GHz 超频）
- **内存** - 64GB 高频内存
- **网络** - 宁波电信百兆 + 宿迁三线 BGP 优化百兆
- **存储** - 三星数据中心级 SSD

## 🛡️ 软件架构与备份策略

### 服务架构

使用 **Velocity** 反向代理 + **Purpur** 服务端，全容器化管理，JumpServer 堡垒机安全协作，专业的网络优化，确保低延迟高稳定。

### 数据备份

- **数据库备份** — 每日 4 次，实时保护游戏数据
- **虚拟机克隆** — 每周，完整系统快照
- **云端归档** — 每月，异地容灾保障

> 梦始之空世界存档 **永久保存**，我们承诺不会删除任何玩家的心血结晶。

## 📢 获取帮助

- 💬 **玩家交流群**: 523914625
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/fwindemiko/MiragEdge-DocWeb/issues)
- 💻 **贡献代码**: [GitHub 仓库](https://github.com/fwindemiko/MiragEdge-DocWeb)

## 📝 开发者的话

> 语言学科是我的弱项，若文档有写得不好的地方，恳请指正 🙏
>
> 除了运营锐界幻境外，我们还提供下面服务：
> - 开服技术咨询
> - 有偿问题解决
> - 中小插件定制开发
>
> 对锐界幻境的最终目标是：**"实现一个开放创新的服务器平台"**
>
> —— 狐风轩汐 (F.windEmiko)

<style scoped>
#star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.VPHome {
  position: relative;
  z-index: 1;
}
</style>

<canvas id="star-canvas"></canvas>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'

const images = [
  '/title_img/icon-1.png',
  '/title_img/icon-2.png',
  '/title_img/icon-3.png',
]
const hiddenImage = '/title_img/icon-dis.png'

let animationFrameId = null
let particles = []
let heroImage = null

const config = {
  maxParticles: 60,
  spawnRate: 8,
  baseSpeed: 0.3,
  friction: 0.97,
  minSize: 2,
  maxSize: 4,
  attractStrength: 0.008,
  mouseRadius: 150,
  mousePushStrength: 0.3,
  maxPushForce: 0.8,
  colorMinHue: 180,
  colorMaxHue: 240,
}

const mouse = {
  x: -1000,
  y: -1000,
  vx: 0,
  vy: 0,
  lastX: -1000,
  lastY: -1000,
}

let canvas, ctx, width, height, centerX, centerY
let frame = 0
let isVisible = true

function updateCenter() {
  if (heroImage) {
    const rect = heroImage.getBoundingClientRect()
    centerX = rect.left + rect.width / 2
    centerY = rect.top + rect.height / 2
  }
}

function initStarEffect() {
  canvas = document.getElementById('star-canvas')
  if (!canvas) return

  ctx = canvas.getContext('2d', { alpha: true })
  
  const resize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    updateCenter()
  }
  
  resize()
  window.addEventListener('resize', resize)
  
  window.addEventListener('mousemove', (e) => {
    mouse.lastX = mouse.x
    mouse.lastY = mouse.y
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.vx = mouse.x - mouse.lastX
    mouse.vy = mouse.y - mouse.lastY
  }, { passive: true })

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden
  })

  animate()
}

class Star {
  constructor() {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 300 + 100
    this.x = centerX + Math.cos(angle) * dist
    this.y = centerY + Math.sin(angle) * dist
    
    const driftAngle = angle + (Math.random() - 0.5) * 0.3
    const speed = config.baseSpeed + Math.random() * 0.2
    this.vx = Math.cos(driftAngle) * speed
    this.vy = Math.sin(driftAngle) * speed
    
    this.size = config.minSize + Math.random() * (config.maxSize - config.minSize)
    this.life = 1
    this.decay = 0.0008 + Math.random() * 0.0008
    this.hue = config.colorMinHue + Math.random() * (config.colorMaxHue - config.colorMinHue)
  }

  update() {
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distSq = dx * dx + dy * dy
    
    if (distSq < config.mouseRadius * config.mouseRadius && distSq > 0) {
      const dist = Math.sqrt(distSq)
      const force = (1 - dist / config.mouseRadius) * config.attractStrength
      this.vx += (dx / dist) * force
      this.vy += (dy / dist) * force
      
      const pushForce = Math.min(Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy) * config.mousePushStrength, config.maxPushForce)
      if (pushForce > 0.05) {
        this.vx += mouse.vx * 0.01 * pushForce
        this.vy += mouse.vy * 0.01 * pushForce
      }
    }
    
    this.vx *= config.friction
    this.vy *= config.friction
    
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 2) {
      this.vx = (this.vx / speed) * 2
      this.vy = (this.vy / speed) * 2
    }
    
    if (speed < 0.1) {
      const angleToCenter = Math.atan2(centerY - this.y, centerX - this.x)
      this.vx += Math.cos(angleToCenter) * 0.003
      this.vy += Math.sin(angleToCenter) * 0.003
    }
    
    this.x += this.vx
    this.y += this.vy
    this.hue += 0.15
    this.life -= this.decay
  }

  draw() {
    const alpha = this.life * 0.8
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${alpha})`
    ctx.fill()
  }
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  
  if (!isVisible) return
  
  ctx.clearRect(0, 0, width, height)
  
  frame++
  
  if (particles.length < config.maxParticles && frame % config.spawnRate === 0) {
    particles.push(new Star())
  }
  
  ctx.globalCompositeOperation = 'lighter'
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.update()
    p.draw()
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
  
  ctx.globalCompositeOperation = 'source-over'
}

onMounted(async () => {
  await nextTick()
  
  const weightedImages = [
    ...images.flatMap(img => Array(5).fill(img)),
    hiddenImage
  ]
  const randomImage = weightedImages[Math.floor(Math.random() * weightedImages.length)]
  
  const selectors = [
    '.VPHomeHero .VPImage img',
    '.VPHomeHero img',
    'main .VPImage img',
    '[alt="xingjiu"]'
  ]
  
  for (const selector of selectors) {
    const found = document.querySelector(selector)
    if (found) {
      heroImage = found
      break
    }
  }
  
  if (heroImage) {
    heroImage.src = randomImage
    heroImage.alt = 'xingjiu'
  }
  
  initStarEffect()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>
