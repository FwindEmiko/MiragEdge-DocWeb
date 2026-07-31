<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { effectsEnabled } from '../../composables/useEffectsToggle'

interface Particle {
  alpha: number
  phase: number
  radius: number
  vx: number
  vy: number
  x: number
  y: number
}

const canvas = ref<HTMLCanvasElement | null>(null)

let animationFrame: number | null = null
let context: CanvasRenderingContext2D | null = null
let height = 0
let heroCenter = { x: 0, y: 0 }
let motionQuery: MediaQueryList | null = null
let particles: Particle[] = []
let resizeObserver: ResizeObserver | null = null
let stopEffectsWatcher: (() => void) | null = null
let width = 0

function getPalette() {
  const isDark = document.documentElement.classList.contains('dark')

  return isDark
    ? { line: 'rgba(252, 165, 165,', point: 'rgba(252, 165, 165,' }
    : { line: 'rgba(201, 66, 66,', point: 'rgba(201, 66, 66,' }
}

function updateHeroCenter() {
  const heroImage = document.querySelector<HTMLElement>('.VPHomeHero img')
  if (!heroImage) {
    heroCenter = { x: width / 2, y: Math.min(height * 0.42, 390) }
    return
  }

  const rect = heroImage.getBoundingClientRect()
  heroCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function createParticle(): Particle {
  const angle = Math.random() * Math.PI * 2
  const distance = 110 + Math.sqrt(Math.random()) * Math.min(width * 0.36, 420)
  const speed = 2.5 + Math.random() * 5

  return {
    alpha: 0.16 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
    radius: 0.8 + Math.random() * 1.45,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    x: heroCenter.x + Math.cos(angle) * distance,
    y: heroCenter.y + Math.sin(angle) * distance * 0.66,
  }
}

function seedParticles() {
  const count = Math.max(20, Math.min(38, Math.round(width / 38)))
  particles = Array.from({ length: count }, createParticle)
}

function resize() {
  const target = canvas.value
  if (!target || !context) return

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  width = window.innerWidth
  height = window.innerHeight
  target.width = Math.round(width * pixelRatio)
  target.height = Math.round(height * pixelRatio)
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  updateHeroCenter()
  seedParticles()
}

function draw(time: number) {
  if (!context) return

  context.clearRect(0, 0, width, height)
  const colors = getPalette()
  const connectionDistance = 128
  const connectionDistanceSquared = connectionDistance * connectionDistance

  for (let index = 0; index < particles.length; index += 1) {
    const particle = particles[index]
    particle.x += particle.vx * 0.016
    particle.y += particle.vy * 0.016

    const centerDx = heroCenter.x - particle.x
    const centerDy = heroCenter.y - particle.y
    const centerDistanceSquared = centerDx * centerDx + centerDy * centerDy

    if (centerDistanceSquared > Math.min(width * 0.42, 520) ** 2) {
      Object.assign(particle, createParticle())
    }

    for (let next = index + 1; next < particles.length; next += 1) {
      const neighbor = particles[next]
      const dx = particle.x - neighbor.x
      const dy = particle.y - neighbor.y
      const distanceSquared = dx * dx + dy * dy
      if (distanceSquared > connectionDistanceSquared) continue

      const opacity = (1 - Math.sqrt(distanceSquared) / connectionDistance) * 0.16
      context.beginPath()
      context.strokeStyle = `${colors.line}${opacity})`
      context.lineWidth = 1
      context.moveTo(particle.x, particle.y)
      context.lineTo(neighbor.x, neighbor.y)
      context.stroke()
    }

    const pulse = 0.7 + Math.sin(time / 1600 + particle.phase) * 0.3
    context.beginPath()
    context.fillStyle = `${colors.point}${particle.alpha * pulse})`
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()
  }
}

function render(time: number) {
  draw(time)
  animationFrame = requestAnimationFrame(render)
}

function stop() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  context?.clearRect(0, 0, width, height)
}

function sync() {
  const shouldAnimate = effectsEnabled.value && !motionQuery?.matches && !document.hidden
  if (!shouldAnimate) {
    stop()
    return
  }

  if (animationFrame === null) animationFrame = requestAnimationFrame(render)
}

function setRandomHeroImage() {
  const options = [
    '/title_img/icon-1.webp',
    '/title_img/icon-2.webp',
    '/title_img/icon-3.webp',
    '/title_img/icon-1.webp',
    '/title_img/icon-2.webp',
    '/title_img/icon-3.webp',
    '/title_img/icon-dis.webp',
  ]
  const heroImage = document.querySelector<HTMLImageElement>('.VPHomeHero img')
  if (heroImage) heroImage.src = withBase(options[Math.floor(Math.random() * options.length)])
}

function handleVisibilityChange() {
  sync()
}

function handleMotionChange() {
  sync()
}

onMounted(() => {
  const target = canvas.value
  if (!target) return

  context = target.getContext('2d', { alpha: true })
  if (!context) return

  motionQuery = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)')
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(document.documentElement)
  motionQuery.addEventListener?.('change', handleMotionChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  stopEffectsWatcher = watch(effectsEnabled, sync, { immediate: true })

  setRandomHeroImage()
  resize()
  sync()
})

onBeforeUnmount(() => {
  stop()
  stopEffectsWatcher?.()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener?.('change', handleMotionChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  context = null
  motionQuery = null
  particles = []
  resizeObserver = null
  stopEffectsWatcher = null
})
</script>

<template>
  <canvas ref="canvas" class="hero-particle-field" aria-hidden="true"></canvas>
</template>

<style scoped>
.hero-particle-field {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .hero-particle-field {
    display: none;
  }
}
</style>
