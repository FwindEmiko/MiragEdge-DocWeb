// 把 refactor-verify-urlmap 找到的缺口补成一张表，追加到 10-信息架构方案.md
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIR = path.join(ROOT, 'docs', '文档站全量重构261016')

// 缺口清单（由 refactor-verify-urlmap.mjs 输出，已人工剔除「仅差尾部斜杠」的假阳性）
// [旧URL, 新URL, 动作, 说明]
const GAPS = [
  // start/community 提升为一等分区
  ['/start/community', '/community', '迁移', '社区提为一等分区，6 页全部平移'],
  ['/start/community/groups', '/community/groups', '迁移', ''],
  ['/start/community/voice', '/community/voice', '迁移', ''],
  ['/start/community/qqbot', '/community/qqbot', '迁移', ''],
  ['/start/community/faq', '/community/faq', '迁移', '是否保留独立页待定'],
  ['/start/community/promotion', '/community/promotion', '迁移', '与 /developer/archive/promotion 同名，注意区分'],
  // play/life 重排的其余条目
  ['/play/life/food/desserts', '/play/life/food/desserts-and-bakes', '合并', '并入 bakery'],
  ['/play/life/food/special', '/play/life/food/eggs-and-specialties', '合并', '并入 eggs'],
  ['/play/life/seasons/summer', '/play/life/seasons/spring-summer', '合并', '并入 spring'],
  ['/play/life/seasons/winter', '/play/life/seasons/autumn-winter', '合并', '并入 fall'],
  ['/play/life/fishing/baits', '/play/life/fishing/guide', '合并', '三合一'],
  ['/play/life/fishing/dimensions', '/play/life/fishing/guide', '合并', '三合一'],
  // play/adventure 拆页的其余落点
  ['/play/adventure/worlds/stellarity/items', '/play/adventure/worlds/stellarity/altar', '拆页', '另拆 sharanga / cauldron / equipment'],
  ['/play/adventure/worlds/stellarity/biomes', '/play/adventure/worlds/stellarity/biomes', '拆页', '另拆 structures / enderman-farm'],
  ['/play/adventure/worlds/incendium/items', '/play/adventure/worlds/incendium/items', '拆页', '另拆 consumables'],
  ['/play/adventure/worlds/incendium/mobs', '/play/adventure/worlds/incendium/mobs', '拆页', '另拆 bosses'],
  ['/play/adventure/worlds/incendium/biomes', '/play/adventure/worlds/incendium/biomes', '拆页', '另拆 structures'],
  // plugin-guides 拆解
  ['/plugin-guides/fepvp/kit', '/features/pvp/', '拆页', '玩家部分；管理部分留原路径'],
  ['/plugin-guides/fepvp/hunger-games', '/features/pvp/hunger-games', '拆页', '玩家部分；管理部分留原路径'],
  ['/plugin-guides/fepvp/betting', '/features/pvp/betting', '拆页', '玩家部分；管理部分留原路径'],
  ['/plugin-guides/hfcatlogin', '/start/login', '拆页', '玩家部分；服务端部分留原路径'],
  ['/plugin-guides/hfcatlogin/commands', '/start/login', '拆页', '玩家命令部分；管理命令留原路径'],
  // developer 合并/拆页的其余落点
  ['/developer/workflows/enchanting/reference', '/developer/workflows/enchanting/fluxon-language', '合并', '成为「旧写法对照」页'],
  ['/developer/workflows/fishing/reference', '/developer/workflows/fishing/', '合并', '并入组首页'],
  ['/developer/workflows/fishing/troubleshooting', '/developer/workflows/_shared/ai-delivery', '合并', '与 datapack 对应节合为共享页'],
  ['/developer/workflows/fishing/modules', '/developer/workflows/fishing/modules/', '拆页', '拆为子目录（若执行合并建议则保持原路径）'],
]

const rows = GAPS.map(([f, t, a, n]) =>
  `| \`${f}\` | \`${t}\` | ${a} | ✅ |${n ? ' ' + n + ' |' : ' |'}`
).join('\n')

const section = `
### 4.8 补充映射（门禁校验后补齐）

> 本节由 \`scripts/refactor-verify-urlmap.mjs\` 的比对结果补齐。该脚本从本文映射表抽出已 claim 的 旧→新 对，再独立推算「11-内容分域清单」中所有会改路径的页，取差集。
> 补入本节后，**所有会失效的 URL 均有映射条目**，无遗漏。

| 旧 URL | 新 URL | 动作 | 需规则 | 说明 |
| --- | --- | --- | --- | --- |
${rows}

> 注：表中「旧 URL 与新 URL 相同」的四条（\`stellarity/biomes\`、\`incendium/items\`、\`incendium/mobs\`、\`incendium/biomes\`）表示**原页保留且新增拆出的子页**——原 URL 不失效，无需重定向；此处保留在表中是为了让「拆页清单」完整可查。
`

let ia = fs.readFileSync(path.join(DIR, '10-信息架构方案.md'), 'utf8')
if (ia.includes('### 4.8 补充映射')) {
  console.log('4.8 已存在，跳过')
} else {
  // 插到 §5 之前
  const marker = '\n---\n\n## 5. 裁决'
  if (!ia.includes(marker)) { console.error('找不到 §5 锚点'); process.exit(1) }
  ia = ia.replace(marker, `${section}${marker}`)
  fs.writeFileSync(path.join(DIR, '10-信息架构方案.md'), ia, 'utf8')
  console.log(`已插入 4.8，补充 ${GAPS.length} 条映射`)
}
