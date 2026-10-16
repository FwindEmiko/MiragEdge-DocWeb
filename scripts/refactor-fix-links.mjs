// 修复 25 条迁移后死链：① 首轮 buggy 产生的 /../ 式相对路径 ② features/index.md 指向已不存在的 custom/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// 逐文件、逐条精确修复：[文件, 原链接, 新链接]
const FIXES = [
  // play/life/index.md —— 三个 info 已改名为 index，相对路径应为同级目录
  ['play/life/index.md', '../../../play/life/fishing', './fishing'],
  ['play/life/index.md', '../../../play/life/food', './food'],
  ['play/life/index.md', '../../../play/life/seasons', './seasons'],
  // play/life/seasons/index.md
  ['play/life/seasons/index.md', '../../../../play/life/seasons/mechanisms', './mechanisms'],
  ['play/life/seasons/index.md', '../../../../play/life/seasons/spring-summer', './spring-summer'],
  ['play/life/seasons/index.md', '../../../../play/life/seasons/autumn-winter', './autumn-winter'],
  // mechanisms.md 指回分区首页
  ['play/life/seasons/mechanisms.md', '../../../../play/life/seasons', './'],
  // fishing/index.md
  ['play/life/fishing/index.md', '../../../../play/life/fishing/guide', './guide'],
  // archive/index.md 指回已迁出的 main-city
  ['archive/index.md', '../../start/main-city', '/start/main-city'],
]

// features/index.md：custom/ 子目录已打平，逐条改到新 slug
const FEATURES_FIX = [
  ['./custom/miragedge-home', './anchor'],
  ['./custom/death-return', './death-return'],
  ['./custom/sky-elytra', './sky-elytra'],
  ['./custom/chest-shop', './chest-shop'],
  ['./custom/global-market', './global-market'],
  ['./custom/emc-shop', './block-bank'],
  ['./custom/mob-capture', './mob-capture'],
  ['./custom/quiz', './quiz'],
  ['./custom/monthly-pass', './monthly-pass'],
  ['./custom/miragedge-title', './title'],
  ['./custom/flight-guard', './flight-guard'],
  ['./custom/nophantom', './nophantom'],
]

let n = 0
const misses = []
for (const [file, from, to] of FIXES) {
  const abs = path.join(ROOT, file)
  if (!fs.existsSync(abs)) { misses.push(`文件不存在 ${file}`); continue }
  let t = fs.readFileSync(abs, 'utf8')
  if (!t.includes(from)) { misses.push(`未找到 ${file} 中的 ${from}`); continue }
  fs.writeFileSync(abs, t.split(from).join(to), 'utf8')
  n++
}
// features/index.md 批量
const fi = path.join(ROOT, 'features/index.md')
let t = fs.readFileSync(fi, 'utf8')
for (const [from, to] of FEATURES_FIX) {
  if (t.includes(from)) { t = t.split(from).join(to); n++ } else misses.push(`features/index.md 未找到 ${from}`)
}
fs.writeFileSync(fi, t, 'utf8')

console.log(`修复 ${n} 条`)
if (misses.length) { console.log(`未命中 ${misses.length}:`); misses.forEach((m) => console.log('  -', m)) }
