// 把拆页产生的新页补进 config.mts 侧栏（geyser 4 页 + conversion 3 页 + craftengine 1 页 + _shared 1 页 + 职业交易 13 页 + start 2 页）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')
const done = []

function sub(from, to, label) {
  if (!t.includes(from)) { console.log(`✗ ${label}`); return false }
  t = t.replace(from, to); done.push(label); return true
}

// ① geyser 组：补 bedrock-pack / item-mapping / block-mapping / extension-dev
sub(
  "                { text: '转换与发布', link: '/developer/workflows/geyser/conversion' },",
  "                { text: '资源包结构', link: '/developer/workflows/geyser/bedrock-pack' },\n                { text: '物品映射', link: '/developer/workflows/geyser/item-mapping' },\n                { text: '方块映射', link: '/developer/workflows/geyser/block-mapping' },\n                { text: 'Extension API 开发', link: '/developer/workflows/geyser/extension-dev' },\n                { text: '转换与发布', link: '/developer/workflows/geyser/conversion/' },\n                { text: '冻结与输入锁定', link: '/developer/workflows/geyser/conversion/input-lock' },\n                { text: 'Rainbow 采集与映射审查', link: '/developer/workflows/geyser/conversion/rainbow' },\n                { text: '受控部署与回滚', link: '/developer/workflows/geyser/conversion/deploy' },\n                { text: 'CE 资源来源', link: '/developer/workflows/geyser/craftengine/resource-sources' },",
  'geyser 组补 9 页'
)

// ② geyser 组末尾补共享页
sub(
  "                { text: '协议与产物参考', link: '/developer/workflows/geyser/reference' },",
  "                { text: '协议与产物参考', link: '/developer/workflows/geyser/reference' },\n                { text: 'AI 交付规范（共享）', link: '/developer/workflows/_shared/ai-delivery' },",
  'geyser 组补 _shared/ai-delivery'
)

// ③ start 组补 main-city / new-server
sub(
  "            { text: '登录与注册', link: '/start/login' },",
  "            { text: '登录与注册', link: '/start/login' },\n            { text: '主城共建', link: '/start/main-city' },\n            { text: '新服规则与区域', link: '/start/new-server' },",
  'start 组补 main-city / new-server'
)

// ④ 繁星交易：13 职业入侧栏
sub(
  "                    { text: '末地村庄交易大全', link: '/play/adventure/worlds/stellarity/trades/' },",
  `                    {
                      text: '末地村庄交易大全',
                      collapsed: true,
                      link: '/play/adventure/worlds/stellarity/trades/',
                      items: [
                        { text: '盔甲匠', link: '/play/adventure/worlds/stellarity/trades/armorer' },
                        { text: '屠夫', link: '/play/adventure/worlds/stellarity/trades/butcher' },
                        { text: '制图师', link: '/play/adventure/worlds/stellarity/trades/cartographer' },
                        { text: '神职人员', link: '/play/adventure/worlds/stellarity/trades/cleric' },
                        { text: '农民', link: '/play/adventure/worlds/stellarity/trades/farmer' },
                        { text: '渔夫', link: '/play/adventure/worlds/stellarity/trades/fisherman' },
                        { text: '制箭师', link: '/play/adventure/worlds/stellarity/trades/fletcher' },
                        { text: '皮匠', link: '/play/adventure/worlds/stellarity/trades/leatherworker' },
                        { text: '图书管理员', link: '/play/adventure/worlds/stellarity/trades/librarian' },
                        { text: '石匠', link: '/play/adventure/worlds/stellarity/trades/mason' },
                        { text: '牧羊人', link: '/play/adventure/worlds/stellarity/trades/shepherd' },
                        { text: '工具匠', link: '/play/adventure/worlds/stellarity/trades/toolsmith' },
                        { text: '武器匠', link: '/play/adventure/worlds/stellarity/trades/weaponsmith' },
                      ]
                    },`,
  '繁星交易 13 职业入侧栏'
)

fs.writeFileSync(P, t, 'utf8')
console.log(`完成 ${done.length} 处：`)
done.forEach((d) => console.log('  ✓ ' + d))
