// 修正 config.mts 中因拆页而失效的 3 条链接，并补齐拆出的新页入口
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')

const FIXES = [
  // 附魔大全：list.md 已并入 index
  [
    "{ text: '附魔大全', link: '/play/adventure/enchantments/list' },",
    "{ text: '附魔大全', link: '/play/adventure/enchantments/' },",
  ],
  // 繁星：villager-trades 拆 14 页 → trades/ 汇总；items 拆 4 页
  [
    "                { text: '末地村庄交易大全', link: '/play/adventure/worlds/stellarity/villager-trades' },\n                { text: '物品与装备', link: '/play/adventure/worlds/stellarity/items' },",
    "                { text: '末地村庄交易大全', link: '/play/adventure/worlds/stellarity/trades/' },\n                { text: '诅咒祭坛与合成', link: '/play/adventure/worlds/stellarity/altar' },\n                { text: '圣弓与光灵之怒', link: '/play/adventure/worlds/stellarity/sharanga' },\n                { text: '龙息炼药锅', link: '/play/adventure/worlds/stellarity/cauldron' },\n                { text: '特殊装备与材料', link: '/play/adventure/worlds/stellarity/equipment' },",
  ],
]

let n = 0
for (const [o, nw] of FIXES) {
  if (t.includes(o)) { t = t.replace(o, nw); n++; console.log('✓ 已替换一处') }
  else console.log('✗ 未命中：' + o.slice(0, 60) + '…')
}
fs.writeFileSync(P, t, 'utf8')
console.log(`共 ${n} 处`)
