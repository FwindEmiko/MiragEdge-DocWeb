// 阶段 0 盘点脚本：扫描项目根的全部 markdown 内容源，产出机器可读清单。
// 只读，不修改任何内容。输出 docs/文档站全量重构261016/_inventory.json
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const OUT_DIR = path.join(ROOT, 'docs', '文档站全量重构261016')
const CONTENT_DIRS = ['start', 'play', 'plugins', 'plugin-guides', 'developer', 'archive']

// 玩家区禁词（纲领 §3.3）
// 区分「中文词」与「英文词」：英文词必须加词边界，否则 webapi/userapi 之类会误报。
const BANNED_CN = ['数据包', '资源包', '插件']
const BANNED_EN = [
  'datapack', 'resource pack', 'JAR', 'Spigot', 'Paper', 'Leaf',
  'CraftEngine', 'Aiyatsbus', 'NereusOpus', 'Geyser', 'Velocity', 'ViaVersion',
  'config\\.yml', 'plugin\\.yml', 'PDC', 'NBT', 'API', 'Fluxon', 'Maven', 'Gradle', 'JVM',
]

// 已核实的确定性误报白名单：玩家可见的品牌名/货币英文名，非内部实现词。
// 每条都注明为什么不算违规，避免以后被当成漏报。
const BAN_WHITELIST = [
  { re: /Spirit\s*Leaf/gi, why: '游戏内货币的官方英文名（start/worldview.md 货币表）' },
  { re: /Starscar\s*Gem/gi, why: '游戏内货币的官方英文名（start/worldview.md 货币表）' },
]

// 扫描前必须先剔除的噪声区：URL 查询串是外部平台参数（如 QQ 邀请链接 jump_from=webapi），
// 不是文档正文用词。
function stripNoise(line) {
  let s = line
  s = s.replace(/https?:\/\/\S+/gi, ' ')      // 整条 URL（含查询串）
  s = s.replace(/\/\/\S*/g, ' ')              // 协议相对 URL
  return s
}

// 元叙述残留（纲领 §6.1）
const META_JUNK = [
  '本页只展示', '本区只展示', '内容边界', '事实边界', '内容状态',
  '以游戏内提示为准', '不重复讲', '尚未完成配置核对', '设计稿和待核对资料',
  '待实际配置和玩法目标确定后再补齐',
]

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (e.isFile() && e.name.endsWith('.md')) acc.push(p)
  }
  return acc
}

function parseFrontmatter(text) {
  // 返回 { raw, title, description, hasFrontmatter, outline, keys }
  if (!text.startsWith('---')) return { hasFrontmatter: false, title: null, description: null, raw: '', keys: [], outline: null }
  const end = text.indexOf('\n---', 3)
  if (end === -1) return { hasFrontmatter: false, title: null, description: null, raw: '', keys: [], outline: null }
  const raw = text.slice(3, end)
  const keys = []
  for (const line of raw.split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:/.exec(line)
    if (m) keys.push(m[1])
  }
  const title = /^title\s*:\s*(.+)$/m.exec(raw)?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? null
  let description = /^description\s*:\s*(.+)$/m.exec(raw)?.[1]?.trim() ?? null
  if (description !== null) {
    if (/^[>|][-+]?$/.test(description)) description = '__BLOCK__'
    else description = description.replace(/^['"]|['"]$/g, '')
  }
  const outline = /^outline\s*:/.test(raw) ? true : null
  return { hasFrontmatter: true, title, description, raw: raw.slice(0, 400), keys, outline }
}

function stripCodeBlocks(text) {
  // 去掉围栏代码块与行内代码，避免代码里的词污染禁词/链接扫描
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

function analyze(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const text = fs.readFileSync(file, 'utf8')
  const bytes = Buffer.byteLength(text, 'utf8')
  const lines = text.split(/\r?\n/)
  const fm = parseFrontmatter(text)

  const h1 = []
  const h2 = []
  const h3 = []
  let inFence = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = /^(#{1,3})\s+(.*)$/.exec(line)
    if (!m) continue
    const lvl = m[1].length
    const t = m[2].trim()
    if (lvl === 1) h1.push(t)
    else if (lvl === 2) h2.push(t)
    else h3.push(t)
  }

  const body = stripCodeBlocks(text)

  // 组件使用
  const components = {}
  for (const m of body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    components[m[1]] = (components[m[1]] || 0) + 1
  }

  // 图片
  const smartImages = [...body.matchAll(/<SmartImage[\s\S]*?\/?>/g)].map((m) => {
    const src = /src\s*=\s*["']([^"']+)["']/.exec(m[0])?.[1] ?? null
    const caption = /caption\s*=\s*["']([^"']*)["']/.exec(m[0])?.[1] ?? null
    return { src, caption }
  })
  const mdImages = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
  const imgTags = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])

  // 内部链接（markdown 链接 + html href）
  const links = []
  for (const m of body.matchAll(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const href = m[2]
    if (/^(https?:|mailto:|#)/.test(href)) continue
    links.push({ text: m[1], href })
  }
  for (const m of body.matchAll(/href\s*=\s*["']([^"']+)["']/g)) {
    const href = m[1]
    if (/^(https?:|mailto:|#)/.test(href)) continue
    links.push({ text: '', href })
  }

  const devLinks = links.filter((l) => /^\/(developer|plugin-guides)(\/|$)/.test(l.href))

  // VitePress 容器语法
  const containers = [...body.matchAll(/^:::\s*(tip|warning|danger|info|details|note)\b/gm)].map((m) => m[1])

  // 禁词 / 元叙述（玩家区用）
  // 逐行扫描并剔除 URL 噪声，同时记录命中上下文，便于人工复核而非盲信计数。
  const bannedHits = []
  const linesBody = body.split(/\r?\n/)
  const countWord = (word, flags) => {
    let n = 0
    const samples = []
    for (const raw of linesBody) {
      const line = stripNoise(raw)
      let l = line
      for (const w of BAN_WHITELIST) l = l.replace(w.re, ' ')
      const re = new RegExp(word, flags)
      const m = l.match(re)
      if (m) { n += m.length; if (samples.length < 2) samples.push(raw.trim().slice(0, 100)) }
    }
    return { n, samples }
  }
  for (const word of BANNED_CN) {
    const { n, samples } = countWord(word, 'g')
    if (n > 0) bannedHits.push({ word, count: n, samples })
  }
  for (const word of BANNED_EN) {
    const { n, samples } = countWord(word, 'gi')
    if (n > 0) bannedHits.push({ word: word.replace(/\\/g, ''), count: n, samples })
  }
  const metaHits = META_JUNK.filter((s) => body.includes(s))

  return {
    path: rel,
    topDir: rel.split('/')[0],
    slug: rel.replace(/\.md$/, ''),
    bytes,
    lines: lines.length,
    hasFrontmatter: fm.hasFrontmatter,
    fmTitle: fm.title,
    fmDescription: fm.description === '__BLOCK__' ? '(块标量)' : fm.description,
    fmKeys: fm.keys,
    h1,
    h2Count: h2.length,
    h3Count: h3.length,
    h1Text: h1[0] ?? null,
    components,
    componentTotal: Object.values(components).reduce((a, b) => a + b, 0),
    smartImages,
    mdImages,
    imgTags,
    linkCount: links.length,
    devLinks,
    containers,
    bannedHits,
    metaHits,
  }
}

const files = []
for (const d of CONTENT_DIRS) {
  const abs = path.join(ROOT, d)
  if (fs.existsSync(abs)) files.push(...walk(abs))
}
// 首页
const home = path.join(ROOT, 'index.md')
if (fs.existsSync(home)) files.push(home)

const pages = files.map(analyze).sort((a, b) => a.path.localeCompare(b.path))

// 汇总
const summary = {
  total: pages.length,
  byTopDir: {},
  noFrontmatter: [],
  noTitle: [],
  noDescription: [],
  withImage: 0,
  mdImagePages: [],
  pagesOver18KB: [],
  pagesOver12KB: [],
  bannedPages: [],
  metaJunkPages: [],
  devLinkPages: [],
  componentTotals: {},
  containerPages: 0,
}
for (const p of pages) {
  const key = p.topDir === 'index.md' ? '(root)' : p.topDir
  summary.byTopDir[key] = (summary.byTopDir[key] || 0) + 1
  if (!p.hasFrontmatter) summary.noFrontmatter.push(p.path)
  if (!p.fmTitle) summary.noTitle.push(p.path)
  if (!p.fmDescription) summary.noDescription.push(p.path)
  if (p.smartImages.length > 0 || p.mdImages.length > 0) summary.withImage++
  if (p.mdImages.length > 0) summary.mdImagePages.push(p.path)
  if (p.bytes > 18 * 1024) summary.pagesOver18KB.push({ path: p.path, kb: +(p.bytes / 1024).toFixed(1) })
  if (p.bytes > 12 * 1024) summary.pagesOver12KB.push({ path: p.path, kb: +(p.bytes / 1024).toFixed(1) })
  if (p.bannedHits.length > 0) summary.bannedPages.push({ path: p.path, hits: p.bannedHits })
  if (p.metaHits.length > 0) summary.metaJunkPages.push({ path: p.path, hits: p.metaHits })
  if (p.devLinks.length > 0) summary.devLinkPages.push({ path: p.path, n: p.devLinks.length })
  if (p.containers.length > 0) summary.containerPages++
  for (const [k, v] of Object.entries(p.components)) {
    summary.componentTotals[k] = (summary.componentTotals[k] || 0) + v
  }
}
summary.pagesOver18KB.sort((a, b) => b.kb - a.kb)
summary.pagesOver12KB.sort((a, b) => b.kb - a.kb)

fs.mkdirSync(OUT_DIR, { recursive: true })
const outFile = path.join(OUT_DIR, '_inventory.json')
fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), summary, pages }, null, 2), 'utf8')

console.log(`pages: ${pages.length} -> ${path.relative(ROOT, outFile)}`)
console.log(JSON.stringify({
  byTopDir: summary.byTopDir,
  noFrontmatter: summary.noFrontmatter.length,
  noTitle: summary.noTitle.length,
  noDescription: summary.noDescription.length,
  withImage: summary.withImage,
  over18KB: summary.pagesOver18KB.length,
  over12KB: summary.pagesOver12KB.length,
  bannedPages: summary.bannedPages.length,
  metaJunkPages: summary.metaJunkPages.length,
  devLinkPages: summary.devLinkPages.length,
  containerPages: summary.containerPages,
}, null, 2))
