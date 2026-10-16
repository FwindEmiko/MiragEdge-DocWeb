// 修正拆页后子目录页面里指向父级页面的相对链接（./x → ../x）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// 收集所有真实路由（相对项目根）
const ROUTES = new Set()
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) ROUTES.add('/' + path.relative(ROOT, p).split(path.sep).join('/').replace(/\.md$/, ''))
    }
  }
}

function stripCode(t) { return t.replace(/```[\s\S]*?```/g, '') }

let fixedFiles = 0
const log = []

// 扫描所有 md，修正「解析后不存在、但把 ./ 换成 ../ 后存在」的相对链接
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) { stack.push(p); continue }
      if (!e.name.endsWith('.md')) continue

      const relFile = path.relative(ROOT, p).split(path.sep).join('/')
      const dir = path.posix.dirname(relFile)
      const raw = fs.readFileSync(p, 'utf8')
      const body = stripCode(raw)
      if (!/\]\(\.\//.test(body)) continue

      let changed = false
      const out = raw.replace(/\]\((\.\/[^)\s#]*)(#[^)\s]*)?\)/g, (m, link, hash = '') => {
        if (/\.(png|jpe?g|webp|svg|gif|mp4)$/i.test(link)) return m
        const target = '/' + path.posix.normalize(path.posix.join(dir, link))
        if (ROUTES.has(target) || ROUTES.has(target + '/')) return m
        // 试 ../ 形态
        const up = '/' + path.posix.normalize(path.posix.join(dir, '..', link.slice(2)))
        if (ROUTES.has(up) || ROUTES.has(up + '/')) {
          changed = true
          log.push(`${relFile}: ${link}${hash} -> ../${link.slice(2)}${hash}`)
          return `](../${link.slice(2)}${hash})`
        }
        return m
      })
      if (changed) { fs.writeFileSync(p, out, 'utf8'); fixedFiles++ }
    }
  }
}

console.log(`修正 ${log.length} 条链接，涉及 ${fixedFiles} 个文件：`)
log.forEach((l) => console.log('  ' + l))
