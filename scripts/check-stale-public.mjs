// 检查 public/plugins 残留是否进了构建产物，并列出全部残留
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const PUBLIC = path.join(ROOT, 'public')
const DIST = path.join(ROOT, '.vitepress/dist')

for (const stale of ['plugins', 'develop']) {
  const dir = path.join(PUBLIC, stale)
  if (!fs.existsSync(dir)) { console.log(`public/${stale} 不存在`); continue }
  const files = []
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else files.push(path.relative(dir, p).split(path.sep).join('/'))
    }
  }
  walk(dir)
  let inDist = 0
  for (const f of files) if (fs.existsSync(path.join(DIST, stale, f))) inDist++
  console.log(`\npublic/${stale}/ —— ${files.length} 个文件，其中 ${inDist} 个已进 dist（线上可访问）`)
  files.slice(0, 25).forEach((f) => console.log('  ' + f))
}
