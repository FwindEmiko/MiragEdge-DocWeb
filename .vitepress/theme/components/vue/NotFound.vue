<template>
  <main class="not-found" aria-labelledby="not-found-title">
    <section class="not-found__visual" aria-hidden="true">
      <span class="not-found__line not-found__line--horizontal"></span>
      <span class="not-found__line not-found__line--vertical"></span>
      <span class="not-found__corner not-found__corner--top-left"></span>
      <span class="not-found__corner not-found__corner--top-right"></span>
      <span class="not-found__corner not-found__corner--bottom-left"></span>
      <span class="not-found__corner not-found__corner--bottom-right"></span>

      <div class="not-found__coordinates">
        <span>ROUTE</span>
        <strong>404</strong>
        <span>UNAVAILABLE</span>
      </div>

      <div class="not-found__compass">
        <Compass :size="42" :stroke-width="1.35" />
      </div>
    </section>

    <section class="not-found__content">
      <p class="not-found__eyebrow"><span></span>404 / ROUTE NOT FOUND</p>
      <h1 id="not-found-title">这里暂时没有可抵达的地点</h1>
      <p class="not-found__description">
        这个链接可能已被移动、更新，或从未存在过。回到已知路径，继续探索锐界幻境。
      </p>

      <div class="not-found__actions">
        <a :href="homeUrl" class="not-found__action not-found__action--primary">
          <Home :size="17" :stroke-width="1.8" />
          返回首页
        </a>
        <button type="button" class="not-found__action not-found__action--secondary" @click="goBack">
          <ArrowLeft :size="17" :stroke-width="1.8" />
          返回上一页
        </button>
      </div>

      <nav class="not-found__routes" aria-label="常用入口">
        <a v-for="route in commonRoutes" :key="route.href" :href="route.href" class="not-found__route">
          <component :is="route.icon" :size="17" :stroke-width="1.7" />
          <span>{{ route.label }}</span>
          <ArrowUpRight :size="15" :stroke-width="1.7" />
        </a>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Compass, Home, Map, Puzzle } from 'lucide-vue-next'
import { withBase } from 'vitepress'

const homeUrl = withBase('/')
const commonRoutes = [
  { label: '新手指南', href: withBase('/start/'), icon: Map },
  { label: '玩法手册', href: withBase('/play/'), icon: Compass },
  { label: '插件功能', href: withBase('/plugins/'), icon: Puzzle },
]

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.assign(homeUrl)
}
</script>

<style scoped>
.not-found {
  --not-found-ink: var(--vp-c-text-1);
  --not-found-muted: var(--vp-c-text-2);
  --not-found-line: color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
  --not-found-panel: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(340px, 1fr);
  gap: clamp(44px, 8vw, 128px);
  align-items: center;
  width: min(100% - 48px, 1024px);
  min-height: min(680px, calc(100vh - 88px));
  margin: 0 auto;
  padding: 72px 0 88px;
}

.not-found__visual {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 384px);
  aspect-ratio: 1;
  justify-self: center;
  overflow: hidden;
  border: 1px solid var(--not-found-line);
  background-color: var(--not-found-panel);
}

.not-found__visual::before,
.not-found__visual::after {
  position: absolute;
  color: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0;
}

.not-found__visual::before {
  top: 18px;
  left: 20px;
  content: 'MGE / NAV';
}

.not-found__visual::after {
  right: 20px;
  bottom: 18px;
  content: '0.000 / 0.000';
}

.not-found__line {
  position: absolute;
  background-color: var(--not-found-line);
}

.not-found__line--horizontal {
  width: 100%;
  height: 1px;
}

.not-found__line--vertical {
  width: 1px;
  height: 100%;
}

.not-found__corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: var(--vp-c-brand-1);
  opacity: 0.82;
}

.not-found__corner--top-left {
  top: 18px;
  left: 18px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.not-found__corner--top-right {
  top: 18px;
  right: 18px;
  border-top: 1px solid;
  border-right: 1px solid;
}

.not-found__corner--bottom-left {
  bottom: 18px;
  left: 18px;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.not-found__corner--bottom-right {
  right: 18px;
  bottom: 18px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.not-found__coordinates {
  display: grid;
  justify-items: center;
  gap: 5px;
  color: var(--not-found-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0;
}

.not-found__coordinates strong {
  color: color-mix(in srgb, var(--vp-c-brand-1) 76%, var(--not-found-ink));
  font-family: inherit;
  font-size: clamp(92px, 14vw, 152px);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: 0;
}

.not-found__compass {
  position: absolute;
  display: grid;
  place-items: center;
  width: 68px;
  aspect-ratio: 1;
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 42%, transparent);
  background-color: var(--vp-c-bg);
  box-shadow: 0 0 0 9px var(--not-found-panel);
}

.not-found__content {
  max-width: 520px;
}

.not-found__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 19px;
  color: var(--vp-c-brand-1);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
}

.not-found__eyebrow span {
  width: 30px;
  height: 1px;
  background-color: currentColor;
}

.not-found h1 {
  max-width: 9em;
  margin: 0;
  color: var(--not-found-ink);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 650;
  line-height: 1.18;
  letter-spacing: 0;
}

.not-found__description {
  max-width: 31em;
  margin: 22px 0 0;
  color: var(--not-found-muted);
  font-size: 16px;
  line-height: 1.8;
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 34px;
}

.not-found__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.not-found__action svg {
  flex: 0 0 auto;
  margin-right: 8px;
}

.not-found__action--primary {
  color: var(--vp-c-white);
  background-color: var(--vp-c-brand-1);
}

.not-found__action--primary:hover {
  color: var(--vp-c-white);
  background-color: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.not-found__action--secondary {
  color: var(--not-found-ink);
  border-color: var(--not-found-line);
  background-color: transparent;
}

.not-found__action--secondary:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 54%, transparent);
  background-color: var(--vp-c-brand-soft);
  transform: translateY(-1px);
}

.not-found__routes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 46px;
  padding-top: 20px;
  border-top: 1px solid var(--not-found-line);
}

.not-found__route {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 10px 0;
  color: var(--not-found-muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
  transition: color 180ms ease;
}

.not-found__route span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.not-found__route svg:last-child {
  opacity: 0;
  transform: translate(-3px, 3px);
  transition: opacity 180ms ease, transform 180ms ease;
}

.not-found__route:hover {
  color: var(--vp-c-brand-1);
}

.not-found__route:hover svg:last-child {
  opacity: 1;
  transform: translate(0, 0);
}

@media (max-width: 760px) {
  .not-found {
    grid-template-columns: 1fr;
    gap: 44px;
    width: min(100% - 40px, 520px);
    min-height: auto;
    padding: 48px 0 64px;
  }

  .not-found__visual {
    width: min(100%, 340px);
  }

  .not-found__content {
    max-width: none;
  }

  .not-found h1 {
    max-width: 10em;
  }
}

@media (max-width: 480px) {
  .not-found {
    width: min(100% - 32px, 420px);
    gap: 36px;
    padding-top: 36px;
  }

  .not-found__visual {
    width: min(100%, 288px);
  }

  .not-found__coordinates strong {
    font-size: 104px;
  }

  .not-found h1 {
    font-size: 30px;
  }

  .not-found__description {
    font-size: 15px;
  }

  .not-found__actions {
    display: grid;
    grid-template-columns: 1fr;
    margin-top: 28px;
  }

  .not-found__routes {
    grid-template-columns: 1fr;
    gap: 0;
    margin-top: 36px;
  }

  .not-found__route {
    padding: 13px 0;
  }

  .not-found__route svg:last-child {
    opacity: 0.7;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found__action,
  .not-found__route,
  .not-found__route svg:last-child {
    transition: none;
  }

  .not-found__action:hover {
    transform: none;
  }
}
</style>
