// 阶段 2：把 config.mts 侧栏里指向已合并/删除页面的条目改到新页，并对齐 H1 文案
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')

const OLD_FISHING = `            {
              text: '钓鱼系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/fishing/' },
                { text: '鱼竿进阶', link: '/play/life/fishing/guide' },
                { text: '鱼饵系统', link: '/play/life/fishing/baits' },
                { text: '鱼类图鉴', link: '/play/life/fishing/fish' },
                { text: '维度钓鱼', link: '/play/life/fishing/dimensions' },
                { text: '钓鱼比赛', link: '/play/life/fishing/competitions' },
                { text: '特殊道具', link: '/play/life/fishing/driftwood' },
              ]
            },`

const NEW_FISHING = `            {
              text: '钓鱼系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/fishing/' },
                { text: '鱼竿与鱼饵', link: '/play/life/fishing/guide' },
                { text: '鱼类图鉴', link: '/play/life/fishing/fish' },
                { text: '钓鱼比赛', link: '/play/life/fishing/competitions' },
                { text: '隐藏道具 · 浮木', link: '/play/life/fishing/driftwood' },
              ]
            },`

const OLD_FOOD = `            {
              text: '食物系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/food/' },
                { text: '食物速查表', link: '/play/life/food/reference' },
                { text: '早餐简餐', link: '/play/life/food/breakfast' },
                { text: '主菜肉食', link: '/play/life/food/mains' },
                { text: '沙拉凉菜', link: '/play/life/food/salads' },
                { text: '烘焙糕点', link: '/play/life/food/desserts-and-bakes' },
                { text: '甜品', link: '/play/life/food/desserts' },
                { text: '饮品', link: '/play/life/food/drinks' },
                { text: '煎蛋系列', link: '/play/life/food/eggs-and-specialties' },
                { text: '糖果零食', link: '/play/life/food/snacks' },
                { text: '特色食物', link: '/play/life/food/special' },
              ]
            },`

const NEW_FOOD = `            {
              text: '食物系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/food/' },
                { text: '食物速查表', link: '/play/life/food/reference' },
                { text: '早餐简餐', link: '/play/life/food/breakfast' },
                { text: '主菜肉食', link: '/play/life/food/mains' },
                { text: '沙拉凉菜', link: '/play/life/food/salads' },
                { text: '烘焙与甜品', link: '/play/life/food/desserts-and-bakes' },
                { text: '煎蛋与特色食物', link: '/play/life/food/eggs-and-specialties' },
                { text: '饮品', link: '/play/life/food/drinks' },
                { text: '糖果零食', link: '/play/life/food/snacks' },
              ]
            },`

const OLD_SEASONS = `            {
              text: '真实季节(暂弃)',
              collapsed: true,
              items: [
                { text: '季节总览', link: '/play/life/seasons/' },
                { text: '温度系统', link: '/play/life/seasons/mechanisms' },
                { text: '春季', link: '/play/life/seasons/spring-summer' },
                { text: '夏季', link: '/play/life/seasons/summer' },
                { text: '秋季', link: '/play/life/seasons/autumn-winter' },
                { text: '冬季', link: '/play/life/seasons/winter' },
              ]
            },`

const NEW_SEASONS = `            {
              text: '季节系统',
              collapsed: true,
              items: [
                { text: '季节总览', link: '/play/life/seasons/' },
                { text: '温度机制', link: '/play/life/seasons/mechanisms' },
                { text: '春季与夏季', link: '/play/life/seasons/spring-summer' },
                { text: '秋季与冬季', link: '/play/life/seasons/autumn-winter' },
              ]
            },`

let n = 0
for (const [o, nw, label] of [
  [OLD_FISHING, NEW_FISHING, '钓鱼组'],
  [OLD_FOOD, NEW_FOOD, '食物组'],
  [OLD_SEASONS, NEW_SEASONS, '季节组'],
]) {
  if (t.includes(o)) { t = t.replace(o, nw); n++; console.log(`✓ ${label} 已重写`) }
  else console.log(`✗ ${label} 未命中（检查缩进）`)
}
fs.writeFileSync(P, t, 'utf8')
console.log(`共替换 ${n} 组`)
