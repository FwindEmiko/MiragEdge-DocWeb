import { withBase } from 'vitepress'

const SAFE_PROTOCOL = /^(?:https?:|mailto:)/i
const RELATIVE_PATH = /^(?:\.{1,2}\/|[^/:?#][^:]*$)/

export function sanitizeMarkdownLink(rawUrl: string): string | null {
  const url = rawUrl.trim()
  if (!url || /[\u0000-\u001F\u007F]/.test(url)) return null
  if (url.startsWith('#') || SAFE_PROTOCOL.test(url)) return url
  if (url.startsWith('/') && !url.startsWith('//')) return withBase(url)
  if (RELATIVE_PATH.test(url)) return url
  return null
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] as string)
}

export function formatSafeInlineMarkdown(content: string): string {
  const linkPattern = /\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)/g
  let result = ''
  let lastIndex = 0

  for (const match of content.matchAll(linkPattern)) {
    const index = match.index ?? 0
    result += escapeHtml(content.slice(lastIndex, index))
    const label = escapeHtml(match[1])
    const url = sanitizeMarkdownLink(match[2])
    result += url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : label
    lastIndex = index + match[0].length
  }

  return result + escapeHtml(content.slice(lastIndex))
}
