import { describe, it, expect, beforeEach } from 'vitest'
import {
  hasLeadingEmoji,
  extractLeadingEmoji,
  enhanceElement,
} from '../../../theme/components/js/nav-icons'

/**
 * nav-icons 真实逻辑测试
 *
 * 测试目标：验证导航/侧边栏 emoji 提取与元素增强的核心逻辑，
 * 覆盖单字符 emoji、ZWJ 序列、肤色修饰符、变体选择器等边界场景。
 * 这些是项目实际使用的纯函数，无需 mock，回归稳定。
 */
describe('nav-icons: emoji 提取逻辑', () => {
  describe('hasLeadingEmoji', () => {
    it('单字符 emoji 开头应返回 true', () => {
      expect(hasLeadingEmoji('🏠 首页')).toBe(true)
      expect(hasLeadingEmoji('🎮 玩法介绍')).toBe(true)
      expect(hasLeadingEmoji('📚 玩家手册')).toBe(true)
    })

    it('ZWJ 序列 emoji 开头应返回 true', () => {
      // 🧑‍🌾 = person + ZWJ + ear of rice，应视为单个 emoji
      expect(hasLeadingEmoji('🧑‍🌾 农场指南')).toBe(true)
      expect(hasLeadingEmoji('👨‍💻 开发文档')).toBe(true)
    })

    it('纯文本开头应返回 false', () => {
      expect(hasLeadingEmoji('首页')).toBe(false)
      expect(hasLeadingEmoji('MiragEdge 文档')).toBe(false)
      expect(hasLeadingEmoji('Hello World')).toBe(false)
    })

    it('空字符串应返回 false', () => {
      expect(hasLeadingEmoji('')).toBe(false)
    })

    it('数字开头应返回 false（数字不是 emoji）', () => {
      expect(hasLeadingEmoji('1.21 版本')).toBe(false)
      expect(hasLeadingEmoji('2024 年')).toBe(false)
    })

    it('emoji 不在开头时应返回 false', () => {
      expect(hasLeadingEmoji('首页 🏠')).toBe(false)
      expect(hasLeadingEmoji('文档 📚')).toBe(false)
    })
  })

  describe('extractLeadingEmoji', () => {
    it('应正确提取单字符 emoji 与剩余文本', () => {
      const result = extractLeadingEmoji('🏠 首页')
      expect(result).not.toBeNull()
      expect(result!.emoji).toBe('🏠')
      expect(result!.text).toBe('首页')
    })

    it('应正确提取 ZWJ 序列 emoji（不拆分）', () => {
      const result = extractLeadingEmoji('🧑‍🌾 农场')
      expect(result).not.toBeNull()
      expect(result!.emoji).toBe('🧑‍🌾')
      expect(result!.text).toBe('农场')
    })

    it('应正确提取肤色修饰符 emoji', () => {
      // 👍🏽 = thumbs up + skin tone modifier
      const result = extractLeadingEmoji('👍🏽 点赞')
      expect(result).not.toBeNull()
      expect(result!.emoji).toBe('👍🏽')
      expect(result!.text).toBe('点赞')
    })

    it('无 emoji 时应返回 null', () => {
      expect(extractLeadingEmoji('纯文本')).toBeNull()
      expect(extractLeadingEmoji('')).toBeNull()
    })

    it('无空格分隔时应正确提取', () => {
      const result = extractLeadingEmoji('🏠首页')
      expect(result).not.toBeNull()
      expect(result!.emoji).toBe('🏠')
      expect(result!.text).toBe('首页')
    })

    it('应去除剩余文本的首尾空白', () => {
      const result = extractLeadingEmoji('🎮   玩法介绍   ')
      expect(result).not.toBeNull()
      expect(result!.text).toBe('玩法介绍')
    })
  })
})

describe('nav-icons: 元素增强逻辑', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('应将开头 emoji 包裹到 nav-icon-emoji span 中', () => {
    const el = document.createElement('a')
    el.textContent = '🏠 首页'
    enhanceElement(el)

    const span = el.querySelector('.nav-icon-emoji')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('🏠')
    expect(el.dataset.navIconProcessed).toBe('true')
  })

  it('无 emoji 时不应修改元素', () => {
    const el = document.createElement('a')
    el.textContent = '纯文本导航'
    enhanceElement(el)

    expect(el.querySelector('.nav-icon-emoji')).toBeNull()
    expect(el.dataset.navIconProcessed).toBeUndefined()
    expect(el.textContent).toBe('纯文本导航')
  })

  it('已处理过的元素不应重复处理（幂等）', () => {
    const el = document.createElement('a')
    el.textContent = '🏠 首页'
    enhanceElement(el)
    const innerHtmlAfterFirst = el.innerHTML

    enhanceElement(el)
    expect(el.innerHTML).toBe(innerHtmlAfterFirst)
  })

  it('传入 null 应安全跳过', () => {
    expect(() => enhanceElement(null as any)).not.toThrow()
  })

  it('已有子元素的节点应跳过（避免破坏嵌套结构）', () => {
    const el = document.createElement('a')
    const child = document.createElement('span')
    child.textContent = '🏠 首页'
    el.appendChild(child)

    enhanceElement(el)
    // 不应被处理，因为 el 自身有子元素
    expect(el.dataset.navIconProcessed).toBeUndefined()
  })

  it('空文本元素应安全跳过', () => {
    const el = document.createElement('a')
    el.textContent = ''
    enhanceElement(el)

    expect(el.dataset.navIconProcessed).toBeUndefined()
    expect(el.innerHTML).toBe('')
  })
})
