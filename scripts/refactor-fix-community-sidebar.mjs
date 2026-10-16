// 修正：给 /community/ 与 / 补 sidebar 块（用 Node 精确插入，PowerShell 的 .Replace 不支持 count）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress/config.mts')
let t = fs.readFileSync(P, 'utf8')

// 先确认上一步没写进去残留（幂等）
if (t.includes("'/community/': [")) {
  console.log('· /community/ 块已存在，跳过')
} else {
  const anchor = "      '/plugin-guides/': ["
  if (!t.includes(anchor)) { console.error('✗ 找不到 /plugin-guides/ 锚点'); process.exit(1) }
  const block = `      '/community/': [
        { text: '💬 社区与支持', link: '/community/' },
        {
          text: '📢 参与社区',
          collapsed: false,
          items: [
            { text: '支持总览', link: '/community/' },
            { text: '玩家交流群组', link: '/community/groups' },
            { text: '官方语音频道', link: '/community/voice' },
            { text: '群服互通机器人', link: '/community/qqbot' },
            { text: '常见问题', link: '/community/faq' },
            { text: '宣传支持', link: '/community/promotion' },
          ]
        },
      ],

`
  t = t.replace(anchor, block + anchor)
  console.log('✓ 插入 /community/ sidebar 块')
}

if (/^\s*'\/':\s*\[/m.test(t)) {
  console.log('· / 块已存在，跳过')
} else {
  const anchor = "      '/start/': ["
  if (!t.includes(anchor)) { console.error('✗ 找不到 /start/ 锚点'); process.exit(1) }
  const block = `      '/': [
        { text: '🧭 开始游戏', link: '/start/' },
        { text: '💬 社区与支持', link: '/community/' },
      ],

`
  t = t.replace(anchor, block + anchor)
  console.log('✓ 插入 / sidebar 块')
}

fs.writeFileSync(P, t, 'utf8')
console.log('\n=== 现有 sidebar 前缀 ===')
for (const m of t.matchAll(/^\s*'(\/[^']*)':\s*\[/gm)) console.log('  ' + m[1])
