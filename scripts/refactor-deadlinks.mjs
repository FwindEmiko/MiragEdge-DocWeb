// 阶段 1 门禁：校验全站站内链接（绝对式 + 相对式）是否都能解析到真实 .md
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const CONTENT_DIRS = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']

const files = []
for (const d of CONTENT_DIRS) {
  const a = path.join(ROOT, d)
  if (!fs.existsSync(a)) continue
  const stack = [a]
  while (stack.length) {
    const cur = stack.pop()
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const p = path.join(cur, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}
if (fs.existsSync(path.join(ROOT, 'index.md'))) files.push(path.join(ROOT, 'index.md'))

// 真实路由集合（不含 .md）
const ROUTES = new Set(['/'])
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')
  ROUTES.add('/' + rel.replace(/\.md$/, ''))
  ROUTES.add('/' + rel.replace(/\.md$/, '').replace(/\/index$/, ''))
}

function stripCode(t) {
  return t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

const broken = []
let checked = 0
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const dir = path.posix.dirname(rel)
  const body = stripCode(fs.readFileSync(file, 'utf8'))

  const links = []
  // ① 绝对式
  for (const m of body.matchAll(/\]\((\/[^)\s#]*)/g)) links.push({ raw: m[1], abs: true })
  for (const m of body.matchAll(/href=["'](\/[^"'#]*)/g)) links.push({ raw: m[1], abs: true })
  // ② 相对式（排除图片）
  for (const m of body.matchAll(/\]\((\.{1,2}\/[^)\s#]*)/g)) {
    if (/\.(png|jpe?g|webp|svg|gif|mp4|gif)$/i.test(m[1])) continue
    links.push({ raw: m[1], abs: false })
  }

  for (const l of links) {
    checked++
    let route
    if (l.abs) {
      route = l.raw.replace(/\.md$/, '')
    } else {
      const joined = path.posix.normalize(path.posix.join(dir, l.raw)).replace(/\.md$/, '')
      route = '/' + joined
    }
    if (ROUTES.has(route)) continue
    if (ROUTES.has(route + '/')) continue
    if (route.endsWith('/') && ROUTES.has(route.slice(0, -1))) continue
    broken.push(`${rel}  ->  ${l.raw}   (解析为 ${route})`)
  }
}

console.log(`扫描 ${files.length} 个文件，检查 ${checked} 条站内链接`)
console.log(`死链 ${broken.length} 条：`)
const uniq = [...new Set(broken)]
uniq.forEach((b) => console.log('  ! ' + b))
