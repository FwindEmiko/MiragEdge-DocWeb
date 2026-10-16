// 校验站内锚点链接（/path#anchor 与 ./path#anchor）目标页是否真有该标题
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']

const files = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}
if (fs.existsSync(path.join(ROOT, 'index.md'))) files.push(path.join(ROOT, 'index.md'))

// 收集每个页面的标题集合（含 VitePress 的 slugify 近似）
function slugify(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
}
function addAnchors(map, route, text) {
  const body = text.replace(/```[\s\S]*?```/g, '')
  const set = map.get(route) ?? new Set()
  for (const m of body.matchAll(/^(#{1,6})\s+(.+)$/gm)) set.add(slugify(m[2]))
  map.set(route, set)
}

const anchors = new Map()
const routeOfFile = new Map()
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')
  const route = '/' + rel.replace(/\.md$/, '')
  const route2 = '/' + rel.replace(/\.md$/, '').replace(/\/index$/, '')
  const t = fs.readFileSync(f, 'utf8')
  addAnchors(anchors, route, t)
  if (route2 !== route) {
    const s2 = new Set([...(anchors.get(route) ?? [])])
    anchors.set(route2, s2)
  }
  routeOfFile.set(route, rel)
  if (route2 !== route) routeOfFile.set(route2, rel)
}
anchors.set('/', anchors.get('/index') ?? new Set())

const bad = []
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')
  const dir = path.posix.dirname(rel)
  const body = fs.readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '')
  for (const m of body.matchAll(/\]\(([^)\s]*)#([^)\s]+)\)/g)) {
    const target = m[1]
    const anchor = slugify(decodeURIComponent(m[2]))
    if (/^https?:/.test(target)) continue
    let route
    if (target.startsWith('/')) route = target.replace(/\.md$/, '').replace(/\/$/, '') || '/'
    else if (target === '' || target === '.') route = '/' + dir
    else {
      const joined = path.posix.normalize(path.posix.join(dir, target)).replace(/\.md$/, '')
      route = '/' + joined
    }
    const set = anchors.get(route)
    if (!set) { bad.push(`${rel} -> ${target}#${m[2]}  (目标页不存在)`); continue }
    if (!set.has(anchor)) bad.push(`${rel} -> ${target}#${m[2]}  (目标页无此标题)`)
  }
}

console.log(`扫描 ${files.length} 个文件；锚点链接问题 ${bad.length} 条：`)
const uniq = [...new Set(bad)]
uniq.forEach((b) => console.log('  ! ' + b))
