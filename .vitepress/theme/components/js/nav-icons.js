/**
 * nav-icons.js — MiragEdge 导航/侧边栏 emoji 图标增强
 *
 * 自动检测导航栏和侧边栏文字开头的 emoji 字符，
 * 将其包裹在 <span class="nav-icon-emoji"> 中，
 * 配合 icons.css 实现统一的图标风格。
 *
 * 原理：VitePress config.mts 的 nav/sidebar text 是纯字符串，
 * 无法使用 Vue 组件或 data-* 属性。故在运行时用 JS 检测 emoji 并包装。
 */

/**
 * 匹配开头的单个 emoji 簇（含 ZWJ 序列、肤色修饰符、FE0F 变体选择器）。
 * 例如 🧑‍🌾（person + ZWJ + ear of rice）会被视为一个完整 emoji，
 * 避免被拆成 🧑 和 🌾 两个图标。
 */
const leadingEmojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F?)(?:\p{Emoji_Modifier})?(?:\u200D(\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F?)(?:\p{Emoji_Modifier})?)*/u;

/**
 * 检查字符串开头是否为 emoji
 */
function hasLeadingEmoji(text) {
  return leadingEmojiRegex.test(text);
}

/**
 * 提取开头的 emoji 字符
 */
function extractLeadingEmoji(text) {
  const match = text.match(leadingEmojiRegex);
  if (match) {
    return { emoji: match[0], text: text.slice(match[0].length).trim() };
  }
  return null;
}

/**
 * 增强单个元素：将开头 emoji 包裹到 span 中
 */
function enhanceElement(el) {
  if (!el || el.dataset.navIconProcessed) return;

  // 如果已经有子元素（嵌套标签），跳过
  if (el.children.length > 0) return;

  const text = el.textContent || '';
  const result = extractLeadingEmoji(text);
  if (result) {
    el.innerHTML = `<span class="nav-icon-emoji">${result.emoji}</span>${result.text}`;
    el.dataset.navIconProcessed = 'true';
  }
}

/**
 * 扫描并增强所有导航/侧边栏项
 */
function enhanceAll() {
  // ===== 导航栏 =====
  // 顶层导航项
  document.querySelectorAll(
    '.VPNavBarMenuLink, ' +
    '.VPNavBarMenuGroup > .button, ' +
    '.VPNavBar .VPNavBarMenuLink, ' +
    '.VPNavBar .VPNavBarMenuGroup > button'
  ).forEach(el => {
    if (el.querySelector('.nav-icon-emoji')) return;
    const textEl = el.querySelector('.text') || el;
    enhanceElement(textEl);
  });

  // 导航下拉菜单项
  document.querySelectorAll('.VPMenuLink a, .VPMenuGroup .title').forEach(el => {
    if (el.querySelector('.nav-icon-emoji')) return;
    const textEl = el.querySelector('.text') || el;
    enhanceElement(textEl);
  });

  // ===== 侧边栏 =====
  document.querySelectorAll('.VPSidebarItem .item .text').forEach(el => {
    if (el.querySelector('.nav-icon-emoji')) return;
    enhanceElement(el);
  });
}

/**
 * 初始化导航图标增强
 * 使用单例 MutationObserver，避免路由切换时累积创建多个 observer
 */
let observerInstance = null;

export function initNavIcons() {
  if (typeof window === 'undefined') return;

  // 首次加载时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll);
  } else {
    enhanceAll();
  }

  // 已有 observer 则不重复创建（避免累积泄漏）
  if (observerInstance) return;

  // 监听 DOM 变化（VitePress 切换路由时），添加防抖避免高频变动导致卡顿
  let debounceTimer = null;
  observerInstance = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(enhanceAll, 150);
  });

  observerInstance.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('beforeunload', () => {
    if (observerInstance) {
      observerInstance.disconnect();
      observerInstance = null;
    }
  });
}
