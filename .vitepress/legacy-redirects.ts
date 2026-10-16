import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

type RedirectRule = {
  from: string
  to: string
}

type PrefixRule = [from: string, to: string]

const prefixRules: PrefixRule[] = [
  ['/features/adventure/datapack', '/play/adventure/worlds'],
  ['/features/adventure/mmo', '/play/adventure/equipment'],
  ['/features/pastoral/croups', '/play/life/farming'],
  ['/features/base', '/play/systems'],
  ['/features/pastoral', '/play/life'],
  ['/features/adventure', '/play/adventure'],
  ['/features', '/play'],
  ['/manual/tutorial', '/start'],
  ['/manual/function', '/start/community'],
  ['/community', '/start/community'],
  ['/manual/other', '/start'],
  ['/manual/active', '/archive/events'],
  ['/develop/workflows/ce-armor-workflow', '/developer/workflows/craftengine/armor'],
  ['/develop/workflows/ce-reference', '/developer/workflows/craftengine/reference'],
  ['/develop/workflows/ce-workflow', '/developer/workflows/craftengine'],
  ['/develop/workflows/customcrops-workflow', '/developer/workflows/custom-crops'],
  ['/develop/workflows/datapack-workflow', '/developer/workflows/datapack'],
  ['/develop/workflows/enchanting-workflow', '/developer/workflows/enchanting'],
  ['/develop/workflows/fishing-workflow', '/developer/workflows/fishing'],
  ['/develop/server_configs', '/developer/reference'],
  ['/develop/gameplay', '/developer/design'],
  ['/develop/webdev', '/developer/website'],
  ['/develop', '/developer'],
  // PvP 已上线，/plugins/pvp* 的旧地址由下方 exactRules 指向玩家区 /features/pvp（不再映射到 plugin-guides）
  ['/plugins/bugenchantremover', '/plugin-guides/bug-enchant-remover'],
  ['/plugins/bug-enchant-remover', '/plugin-guides/bug-enchant-remover'],
  ['/developer/reference/plugins/bug-enchant-remover', '/plugin-guides/bug-enchant-remover'],
  ['/plugin-guides/ultimateshop', '/developer/reference/ultimateshop'],
  // 2026-10 全量重构：plugins/ 改名 /features/
  // 必须放在此处（列表末尾）：mapPrefixRoute 按顺序遍历，前缀映射对每个现存路由
  // 反推出旧 URL，从而为全部 /features/** 页面保留其 /plugins/** 旧地址。
  ['/plugins', '/features'],
]

const exactRules: RedirectRule[] = [
  { from: '/manual/tutorial/clientinstall', to: '/start/install' },
  { from: '/manual/tutorial/serverjoin', to: '/start/join' },
  { from: '/manual/tutorial/bedrock', to: '/start/bedrock' },
  { from: '/manual/tutorial/whitelist', to: '/start/account' },
  { from: '/manual/function/voicechannel', to: '/start/community/voice' },
  { from: '/manual/function/qqbot', to: '/start/community/qqbot' },
  { from: '/manual/function/mod', to: '/start/compatibility' },
  { from: '/manual/other/worldview', to: '/start/worldview' },
  { from: '/manual/redstone_mechanism', to: '/start/redstone' },
  { from: '/manual/qq_group', to: '/start/community/groups' },
  { from: '/manual/eula', to: '/start/rules' },
  { from: '/manual/review', to: '/start/welcome' },
  { from: '/manual/faq', to: '/start/community/faq' },
  { from: '/start/new-server', to: '/start' },
  { from: '/start/main-city', to: '/archive/start/main-city' },
  { from: '/start/qq_group', to: '/start/community/groups' },
  { from: '/start/faq', to: '/start/community/faq' },
  { from: '/manual/promotion', to: '/developer/archive/promotion' },
  { from: '/develop/logs', to: '/developer/ops/changelog' },
  { from: '/develop/ccs_price_list', to: '/developer/ops/compute' },
  { from: '/develop/todo', to: '/developer/ops/todo' },
  { from: '/develop/team', to: '/developer/team' },
  { from: '/plugins/info', to: '/developer/process/plugin-lifecycle' },
  { from: '/plugins/list', to: '/features' },
  { from: '/plugins/emcshop', to: '/features/block-bank' },
  { from: '/plugins/fe_itemscore', to: '/features/block-bank' },
  { from: '/plugins/fe_quests', to: '/play/systems/economy' },
  { from: '/plugins/miragedgehome', to: '/features/anchor' },
  { from: '/plugins/miragedgetitle', to: '/features/title' },
  { from: '/plugins/SkyElytra', to: '/features/sky-elytra' },
  { from: '/plugins/fe_fly', to: '/developer/archive/plugins/fe-fly' },
  // PvP 已上线：旧 /plugins/pvp* 指向玩家区新页（而非插件文档）
  { from: '/plugins/fepvp', to: '/features/pvp' },
  { from: '/plugins/pvp', to: '/features/pvp' },
  { from: '/plugins/custom/items-core', to: '/developer/archive/plugins/items-core' },
  { from: '/plugins/custom/quests', to: '/developer/archive/plugins/quests' },
  // 注：/plugins/custom/sky-elytra 的旧跳转已移除——该功能现已上线，活页在 /features/sky-elytra，
  // 由 prefixRules 的 ['/plugins','/features'] 统一处理；保留旧规则会与它抢同一个 from 并把它错误地送往归档页
  { from: '/developer/archive/plugins/sky-elytra', to: '/features/sky-elytra' },
  { from: '/developer/reference/plugins', to: '/developer/reference/server-modules' },
  { from: '/features/pastoral/croups/info', to: '/developer/archive/design/farming' },
  { from: '/plugins/custom', to: '/features' },
  { from: '/play/adventure/miragedgehome', to: '/features/anchor' },
  { from: '/features/adventure/miragedgehome', to: '/features/anchor' },
  { from: '/play/adventure/identity', to: '/features/title' },
  { from: '/features/adventure/identity', to: '/features/title' },
  { from: '/play/adventure/deathreincarnation', to: '/features/death-return' },
  { from: '/features/adventure/deathreincarnation', to: '/features/death-return' },
  { from: '/play/systems/playerguild', to: '/play/systems/guild' },
  { from: '/features/base/playerguild', to: '/play/systems/guild' },
  { from: '/start/guild', to: '/play/systems/guild' },
  { from: '/play/systems/function', to: '/features/daily-tools' },
  { from: '/features/base/function', to: '/features/daily-tools' },
  { from: '/play/adventure/elytrabind', to: '/features/elytra-bind' },
  { from: '/features/adventure/elytrabind', to: '/features/elytra-bind' },
  { from: '/play/life/builder', to: '/features/building-tools' },
  { from: '/features/pastoral/builder', to: '/features/building-tools' },
  { from: '/play/adventure/equipment/forge', to: '/features/forge' },
  { from: '/features/adventure/mmo/forge', to: '/features/forge' },
  { from: '/play/adventure/levelledmobs', to: '/developer/archive/design/levelledmobs' },
  { from: '/features/adventure/levelledmobs', to: '/developer/archive/design/levelledmobs' },
  { from: '/play/adventure/equipment/info', to: '/developer/archive/design/equipment-upgrade' },
  { from: '/features/adventure/mmo/info', to: '/developer/archive/design/equipment-upgrade' },
  // 世界与结构重构（2026-08-03）
  { from: '/play/adventure/worlds/worldgen/overview', to: '/play/adventure/worlds/worldgen' },
  { from: '/play/adventure/worlds/fun-packs/overview', to: '/play/adventure/worlds/fun-packs' },
  { from: '/play/adventure/worlds/dungeons-and-taverns/structures', to: '/play/adventure/worlds/structures' },
  { from: '/play/adventure/worlds/structory/structures', to: '/play/adventure/worlds/structures' },
  { from: '/play/adventure/worlds/exploration/structures', to: '/play/adventure/worlds/structures' },
  { from: '/play/adventure/worlds/hoppo-ruins/structures', to: '/play/adventure/worlds/structures' },
  { from: '/play/adventure/worlds/rare-structures/overview', to: '/play/adventure/worlds/structures' },
  { from: '/play/adventure/worlds/incendium/advancements', to: '/play/adventure/worlds/incendium/guide' },
  { from: '/play/adventure/worlds/stellarity/advancements', to: '/play/adventure/worlds/stellarity/guide' },
  // ── 2026-10 全量重构：逐条补齐（由 scripts/refactor-verify-redirects.mjs 从 git HEAD 的旧路由清单比对得出）──
  // 社区提为一等分区
  { from: '/start/community', to: '/community' },
  { from: '/start/community/groups', to: '/community/groups' },
  { from: '/start/community/voice', to: '/community/voice' },
  { from: '/start/community/faq', to: '/community/faq' },
  { from: '/start/community/promotion', to: '/community/promotion' },
  { from: '/start/community/qqbot', to: '/community/qqbot' },
  // 归档里其实是现行规则的两页
  { from: '/archive/start/main-city', to: '/start/main-city' },
  { from: '/archive/start/new-server', to: '/start/new-server' },
  // 跨区归位
  { from: '/start/redstone', to: '/play/systems/redstone' },   // 目标页由阶段 2 拆页产出
  { from: '/plugins/fec-armor', to: '/features/body-size' },
  // 玩家内容迁出后删除的插件文档页
  { from: '/plugin-guides/fe-back/guide', to: '/features/death-return' },
  { from: '/plugin-guides/fepvp/guide', to: '/features/pvp' },
  // 阶段 3 拆页/改名
  { from: '/developer/workflows/enchanting/aiyatsbus-fluxon-functions', to: '/developer/workflows/enchanting/host-functions' },
  { from: '/developer/workflows/enchanting/reference', to: '/developer/workflows/enchanting/fluxon-pitfalls' },
  { from: '/developer/workflows/datapack/modules', to: '/developer/workflows/datapack/modules/functions' },
  { from: '/developer/workflows/geyser/index', to: '/developer/workflows/geyser' },
  { from: '/developer/workflows/geyser/conversion', to: '/developer/workflows/geyser/conversion/' },
  { from: '/developer/workflows/geyser/craftengine', to: '/developer/workflows/geyser/craftengine/' },
  { from: '/developer/workflows/fishing/reference', to: '/developer/workflows/fishing' },
  // 拆页：经济审查方法论（38KB → 5 页）
  { from: '/developer/reference/economy-audit-workflow', to: '/developer/reference/economy-audit' },
  // 未上线运营方案归位
  { from: '/developer/design/liveops_260107', to: '/developer/archive/design/liveops_260107' },
  // plugins/custom/ 打平后逐个改名
  { from: '/plugins/custom/miragedge-home', to: '/features/anchor' },
  { from: '/plugins/custom/death-return', to: '/features/death-return' },
  { from: '/plugins/custom/sky-elytra', to: '/features/sky-elytra' },
  { from: '/plugins/custom/slime-boots', to: '/features/slime-boots' },
  { from: '/plugins/custom/chest-shop', to: '/features/chest-shop' },
  { from: '/plugins/custom/global-market', to: '/features/global-market' },
  { from: '/plugins/custom/emc-shop', to: '/features/block-bank' },
  { from: '/plugins/custom/bounty-hunter', to: '/features/bounty-hunter' },
  { from: '/plugins/custom/mob-capture', to: '/features/mob-capture' },
  { from: '/plugins/custom/quiz', to: '/features/quiz' },
  { from: '/plugins/custom/miragedge-title', to: '/features/title' },
  { from: '/plugins/custom/monthly-pass', to: '/features/monthly-pass' },
  { from: '/plugins/custom/flight-guard', to: '/features/flight-guard' },
  { from: '/plugins/custom/nophantom', to: '/features/nophantom' },
  { from: '/plugins/custom/piglin-talisman', to: '/features/piglin-talisman' },
  // play/adventure 拆页（villager-trades 拆 14 页、items 拆 4 页、list 并入 index）
  { from: '/play/adventure/worlds/stellarity/villager-trades', to: '/play/adventure/worlds/stellarity/trades' },
  { from: '/play/adventure/worlds/stellarity/items', to: '/play/adventure/worlds/stellarity/equipment' },
  { from: '/play/adventure/enchantments/list', to: '/play/adventure/enchantments' },
  { from: '/play/adventure/enchantments/info', to: '/play/adventure/enchantments' },
  // play/life 重排
  { from: '/play/life/food/info', to: '/play/life/food' },
  { from: '/play/life/food/bakery', to: '/play/life/food/desserts-and-bakes' },
  { from: '/play/life/food/desserts', to: '/play/life/food/desserts-and-bakes' },
  { from: '/play/life/food/eggs', to: '/play/life/food/eggs-and-specialties' },
  { from: '/play/life/food/special', to: '/play/life/food/eggs-and-specialties' },
  { from: '/play/life/fishing/info', to: '/play/life/fishing' },
  { from: '/play/life/fishing/rods', to: '/play/life/fishing/guide' },
  { from: '/play/life/fishing/baits', to: '/play/life/fishing/guide' },
  { from: '/play/life/fishing/dimensions', to: '/play/life/fishing/guide' },
  { from: '/play/life/seasons/info', to: '/play/life/seasons' },
  { from: '/play/life/seasons/temperature', to: '/play/life/seasons/mechanisms' },
  { from: '/play/life/seasons/spring', to: '/play/life/seasons/spring-summer' },
  { from: '/play/life/seasons/summer', to: '/play/life/seasons/spring-summer' },
  { from: '/play/life/seasons/fall', to: '/play/life/seasons/autumn-winter' },
  { from: '/play/life/seasons/winter', to: '/play/life/seasons/autumn-winter' },
]

function normalizeRoute(route: string): string {
  const normalized = `/${route.replace(/^\/+|\/+$/g, '')}`
  return normalized === '/' ? '/' : normalized
}

function pageRoute(filePath: string, root: string): string | null {
  const relative = path.relative(root, filePath).replace(/\\/g, '/')
  if (!relative.endsWith('.md')) return null
  const route = `/${relative.slice(0, -3).replace(/\/index$/, '')}`
  return normalizeRoute(route)
}

function collectMarkdownRoutes(root: string): string[] {
  const routes: string[] = []

  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'public') continue
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        walk(absolute)
        continue
      }
      const route = pageRoute(absolute, root)
      if (route) routes.push(route)
    }
  }

  walk(root)
  return routes
}

function routeVariants(route: string): string[] {
  const clean = route.replace(/^\/+|\/+$/g, '')
  if (!clean) return ['index.html']
  return [`${clean}.html`, `${clean}/index.html`]
}

function mapPrefixRoute(route: string, fromPrefix: string, toPrefix: string): string | null {
  const normalized = normalizeRoute(route)
  const from = normalizeRoute(fromPrefix)
  const to = normalizeRoute(toPrefix)
  if (normalized !== to && !normalized.startsWith(`${to}/`)) return null
  return `${from}${normalized.slice(to.length)}`
}

function buildRedirectRules(root: string): RedirectRule[] {
  const routes = collectMarkdownRoutes(root)
  const liveRoutes = new Set(routes)
  // 这些源页在本阶段仍物理存在，但阶段 2 会被并入他页后删除；
  // 若此刻因「已是活路由」而拒绝生成存根，它们删除后会直接 404。故显式放行，
  // 让存根现在就位：源页存在期间由页面本身兑付，源页删除后由存根接手。
  const MERGE_SOURCES_PENDING_REMOVAL = new Set([
    '/play/life/food/desserts',
    '/play/life/food/special',
    '/play/life/seasons/summer',
    '/play/life/seasons/winter',
    '/play/life/fishing/baits',
    '/play/life/fishing/dimensions',
    '/start/redstone',              // 拆为玩家半页 /play/systems/redstone + 管理员半页
  ])
  const rules: RedirectRule[] = []
  // 以 from 去重（原实现用 from->to 去重，会让「同一 from 两条规则」静默共存，
  // 最终由 emitFile 写入顺序决定谁生效）。改为按 from 独占并显式告警。
  const byFrom = new Map<string, string>()
  const conflicts: string[] = []

  const add = (from: string, to: string) => {
    const key = normalizeRoute(from)
    if (key === normalizeRoute(to)) return          // 自指规则：不产生任何跳转，跳过
    // 通用守卫：from 已是当前真实页面路由时不得生成跳转存根，
    // 否则会在 build 产物里以同名文件覆盖该真实页面（页面不进 Rollup bundle，静默无警告）。
    if (liveRoutes.has(key) && !MERGE_SOURCES_PENDING_REMOVAL.has(key)) return
    const prev = byFrom.get(key)
    if (prev !== undefined) {
      if (prev !== to) conflicts.push(`${key}: "${prev}" 被后出现的 "${to}" 顶替`)
      return
    }
    byFrom.set(key, to)
    rules.push({ from: key, to })
  }

  for (const rule of exactRules) add(rule.from, rule.to)

  for (const route of routes) {
    for (const [from, to] of prefixRules) {
      const legacy = mapPrefixRoute(route, from, to)
      if (!legacy) continue
      add(legacy, route)
    }
  }

  if (conflicts.length) {
    console.warn(`[legacy-redirects] ${conflicts.length} 条同 from 冲突（已保留先出现者）：`)
    for (const c of conflicts) console.warn(`  - ${c}`)
  }

  return rules
}

function buildRedirectPage(destination: string, base: string): string {
  const target = `${base}${destination.replace(/^\/+/, '')}`
  const escapedTarget = target.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${escapedTarget}">
    <link rel="canonical" href="${escapedTarget}">
    <title>页面已迁移</title>
  </head>
  <body>
    <p>页面已迁移，正在前往<a href="${escapedTarget}">新地址</a>。</p>
    <script>location.replace(${JSON.stringify(target)})</script>
  </body>
</html>
`
}

export function legacyRedirectsPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | undefined

  return {
    name: 'miragedge-legacy-redirects',
    apply: 'build',
    configResolved(config) {
      resolvedConfig = config
    },
    generateBundle() {
      const root = resolvedConfig?.root || process.cwd()
      const base = resolvedConfig?.base || '/'
      for (const rule of buildRedirectRules(root)) {
        for (const fileName of routeVariants(rule.from)) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: buildRedirectPage(rule.to, base),
          })
        }
      }
    },
  }
}

export { buildRedirectRules, exactRules, prefixRules }
