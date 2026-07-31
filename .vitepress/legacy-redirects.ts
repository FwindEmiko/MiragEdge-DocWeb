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
  ['/plugins/fepvp', '/plugin-guides/fepvp'],
  ['/plugins/pvp', '/plugin-guides/fepvp'],
  ['/developer/archive/plugins/pvp', '/plugin-guides/fepvp'],
  ['/plugins/bugenchantremover', '/plugin-guides/bug-enchant-remover'],
  ['/plugins/bug-enchant-remover', '/plugin-guides/bug-enchant-remover'],
  ['/developer/reference/plugins/bug-enchant-remover', '/plugin-guides/bug-enchant-remover'],
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
  { from: '/start/qq_group', to: '/start/community/groups' },
  { from: '/start/faq', to: '/start/community/faq' },
  { from: '/manual/promotion', to: '/developer/archive/promotion' },
  { from: '/develop/logs_old', to: '/developer/archive/changelog-old' },
  { from: '/develop/logs', to: '/developer/ops/changelog' },
  { from: '/develop/ccs_price_list', to: '/developer/ops/compute' },
  { from: '/develop/serverstatus', to: '/developer/ops/server-status' },
  { from: '/develop/todo', to: '/developer/ops/todo' },
  { from: '/develop/team', to: '/developer/team' },
  { from: '/plugins/info', to: '/developer/process/plugin-lifecycle' },
  { from: '/plugins/list', to: '/plugins' },
  { from: '/plugins/emcshop', to: '/plugins/custom/emc-shop' },
  { from: '/plugins/fe_itemscore', to: '/plugins/custom/items-core' },
  { from: '/plugins/miragedgehome', to: '/plugins/custom/miragedge-home' },
  { from: '/plugins/miragedgetitle', to: '/plugins/custom/miragedge-title' },
  { from: '/plugins/fe_quests', to: '/plugins/custom/quests' },
  { from: '/plugins/SkyElytra', to: '/plugins/custom/sky-elytra' },
  { from: '/plugins/fe_fly', to: '/developer/archive/plugins/fe-fly' },
  { from: '/plugins/fepvp', to: '/plugin-guides/fepvp' },
  { from: '/plugins/pvp', to: '/plugin-guides/fepvp' },
  { from: '/plugins/custom/items-core', to: '/developer/archive/plugins/items-core' },
  { from: '/plugins/custom/quests', to: '/developer/archive/plugins/quests' },
  { from: '/plugins/custom/sky-elytra', to: '/developer/archive/plugins/sky-elytra' },
  { from: '/developer/reference/plugins', to: '/developer/reference/server-modules' },
  { from: '/features/pastoral/croups/info', to: '/developer/archive/design/farming' },
  { from: '/plugins/custom', to: '/plugins' },
  { from: '/play/adventure/miragedgehome', to: '/plugins/custom/miragedge-home' },
  { from: '/features/adventure/miragedgehome', to: '/plugins/custom/miragedge-home' },
  { from: '/play/adventure/identity', to: '/plugins/custom/miragedge-title' },
  { from: '/features/adventure/identity', to: '/plugins/custom/miragedge-title' },
  { from: '/play/adventure/deathreincarnation', to: '/plugins/custom/death-return' },
  { from: '/features/adventure/deathreincarnation', to: '/plugins/custom/death-return' },
  { from: '/play/systems/playerguild', to: '/start/guild' },
  { from: '/features/base/playerguild', to: '/start/guild' },
  { from: '/play/systems/redstone', to: '/start/redstone' },
  { from: '/play/systems/function', to: '/plugins/daily-tools' },
  { from: '/features/base/function', to: '/plugins/daily-tools' },
  { from: '/play/adventure/elytrabind', to: '/plugins/elytra-bind' },
  { from: '/features/adventure/elytrabind', to: '/plugins/elytra-bind' },
  { from: '/play/life/builder', to: '/plugins/building-tools' },
  { from: '/features/pastoral/builder', to: '/plugins/building-tools' },
  { from: '/play/adventure/equipment/forge', to: '/plugins/forge' },
  { from: '/features/adventure/mmo/forge', to: '/plugins/forge' },
  { from: '/play/adventure/levelledmobs', to: '/developer/archive/design/levelledmobs' },
  { from: '/features/adventure/levelledmobs', to: '/developer/archive/design/levelledmobs' },
  { from: '/play/adventure/equipment/info', to: '/developer/archive/design/equipment-upgrade' },
  { from: '/features/adventure/mmo/info', to: '/developer/archive/design/equipment-upgrade' },
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
  const rules = [...exactRules]
  const seen = new Set(rules.map((rule) => `${rule.from}->${rule.to}`))

  for (const route of collectMarkdownRoutes(root)) {
    for (const [from, to] of prefixRules) {
      const legacy = mapPrefixRoute(route, from, to)
      if (!legacy) continue
      const key = `${legacy}->${route}`
      if (seen.has(key)) continue
      seen.add(key)
      rules.push({ from: legacy, to: route })
    }
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
