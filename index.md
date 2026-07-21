---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: MiragEdge 文档中心
description: 锐界幻境 Minecraft Java/基岩互通生存服务器官方文档中心。提供玩家入服指南、玩法介绍（经济/领地/季节/钓鱼/食物/附魔/装备锻造）、开发教程与原创插件文档，助你快速融入幻境世界。
head:
  - - meta
    - name: keywords
      content: 锐界幻境, MiragEdge, Minecraft 服务器, 互通服务器, 生存服务器, 入服教程, 玩法介绍, 玩家指南
  - - meta
    - property: article:tag
      content: Minecraft, 锐界幻境, 生存服务器, 文档中心

hero:
  name: "锐界幻境"
  text: "Minecraft 生存服务器"
  tagline: 远离困扰之地（锐界）和天堂般的境地（幻境），在数字荒漠中打造一片绿洲，让每个玩家都能找到属于自己的幻境
  image:
    src: /title_img/icon-1.webp
    alt: MiragEdge
  actions:
    - theme: brand
      text: 玩家指南
      link: /manual/review.md
    - theme: alt
      text: 玩法介绍
      link: /features
    - theme: alt
      text: 官方Q群
      link: /manual/qq_group

features:
  - title: 创新玩法
    details: 独家轻 RPG 体系 × 星露谷田园 × 200+ 附魔 × 装备锻造，4 大维度交织出百人百面的冒险之旅
  - title: 高性能优化
    details: Leaf 服务端 + GraalVM 25 JIT 编译 + 全链路异步架构，TPS 稳定 20，告别卡顿掉帧
  - title: 优秀社区
    details: 公益纯净初心，7×24 管理守护，千人群组实时互动，从萌新到大佬都能找到归属
  - title: 稳定保障
    details: 长期开服承诺，每日增量备份 + 异地容灾，混合反作弊 + 自动白名单双保险
  - title: 持续更新
    details: 周级迭代节奏，每月新增玩法内容，200+ 版本迭代持续打磨体验
  - title: 多端互通
    details: Java版 + 基岩版全平台支持，手机电脑均可畅玩，数据互通无缝衔接
---

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

<ClientOnly>
  <canvas id="star-canvas"></canvas>
</ClientOnly>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { withBase } from 'vitepress'
import { effectsEnabled } from './.vitepress/theme/composables/useEffectsToggle'

let animationFrameId = null
let particles = []
let heroImage = null
let resizeHandler = null
let mouseMoveHandler = null
let visibilityHandler = null
let effectsStopWatcher = null
let reducedMotionQuery = null
let reducedMotionHandler = null
let canvasRetryFrame = null

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
  if (animationFrameId !== null) return
  canvas = document.getElementById('star-canvas')
  if (!canvas) return

  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return
  canvas.hidden = false
  
  resizeHandler = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    updateCenter()
  }
  
  resizeHandler()
  window.addEventListener('resize', resizeHandler, { passive: true })
  
  mouseMoveHandler = (e) => {
    mouse.lastX = mouse.x
    mouse.lastY = mouse.y
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.vx = mouse.x - mouse.lastX
    mouse.vy = mouse.y - mouse.lastY
  }
  window.addEventListener('mousemove', mouseMoveHandler, { passive: true })

  visibilityHandler = () => {
    isVisible = !document.hidden
  }
  document.addEventListener('visibilitychange', visibilityHandler)

  animate()
}

function stopStarEffect() {
  if (canvasRetryFrame !== null) {
    cancelAnimationFrame(canvasRetryFrame)
    canvasRetryFrame = null
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler)
    mouseMoveHandler = null
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.hidden = true
  }
  particles = []
  frame = 0
  ctx = null
}

function startStarEffectWhenReady(attempt = 0) {
  if (animationFrameId !== null || canvasRetryFrame !== null) return
  canvasRetryFrame = requestAnimationFrame(() => {
    canvasRetryFrame = null
    if (!effectsEnabled.value || reducedMotionQuery?.matches) return
    if (document.getElementById('star-canvas')) {
      initStarEffect()
      return
    }
    if (attempt < 30) startStarEffectWhenReady(attempt + 1)
  })
}

function syncStarEffect() {
  const shouldRun = effectsEnabled.value && !reducedMotionQuery?.matches
  if (shouldRun) startStarEffectWhenReady()
  else stopStarEffect()
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

onMounted(() => {
  // 随机选择 hero 图片（icon-dis.webp 小概率出现）
  const heroIcons = ['/title_img/icon-1.webp', '/title_img/icon-2.webp', '/title_img/icon-3.webp']
  const weighted = [...heroIcons.flatMap(i => Array(5).fill(i)), '/title_img/icon-dis.webp']
  const randomIcon = weighted[Math.floor(Math.random() * weighted.length)]
  const heroImg = document.querySelector('.VPHomeHero img')
  if (heroImg) {
    heroImage = heroImg
    heroImg.src = withBase(randomIcon)
  }

  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionHandler = () => syncStarEffect()
  reducedMotionQuery.addEventListener?.('change', reducedMotionHandler)
  effectsStopWatcher = watch(effectsEnabled, syncStarEffect, { immediate: true })
})


onUnmounted(() => {
  effectsStopWatcher?.()
  effectsStopWatcher = null
  reducedMotionQuery?.removeEventListener?.('change', reducedMotionHandler)
  reducedMotionHandler = null
  reducedMotionQuery = null
  stopStarEffect()
  heroImage = null
})
</script>
