// 修正 geyser 子目录页里指向父级目录页（后端为 <dir>/index.md）的相对链接
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// [文件, 旧, 新]
const FIXES = [
  ['developer/workflows/geyser/conversion/index.md', '](./craftengine)', '](../craftengine/)'],
  ['developer/workflows/geyser/index.md', '](./craftengine)', '](./craftengine/)'],
]

let n = 0
for (const [f, from, to] of FIXES) {
  const abs = path.join(ROOT, f)
  let t = fs.readFileSync(abs, 'utf8')
  if (!t.includes(from)) { console.log(`✗ ${f} 未找到 ${from}`); continue }
  const c = t.split(from).length - 1
  t = t.split(from).join(to)
  fs.writeFileSync(abs, t, 'utf8')
  n += c
  console.log(`✓ ${f}：${from} -> ${to}（${c} 处）`)
}
console.log(`共 ${n} 处`)
