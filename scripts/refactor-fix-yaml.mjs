// 修复 YAML frontmatter 里未加引号、却含冒号的 description/title（会让 build 直接失败）
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

const fixed = []
const problems = []

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8')
  if (!/^---\r?\n/.test(raw)) continue
  const end = raw.indexOf('\n---', 3)
  if (end === -1) continue
  const fm = raw.slice(0, end)
  const rest = raw.slice(end)

  let changed = false
  const fmLines = fm.split('\n').map((line) => {
    const m = /^(title|description):\s*(.+)$/.exec(line)
    if (!m) return line
    const key = m[1]
    let val = m[2].trim()
    if (!val) return line
    // 已加引号则跳过
    if (/^(['"]).*\1$/.test(val)) return line
    // 纯量里只要出现冒号就一律加引号：YAML 中「key: value」的值含 `:` 会被解析成嵌套映射
    // （如 `fs:time`、`::`、`说明：`），是最常见的构建中断原因，加引号零风险。
    if (val.includes(':') || val.includes('#')) {
      const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      changed = true
      return `${key}: "${escaped}"`
    }
    return line
  })

  if (!changed) continue
  const out = fmLines.join('\n') + rest
  fs.writeFileSync(f, out, 'utf8')
  fixed.push(path.relative(ROOT, f).split(path.sep).join('/'))
}

console.log(`修复 ${fixed.length} 个文件的 frontmatter：`)
fixed.forEach((x) => console.log('  ' + x))
if (problems.length) { console.log('失败：'); problems.forEach((p) => console.log('  ' + p)) }
