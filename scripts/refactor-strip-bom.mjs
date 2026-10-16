// 检出并清除 markdown 文件开头的 UTF-8 BOM（\uFEFF）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
const write = process.argv.includes('--write')

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
const home = path.join(ROOT, 'index.md')
if (fs.existsSync(home)) files.push(home)

const withBom = []
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8')
  if (raw.charCodeAt(0) === 0xfeff) {
    withBom.push(path.relative(ROOT, f).split(path.sep).join('/'))
    if (write) {
      const clean = raw.slice(1)
      fs.writeFileSync(f, clean, 'utf8')
    }
  }
}

console.log(`扫描 ${files.length} 个文件；带 BOM 的 ${withBom.length} 个${write ? '（已清除）' : '（未写盘，加 --write 才清除）'}`)
withBom.forEach((b) => console.log('  ' + b))
