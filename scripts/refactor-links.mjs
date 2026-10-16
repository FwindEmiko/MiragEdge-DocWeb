// 阶段 0 交叉链接分析：统计所有站内链接（源 → 目标），供 URL 迁移与死链清理使用。
// 只读。输出 docs/文档站全量重构261016/_links.json
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const OUT = path.join(ROOT, 'docs', '文档站全量重构261016', '_links.json')
const INV = path.join(ROOT, 'docs', '文档站全量重构261016', '_inventory.json')
const inv = JSON.parse(fs.readFileSync(INV, 'utf8'))

// 现存路由集合（用于判断链接是否可达）
const routes = new Set()
for (const p of inv.pages) {
  const slug = p.path.replace(/\.md$/, '')
  routes.add('/' + slug.replace(/\/index$/, ''))
  if (slug === 'index') routes.add('/')
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

// 收集 md 里出现的所有 /xxx 形式的站内路径（含链接与 <a href>）
const edges = []
const externalAnchors = []
for (const p of inv.pages) {
  const abs = path.join(ROOT, p.path)
  let text
  try { text = fs.readFileSync(abs, 'utf8') } catch { continue }
  const body = stripCode(text)
  const found = new Map()

  for (const m of body.matchAll(/\[([^\]]*)\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)) {
    const target = m[2].replace(/\/$/, '') || '/'
    const anchor = m[3] || ''
    const key = target + anchor
    if (!found.has(key)) found.set(key, { target, anchor, text: m[1], kind: 'md-link' })
  }
  for (const m of body.matchAll(/href\s*=\s*["'](\/[^"'#]*)(#[^"']*)?["']/g)) {
    const target = m[1].replace(/\/$/, '') || '/'
    const anchor = m[2] || ''
    const key = target + anchor
    if (!found.has(key)) found.set(key, { target, anchor, text: '', kind: 'html-href' })
  }

  for (const v of found.values()) {
    const resolved = v.target.replace(/\.md$/, '').replace(/\/$/, '') || '/'
    let exists = routes.has(resolved)
    if (!exists && v.target.endsWith('/')) exists = routes.has(v.target.replace(/\/$/, ''))
    if (!exists && routes.has(resolved + '/')) exists = true
    edges.push({
      from: p.path,
      fromZone: p.topDir,
      to: v.target,
      anchor: v.anchor,
      resolved,
      reachable: exists,
      kind: v.kind,
      linkText: v.text,
      crossZone: resolved.startsWith('/developer') || resolved.startsWith('/plugin-guides'),
    })
  }
}

// 汇总
const broken = edges.filter((e) => !e.reachable)
const toDev = edges.filter((e) => e.crossZone)
const byFrom = {}
for (const e of edges) { byFrom[e.from] = (byFrom[e.from] || 0) + 1 }

const summary = {
  totalEdges: edges.length,
  pagesWithLinks: Object.keys(byFrom).length,
  brokenCount: broken.length,
  broken: broken.map((b) => `${b.from} -> ${b.to}`),
  playerToDevCount: toDev.length,
  playerToDev: toDev.map((b) => `${b.from} -> ${b.to}${b.anchor}`),
  topTargets: Object.entries(
    edges.reduce((a, e) => { a[e.resolved] = (a[e.resolved] || 0) + 1; return a }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 40),
}

fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, edges }, null, 2), 'utf8')
console.log('edges:', summary.totalEdges, 'broken:', summary.brokenCount, 'player->dev:', summary.playerToDevCount)
console.log('--- broken ---')
summary.broken.slice(0, 40).forEach((b) => console.log(b))
console.log('--- player -> dev ---')
summary.playerToDev.forEach((b) => console.log(b))
