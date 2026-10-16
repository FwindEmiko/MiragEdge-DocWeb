import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const documentRoots = ['start', 'community', 'play', 'features', 'plugin-guides', 'developer', 'archive']
const configPath = path.join(root, '.vitepress', 'config.mts')

function normalizeRoute(value) {
  const clean = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  return clean ? `/${clean}` : '/'
}

function walk(directory) {
  const entries = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) entries.push(...walk(absolute))
    else if (entry.name.endsWith('.md')) entries.push(absolute)
  }
  return entries
}

function pageRecord(file) {
  const relative = path.relative(root, file).replace(/\\/g, '/')
  const withoutExtension = relative.slice(0, -3)
  const route = normalizeRoute(withoutExtension.replace(/\/index$/, ''))
  return {
    file,
    route,
    sourceDirectory: path.posix.dirname(`/${withoutExtension}`),
  }
}

function localRoute(rawLink, sourceDirectory) {
  if (/^[a-z][a-z0-9_-]*=#[a-z0-9]+$/i.test(rawLink)) return null
  const link = rawLink.replace(/^<|>$/g, '').split(/[?#]/, 1)[0]
  if (!link || link.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(link)) return null
  // 与 pageRecord 保持同一套归一化：去掉 .md 后再去掉尾部 /index，
  // 否则显式的 `./index.md`、`x/index.md` 会被误报为「链接不存在」（它们指向的正是目录路由）。
  const toRoute = (p) => normalizeRoute(p.replace(/\.md$/, '').replace(/\/index$/, ''))
  if (link.startsWith('/')) return toRoute(link)
  return toRoute(path.posix.resolve(sourceDirectory, link))
}

const pages = documentRoots
  .flatMap((directory) => walk(path.join(root, directory)))
  .map(pageRecord)
const routes = new Map(pages.map((page) => [page.route, page.file]))

const config = fs.readFileSync(configPath, 'utf8')
const sidebarStart = config.indexOf('sidebar: {')
const sidebarEnd = config.indexOf('// 社交链接', sidebarStart)
if (sidebarStart === -1 || sidebarEnd === -1) {
  throw new Error('无法定位 config.mts 中的 sidebar 配置。')
}

const sidebarSource = config.slice(sidebarStart, sidebarEnd)
// VitePress 的多 sidebar 模型：每个路径前缀一套独立的 sidebar，页面只看自己那套。
// 因此判重必须【按块内部】判，全局去重会把「/ 块的社区入口」与「/community/ 块的首页入口」
// 这类正常的跨块重复误判成缺陷。
const blocks = []
{
  const re = /^\s*'(\/[^']*)':\s*\[/gm
  const hits = []
  let m
  while ((m = re.exec(sidebarSource)) !== null) hits.push({ prefix: m[1], start: m.index })
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : sidebarSource.length
    const body = sidebarSource.slice(hits[i].start, end)
    const links = [...body.matchAll(/link:\s*'([^']+)'/g)]
      .map((x) => x[1])
      .filter((x) => x.startsWith('/'))
      .map(normalizeRoute)
    blocks.push({ prefix: hits[i].prefix, links })
  }
}

const problems = []
for (const b of blocks) {
  const dups = [...new Set(b.links.filter((r, i) => b.links.indexOf(r) !== i))]
  for (const d of dups) problems.push(`侧栏重复路由: ${d}（在 ${b.prefix} 块内）`)
}

const sidebarLinks = blocks.flatMap((b) => b.links)
const sidebarRouteSet = new Set(sidebarLinks)

for (const route of sidebarRouteSet) {
  if (!routes.has(route)) problems.push(`侧栏链接不存在: ${route}`)
}

for (const page of pages) {
  if (!sidebarRouteSet.has(page.route)) problems.push(`页面未进入侧栏: ${page.route} (${path.relative(root, page.file)})`)

  const content = fs.readFileSync(page.file, 'utf8')
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g)) {
    const route = localRoute(match[1], page.sourceDirectory)
    if (route && !routes.has(route)) {
      problems.push(`页面链接不存在: ${path.relative(root, page.file)} -> ${match[1]}`)
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exitCode = 1
} else {
  console.log(`文档路由审计通过：${pages.length} 个页面均有有效侧栏入口。`)
}
