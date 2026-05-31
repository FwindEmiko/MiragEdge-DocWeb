/// <reference types="vitepress/client" />

// Vue SFC type declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// JavaScript module declarations
declare module '*.js' {
  const content: any
  export default content
}

declare module './components/js/feature.js' {
  export function init3DTiltEffect(): void
}

declare module './components/js/notice.js' {
  export function showAestheticNotice(): void
  export function showConsoleLogo(): void
}
