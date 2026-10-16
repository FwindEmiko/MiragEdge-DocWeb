// 阶段 2 收尾：删除已并入 index.md 的 info.md；修正 config.mts 中三处失效链接并补齐拆出的新页
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// ① 删除 info.md（内容已并入 index.md）
const infoAbs = path.join(ROOT, 'play/adventure/enchantments/info.md')
if (fs.existsSync(infoAbs)) {
  execFileSync('git', ['rm', '-f', '--quiet', 'play/adventure/enchantments/info.md'], { cwd: ROOT, encoding: 'utf8' })
  console.log('✓ git rm play/adventure/enchantments/info.md')
}

// ② config.mts：附魔组改用 index；繁星组补齐拆出的新页
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')

const FIXES = [
  [
    `                    { text: '入门说明', link: '/play/adventure/enchantments/info' },\n                    { text: '品质等级', link: '/play/adventure/enchantments/rarity' },\n                    { text: '附魔大全', link: '/play/adventure/enchantments/list' },`,
    `                    { text: '附魔总览', link: '/play/adventure/enchantments/' },\n                    { text: '品质等级', link: '/play/adventure/enchantments/rarity' },`,
  ],
  [
    `                    { text: '末地村庄交易大全', link: '/play/adventure/worlds/stellarity/villager-trades' },\n                    { text: '物品与装备', link: '/play/adventure/worlds/stellarity/items' },`,
    `                    { text: '末地村庄交易大全', link: '/play/adventure/worlds/stellarity/trades/' },\n                    { text: '诅咒祭坛与合成', link: '/play/adventure/worlds/stellarity/altar' },\n                    { text: '圣弓与光灵之怒', link: '/play/adventure/worlds/stellarity/sharanga' },\n                    { text: '龙息炼药锅', link: '/play/adventure/worlds/stellarity/cauldron' },\n                    { text: '特殊装备与材料', link: '/play/adventure/worlds/stellarity/equipment' },`,
  ],
]

let n = 0
for (const [o, nw] of FIXES) {
  if (t.includes(o)) { t = t.replace(o, nw); n++ }
  else console.log('✗ 未命中片段：' + o.slice(0, 50) + '…')
}
fs.writeFileSync(P, t, 'utf8')
console.log(`config.mts 替换 ${n} 组`)

// ③ developer/reference/enchantment_ids.md 的死链
const enAbs = path.join(ROOT, 'developer/reference/enchantment_ids.md')
let et = fs.readFileSync(enAbs, 'utf8')
if (et.includes('/play/adventure/enchantments/list')) {
  et = et.split('/play/adventure/enchantments/list').join('/play/adventure/enchantments/')
  fs.writeFileSync(enAbs, et, 'utf8')
  console.log('✓ 修正 developer/reference/enchantment_ids.md 的死链')
} else {
  console.log('· enchantment_ids.md 无该死链')
}
