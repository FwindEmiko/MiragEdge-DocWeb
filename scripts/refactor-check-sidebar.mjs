// 阶段 1 门禁：校验 config.mts 的 nav / sidebar 里每个 link 都能解析到真实 .md
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const RAW = fs.readFileSync(path.join(ROOT, '.vitepress', 'config.mts'), 'utf8')

// 只取 themeConfig 内、sidebar/nav 区段的 link: '...'（跳过 https 外链）
const links = new Set()
for (const m of RAW.matchAll(/link:\s*'(\/[^']*)'/g)) links.add(m[1])
for (const m of RAW.matchAll(/link:\s*"(\/[^"]*)"/g)) links.add(m[1])
for (const m of RAW.matchAll(/activeMatch:\s*'(\^?\/[^']*)'/g)) {
  const r = m[1].replace(/^\^/, '').replace(/\/$/, '')
  if (r) links.add(r)
}

// 真实路由（不含 .md）
const ROUTES = new Set(['/'])
const stack = [ROOT]
while (stack.length) {
  const cur = stack.pop()
  for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'public' || e.name === 'docs' || e.name === 'build') continue
    const p = path.join(cur, e.name)
    if (e.isDirectory()) stack.push(p)
    else if (e.name.endsWith('.md')) {
      const rel = path.relative(ROOT, p).split(path.sep).join('/')
      const r = '/' + rel.replace(/\.md$/, '')
      ROUTES.add(r)
      ROUTES.add(r.replace(/\/index$/, '') || '/')
    }
  }
}

const bad = []
for (const l of [...links].sort()) {
  const clean = l.replace(/\/$/, '') || '/'
  if (ROUTES.has(clean) || ROUTES.has(l)) continue
  bad.push(l)
}

console.log(`config.mts 中站内 link 共 ${links.size} 条`)
console.log(`无法解析的 ${bad.length} 条：`)
bad.forEach((b) => console.log('  ✗ ' + b))
if (!bad.length) console.log('  （全部可达）')
