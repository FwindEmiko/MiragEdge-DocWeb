// 阶段 3 收尾：config.mts 侧栏补入拆页产生的新页、移除已删页、挂上新增的 start/login
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')
const done = []

function sub(from, to, label) {
  if (!t.includes(from)) { console.log(`✗ ${label}：未命中`); return }
  t = t.replace(from, to)
  done.push(label)
}

// ① enchanting：Aiyatsbus 函数 → host-functions 3 页；Fluxon 参考(整合) → fluxon-pitfalls
sub(
  "                { text: 'Aiyatsbus 函数', link: '/developer/workflows/enchanting/aiyatsbus-fluxon-functions' },",
  "                { text: '宿主函数总览', link: '/developer/workflows/enchanting/host-functions/' },\n                { text: '世界与实体函数', link: '/developer/workflows/enchanting/host-functions/world-entity' },\n                { text: '变量与常用组合', link: '/developer/workflows/enchanting/host-functions/variables-combos' },",
  'enchanting：Aiyatsbus 函数 → host-functions'
)
sub(
  "                { text: 'Fluxon 参考(整合)', link: '/developer/workflows/enchanting/reference' },",
  "                { text: 'Fluxon 避坑与旧写法', link: '/developer/workflows/enchanting/fluxon-pitfalls' },",
  'enchanting：Fluxon 参考 → fluxon-pitfalls'
)

// ② 玩家区：新增 登录与注册
sub(
  "            { text: '账号绑定', link: '/start/account' },",
  "            { text: '账号绑定', link: '/start/account' },\n            { text: '登录与注册', link: '/start/login' },",
  'start：新增 登录与注册'
)

// ③ 开发者区：新增 mc-textures（拆出）与 bounty-hunter（插件文档）
sub(
  "            { text: '配方可视化组件', link: '/developer/website/mcrecipe' },",
  "            { text: '配方可视化组件', link: '/developer/website/mcrecipe' },\n            { text: '已注册物品与材质', link: '/developer/website/mc-textures' },",
  'website：新增 mc-textures'
)
sub(
  "            { text: 'DragonMiao', link: '/plugin-guides/dragonmiao/' },",
  "            { text: 'BountyHunter 赏金猎人', link: '/plugin-guides/bounty-hunter/' },\n            { text: 'DragonMiao', link: '/plugin-guides/dragonmiao/' },",
  'plugin-guides：新增 bounty-hunter'
)

fs.writeFileSync(P, t, 'utf8')
console.log(`\n完成 ${done.length} 处：`)
done.forEach((d) => console.log('  ✓ ' + d))
