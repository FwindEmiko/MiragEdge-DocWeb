// 修复构建报出的 7 处死链
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// [文件, 旧, 新]
const FIXES = [
  // ① developer/reference/enchantment_ids.md 指向已被并入的 list 页
  ['developer/reference/enchantment_ids.md', '](/play/adventure/enchantments/list)', '](/play/adventure/enchantments/)'],
  // ② play/adventure/enchantments/info.md 的 ./list
  ['play/adventure/enchantments/info.md', '](./list)', '](./)'],
  // ③ worlds/index.md 的 ./stellarity/items —— items 已拆为 altar/sharanga/cauldron/equipment
  ['play/adventure/worlds/index.md', '](./stellarity/items)', '](./stellarity/equipment)'],
  // ④ stellarity/enchantments.md 的 ./../../../enchantments/index
  ['play/adventure/worlds/stellarity/enchantments.md', '](./../../../enchantments/index)', '](/play/adventure/enchantments/)'],
  // ⑤⑥⑦ play/life/index.md 的三个目录链接需要尾斜杠（VitePress 目录路由形式）
  ['play/life/index.md', '](./fishing)', '](./fishing/)'],
  ['play/life/index.md', '](./food)', '](./food/)'],
  ['play/life/index.md', '](./seasons)', '](./seasons/)'],
]

let n = 0
const miss = []
const touched = new Set()
for (const [file, from, to] of FIXES) {
  const abs = path.join(ROOT, file)
  if (!fs.existsSync(abs)) { miss.push(`文件不存在 ${file}`); continue }
  let t = fs.readFileSync(abs, 'utf8')
  if (!t.includes(from)) { miss.push(`未找到 ${file} 中的 ${from}`); continue }
  t = t.split(from).join(to)
  fs.writeFileSync(abs, t, 'utf8')
  touched.add(file)
  n++
}
console.log(`修复 ${n} 处，涉及 ${touched.size} 个文件`)
if (miss.length) { console.log('未命中：'); miss.forEach((m) => console.log('  - ' + m)) }
