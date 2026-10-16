// 给 17 张新 SVG 的 <SmartImage> 补 alt（w4g 已给出文案；开发者区 6 张按图意生成）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// src -> alt 文案
const ALT = {
  '/images/start/index/onboarding-four-steps.svg': '入服四步流程图：看新玩家须知、安装客户端、连接服务器、绑定账号',
  '/images/start/account/bind-flow.svg': '账号绑定三步流程图：进服拿 4 位验证码、回群发送「绑定 + 验证码」、绑定生效',
  '/images/start/bedrock/java-vs-bedrock.svg': 'Java 版与基岩版差异对照图，中间标注互通硬限制',
  '/images/play/systems/dom/create-flow.svg': '创建领地三环节流程图：选点、确认范围、设置权限',
  '/images/features/chest-shop/trade-flow.svg': '箱子商店从摆摊到成交的四步流程图',
  '/images/play/adventure/enchantments/acquire-paths.svg': '附魔三条来路汇入同一套附魔体系的关系图',
  '/images/play/life/fishing/competitions-flow.svg': '钓鱼比赛赛程图：报名、开赛、计分、结算三档奖励',
  '/images/play/life/food/food-map.svg': '食物分类、品质与效果三层关系图',
  '/images/features/nophantom/activation-flow.svg': '免幻翼激活判定流程图，不符合则维持原版行为',
  '/images/features/global-market/market-ui.svg': '全服市场界面示意图，含在售商品、收购需求、拍卖、个人邮箱四个区块',
  '/images/features/flight-guard/check-flow.svg': '飞行四道判定流程图：时间余额、战斗状态、手持武器、区域与高度',
  '/images/developer/reference/architecture.svg': '服务器整体架构图：客户端、代理层、后端层、内容层四层及层间数据流',
  '/images/developer/workflows/datapack/stage-flow.svg': '数据包工作流四阶段循环图：编写、校验、部署、回滚',
  '/images/developer/workflows/craftengine/texture-pipeline.svg': 'CraftEngine 材质管线图：定义、纹理、模型、基岩转换',
  '/images/developer/workflows/enchanting/layers.svg': '附魔系统四层结构图：数据包、插件、触发器、运行时',
  '/images/developer/workflows/geyser/conversion-flow.svg': 'Geyser 资源包转换链路图：冻结版本、选输入包、采集、审查映射、受控部署',
  '/images/developer/website/content-pipeline.svg': '文档站内容流水线图：源 markdown、生成 llms、构建、水印',
}

const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
const files = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}

let added = 0
const log = []
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')
  const src = fs.readFileSync(f, 'utf8')
  let out = src
  // 匹配 <SmartImage ... /> 单行或多行，补/换 alt
  out = out.replace(/<SmartImage\b[\s\S]*?\/>/g, (block) => {
    const m = /src\s*=\s*["']([^"']+)["']/.exec(block)
    if (!m) return block
    const url = m[1]
    const want = ALT[url]
    if (!want) return block
    let b = block
    if (/\balt\s*=\s*["'][^"']*["']/.test(b)) {
      b = b.replace(/\balt\s*=\s*["'][^"']*["']/, `alt="${want}"`)
    } else {
      // 在 src 之后插入 alt
      b = b.replace(/(src\s*=\s*["'][^"']+["'])/, `$1\n  alt="${want}"`)
    }
    if (b !== block) { added++; log.push(`${rel}  ${url}`) }
    return b
  })
  if (out !== src) fs.writeFileSync(f, out, 'utf8')
}

console.log(`补/改 alt 共 ${added} 处：`)
log.forEach((l) => console.log('  ' + l))
