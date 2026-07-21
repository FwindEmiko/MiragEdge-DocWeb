import { describe, expect, it } from 'vitest'
import {
  escapeHtml,
  formatSafeInlineMarkdown,
  sanitizeMarkdownLink,
} from '../../../theme/utils/markdown'

describe('markdown 安全格式化', () => {
  it('允许常用安全协议、锚点和相对路径', () => {
    expect(sanitizeMarkdownLink('https://example.com')).toBe('https://example.com')
    expect(sanitizeMarkdownLink('mailto:test@example.com')).toBe('mailto:test@example.com')
    expect(sanitizeMarkdownLink('#section')).toBe('#section')
    expect(sanitizeMarkdownLink('./details')).toBe('./details')
  })

  it('拒绝脚本、数据和协议相对 URL', () => {
    expect(sanitizeMarkdownLink('javascript:alert(1)')).toBeNull()
    expect(sanitizeMarkdownLink('data:text/html,test')).toBeNull()
    expect(sanitizeMarkdownLink('//evil.example')).toBeNull()
  })

  it('转义 HTML，并只渲染安全链接', () => {
    expect(escapeHtml('<img src=x>')).toBe('&lt;img src=x&gt;')
    expect(formatSafeInlineMarkdown('[官网](https://example.com)')).toContain(
      'href="https://example.com"',
    )
    expect(formatSafeInlineMarkdown('[危险](javascript:alert(1))')).toBe('危险')
  })
})
