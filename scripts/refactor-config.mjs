// 阶段 1：按 10-信息架构方案.md §3 重写 config.mts 的 nav 与 /plugins/ 侧栏块 → /features/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')
let t = fs.readFileSync(P, 'utf8')
const before = t.length
const app = []

function replaceOnce(oldStr, newStr, label) {
  const i = t.indexOf(oldStr)
  if (i === -1) { app.push(`✗ ${label}：未找到`); return }
  if (t.indexOf(oldStr, i + 1) !== -1) { app.push(`✗ ${label}：出现多次，拒绝替换`); return }
  t = t.slice(0, i) + newStr + t.slice(i + oldStr.length)
  app.push(`✓ ${label}`)
}

// ── ① nav：玩家 5 项，移除开发者入口与插件文档入口 ──────────────
const NAV_OLD = `    // 品牌标题本身返回首页；顶栏保留玩家常用入口和始终可达的开发入口。
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '🧭 开始游戏', link: '/start/', activeMatch: '^/start/' },
      { text: '⚒️ 生存玩法', link: '/play/', activeMatch: '^/play/' },
      { text: '✨ 特色功能', link: '/plugins/', activeMatch: '^/plugins/' },
      { text: '🛠️ 开发者文档', link: '/developer/', activeMatch: '^/developer/' },
      {
        text: '更多',
        items: [
          { text: '原创插件文档', link: '/plugin-guides/', activeMatch: '^/plugin-guides/' },
          { text: '历史活动记录', link: '/archive/' },
          { text: '网站源码仓库', link: 'https://github.com/fwindemiko/MiragEdge-DocWeb', target: '_blank', rel: 'noopener noreferrer' },
        ]
      },
    ],`

const NAV_NEW = `    // 玩家导航：只放玩家入口，开发者入口改由页脚固定链接提供（见下方 footer）
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '🧭 开始游戏', link: '/start/', activeMatch: '^/start/' },
      { text: '⚒️ 玩法', link: '/play/', activeMatch: '^/play/' },
      { text: '✨ 功能', link: '/features/', activeMatch: '^/features/' },
      { text: '💬 社区', link: '/community/', activeMatch: '^/community/' },
      {
        text: '更多',
        items: [
          { text: '历史活动记录', link: '/archive/' },
          { text: '开发者与服主入口', link: '/developer/', rel: 'nofollow' },
          { text: '网站源码仓库', link: 'https://github.com/fwindemiko/MiragEdge-DocWeb', target: '_blank', rel: 'noopener noreferrer' },
        ]
      },
    ],`

replaceOnce(NAV_OLD, NAV_NEW, 'nav 重写')

// ── ② /plugins/ 侧栏块 → /features/（打平 + PvP 新组）───────────
const SIDEBAR_OLD_START = `      '/plugins/': [`
const PLUGINS_NEW = `      '/features/': [
        { text: '✨ 服务器功能', link: '/features/' },
        {
          text: '🧰 移动与日常',
          collapsed: false,
          items: [
            { text: '星辉锚点', link: '/features/anchor' },
            { text: '死亡回程', link: '/features/death-return' },
            { text: '日常便利', link: '/features/daily-tools' },
            { text: '幻空翼', link: '/features/sky-elytra' },
          ]
        },
        {
          text: '🏗️ 建造与装备',
          collapsed: false,
          items: [
            { text: '建筑大师', link: '/features/building-tools' },
            { text: '史莱姆靴', link: '/features/slime-boots' },
            { text: '锻造升级', link: '/features/forge' },
            { text: '契约之翼', link: '/features/elytra-bind' },
            { text: '体型装备', link: '/features/body-size' },
          ]
        },
        {
          text: '💬 交易与互动',
          collapsed: false,
          items: [
            { text: '箱子商店', link: '/features/chest-shop' },
            { text: '全服市场', link: '/features/global-market' },
            { text: '方块银行', link: '/features/block-bank' },
            { text: '知识问答', link: '/features/quiz' },
            { text: '赏金猎人', link: '/features/bounty-hunter' },
            { text: '生物捕捉', link: '/features/mob-capture' },
            { text: '称号与入服消息', link: '/features/title' },
            { text: '月卡与通行权益', link: '/features/monthly-pass' },
          ]
        },
        {
          text: '⚔️ 竞技与对战',
          collapsed: false,
          items: [
            { text: '竞技系统总览', link: '/features/pvp/' },
            { text: '饥饿游戏', link: '/features/pvp/hunger-games' },
            { text: '押注决斗', link: '/features/pvp/betting' },
            { text: '段位与排行榜', link: '/features/pvp/ranking' },
          ]
        },
        {
          text: '🛡️ 自动规则',
          collapsed: false,
          items: [
            { text: '飞行武器限制', link: '/features/flight-guard' },
            { text: '免幻翼', link: '/features/nophantom' },
            { text: '缚灵钢符', link: '/features/piglin-talisman' },
          ]
        },
      ],`

// 找到 '/plugins/': [ 到匹配的结尾 `      ],`
const startIdx = t.indexOf(SIDEBAR_OLD_START)
if (startIdx === -1) {
  app.push('✗ /plugins/ 侧栏块：未找到')
} else {
  // 括号匹配定位块尾
  let depth = 0
  let i = t.indexOf('[', startIdx)
  let end = -1
  for (; i < t.length; i++) {
    if (t[i] === '[') depth++
    else if (t[i] === ']') { depth--; if (depth === 0) { end = i + 1; break } }
  }
  if (end === -1) app.push('✗ /plugins/ 侧栏块：括号不匹配')
  else {
    t = t.slice(0, startIdx) + PLUGINS_NEW + t.slice(end)
    app.push('✓ /plugins/ 侧栏块 → /features/（打平 + 竞技与对战组）')
  }
}

fs.writeFileSync(P, t, 'utf8')
console.log(`config.mts: ${before} -> ${t.length} 字节`)
app.forEach((a) => console.log('  ' + a))
