// 阶段 1：把 config.mts 侧栏/导航里残留的旧路径改到新位置
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')

// 顺序敏感：先长前缀，后短前缀
const MAP = [
  // 社区提为一等分区
  ["'/start/community/'", "'/community/'"],
  ["'/start/community", "'/community"],
  // 工会 / 生电归位
  ["'/start/guild'", "'/play/systems/guild'"],
  ["'/start/redstone'", "'/play/systems/redstone'"],
  // play/life 重排
  ["'/play/life/food/info'", "'/play/life/food/'"],
  ["'/play/life/food/bakery'", "'/play/life/food/desserts-and-bakes'"],
  ["'/play/life/food/eggs'", "'/play/life/food/eggs-and-specialties'"],
  ["'/play/life/fishing/info'", "'/play/life/fishing/'"],
  ["'/play/life/fishing/rods'", "'/play/life/fishing/guide'"],
  ["'/play/life/seasons/info'", "'/play/life/seasons/'"],
  ["'/play/life/seasons/temperature'", "'/play/life/seasons/mechanisms'"],
  ["'/play/life/seasons/spring'", "'/play/life/seasons/spring-summer'"],
  ["'/play/life/seasons/fall'", "'/play/life/seasons/autumn-winter'"],
  // 开发者归位
  ["'/developer/design/liveops_260107'", "'/developer/archive/design/liveops_260107'"],
]

let n = 0
const detail = []
for (const [from, to] of MAP) {
  const c = t.split(from).length - 1
  if (c) { t = t.split(from).join(to); n += c; detail.push(`${from} -> ${to}  (${c})`) }
}
fs.writeFileSync(P, t, 'utf8')
console.log(`替换 ${n} 处：`)
detail.forEach((d) => console.log('  ' + d))
