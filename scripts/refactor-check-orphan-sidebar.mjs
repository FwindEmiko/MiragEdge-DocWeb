// 反向检查：每个页面路由是否落在某个 sidebar 前缀内；不在的页面在线上就是「没有侧栏」
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const CFG = path.join(ROOT, '.vitepress/config.mts')
const cfg = fs.readFileSync(CFG, 'utf8')

// 抓出 sidebar 的 key（形如 '/start/': [ ）与第一个参数对象里的 base
const sidebarStart = cfg.indexOf('sidebar: {')
const sidebarEnd = cfg.indexOf('// 社交链接', sidebarStart)
const sidebarSrc = cfg.slice(sidebarStart, sidebarEnd === -1 ? cfg.length : sidebarEnd)

const prefixes = [...sidebarSrc.matchAll(/^\s*'(\/[^']*)':\s*\[/gm)].map((m) => m[1])
console.log('=== sidebar 前缀 ===')
prefixes.forEach((p) => console.log('  ' + p))

const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
const routes = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) {
        const rel = path.relative(ROOT, p).split(path.sep).join('/')
        routes.push('/' + rel.replace(/\.md$/, '').replace(/\/index$/, ''))
      }
    }
  }
}
routes.push('/')

const covered = (r) => prefixes.some((p) => r === p.replace(/\/$/, '') || r.startsWith(p))

const orphan = routes.filter((r) => !covered(r)).sort()
console.log(`\n=== 总路由 ${routes.length} 条；不在任何 sidebar 前缀内的 ${orphan.length} 条 ===`)
orphan.forEach((o) => console.log('  ✗ ' + o))

// 按顶层目录归类
const byTop = {}
for (const o of orphan) {
  const top = o.split('/')[1] || '(根)'
  byTop[top] = (byTop[top] || 0) + 1
}
console.log('\n=== 按顶层目录归类 ===')
for (const [k, v] of Object.entries(byTop).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
