<script setup lang="ts">
import { withBase } from 'vitepress'

const companionHref = withBase('/soul')
const companionImage = withBase('/title_img/icon-dis.webp')
</script>

<template>
  <aside class="home-companion" aria-label="锐界幻境角色入口">
    <a :href="companionHref" class="home-companion__link" aria-label="查看灵魂文档">
      <img class="home-companion__image" :src="companionImage" alt="" decoding="async" />
    </a>
  </aside>
</template>

<style scoped>
.home-companion {
  position: fixed;
  right: clamp(14px, 2vw, 32px);
  bottom: max(-10px, calc(env(safe-area-inset-bottom) - 10px));
  z-index: 8;
  width: clamp(88px, 8vw, 132px);
  pointer-events: none;
}

.home-companion__link {
  position: relative;
  display: block;
  pointer-events: auto;
  outline: none;
}

.home-companion__link::after {
  position: absolute;
  right: 18%;
  bottom: 3%;
  left: 18%;
  height: 1px;
  content: '';
  background-color: var(--vp-c-brand-1);
  opacity: 0;
  transform: scaleX(0.3);
  transform-origin: center;
  transition: opacity 220ms ease, transform 220ms ease;
}

.home-companion__image {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.22));
  transform: translateY(14px);
  transition: filter 220ms ease, transform 220ms ease;
}

.home-companion__link:hover .home-companion__image,
.home-companion__link:focus-visible .home-companion__image {
  filter: drop-shadow(0 24px 30px rgba(224, 82, 82, 0.28));
  transform: translateY(4px);
}

.home-companion__link:hover::after,
.home-companion__link:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

.home-companion__link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 5px;
}

@media (max-width: 1024px) {
  .home-companion {
    display: none;
  }
}

@media (max-height: 760px) {
  .home-companion {
    width: 88px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-companion__link::after,
  .home-companion__image {
    transition: none;
  }

  .home-companion__link:hover .home-companion__image,
  .home-companion__link:focus-visible .home-companion__image {
    transform: none;
  }
}
</style>
