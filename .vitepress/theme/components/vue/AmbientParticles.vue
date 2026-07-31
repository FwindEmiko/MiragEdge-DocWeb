<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle {
  alpha: number
  radius: number
  speed: number
  x: number
  y: number
}

const canvas = ref<HTMLCanvasElement | null>(null)

let animationFrame: number | null = null
let context: CanvasRenderingContext2D | null = null
let height = 0
let mediaQuery: MediaQueryList | null = null
let particles: Particle[] = []
let resizeObserver: ResizeObserver | null = null
let width = 0

function isCompactViewport() {
  return mediaQuery?.matches ?? false
}

function palette() {
  const isDark = document.documentElement.classList.contains('dark')

  return isDark
    ? { line: 'rgba(252, 165, 165, 0.11)', point: 'rgba(252, 165, 165,' }
    : { line: 'rgba(176, 48, 48, 0.12)', point: 'rgba(176, 48, 48,' }
}

function seedParticles() {
  const count = Math.max(14, Math.min(26, Math.round(width / 72)))
  particles = Array.from({ length: count }, () => ({
    alpha: 0.18 + Math.random() * 0.34,
    radius: 0.8 + Math.random() * 1.35,
    speed: 2 + Math.random() * 4,
    x: Math.random() * width,
    y: Math.random() * height,
  }))
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
  seedParticles()
}

function draw(time: number) {
  if (!context || isCompactViewport()) return

  context.clearRect(0, 0, width, height)
  const colors = palette()
  const connectionDistance = 116
  const connectionDistanceSquared = connectionDistance * connectionDistance

  for (let index = 0; index < particles.length; index += 1) {
    const particle = particles[index]
    const drift = Math.sin(time / 6000 + index) * particle.speed
    particle.x += drift * 0.016
    particle.y += particle.speed * 0.016

    if (particle.y > height + 12) {
      particle.y = -12
      particle.x = Math.random() * width
    }

    for (let next = index + 1; next < particles.length; next += 1) {
      const neighbor = particles[next]
      const dx = particle.x - neighbor.x
      const dy = particle.y - neighbor.y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared > connectionDistanceSquared) continue

      const opacity = (1 - Math.sqrt(distanceSquared) / connectionDistance) * 0.5
      context.beginPath()
      context.strokeStyle = colors.line.replace(/0\.11|0\.12/, `${opacity * 0.18}`)
      context.lineWidth = 1
      context.moveTo(particle.x, particle.y)
      context.lineTo(neighbor.x, neighbor.y)
      context.stroke()
    }

    const pulse = 0.72 + Math.sin(time / 1800 + index) * 0.28
    context.beginPath()
    context.fillStyle = `${colors.point} ${particle.alpha * pulse})`
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()
  }
}

function render(time: number) {
  draw(time)
  animationFrame = requestAnimationFrame(render)
}

function start() {
  if (animationFrame !== null || isCompactViewport()) return
  animationFrame = requestAnimationFrame(render)
}

function stop() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  context?.clearRect(0, 0, width, height)
}

function handleVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

function handleMediaChange() {
  if (isCompactViewport()) stop()
  else {
    resize()
    start()
  }
}

onMounted(() => {
  const target = canvas.value
  if (!target) return

  context = target.getContext('2d', { alpha: true })
  if (!context) return

  mediaQuery = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)')
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(document.documentElement)
  mediaQuery.addEventListener?.('change', handleMediaChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  resize()
  start()
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  mediaQuery?.removeEventListener?.('change', handleMediaChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  context = null
  mediaQuery = null
  resizeObserver = null
  particles = []
})
</script>

<template>
  <canvas ref="canvas" class="ambient-particles" aria-hidden="true"></canvas>
</template>

<style scoped>
.ambient-particles {
  position: fixed;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.88;
}

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .ambient-particles {
    display: none;
  }
}
</style>
