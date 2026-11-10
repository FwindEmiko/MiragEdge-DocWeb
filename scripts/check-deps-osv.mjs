#!/usr/bin/env node
/**
 * 依赖漏洞门禁本地复刻（对照 CI 的 osv-scanner --recursive .）
 *
 * 为什么需要它：CI 用 google/osv-scanner-action 扫 pnpm-lock.yaml，一旦有未修复漏洞
 * 整个 job 失败，后续「构建/打包」与 deploy 全部跳过，站点停在旧版本。
 * 本地没有 Docker/Go 时，用官方 OSV API 逐包查询，能得到与 CI 一致的清单。
 *
 * 口径说明：
 *  - 只解析 pnpm-lock.yaml 的 packages + snapshots 段（pnpm v9 lockfile）
 *  - 逐个 POST https://api.osv.dev/v1/querybatch（官方批量接口）
 *  - 扣掉 osv-scanner.toml 里 [[IgnoredVulns]] 声明的 id
 *  - 与 CI 的差别：osv-scanner 还会做「不可修复漏洞」的额外提示，这里只判有/无
 *
 * 用法：
 *   node scripts/check-deps-osv.mjs          # 扫描，有漏洞则退出码 1
 *   node scripts/check-deps-osv.mjs --json   # 输出 JSON
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const LOCK = path.join(ROOT, 'pnpm-lock.yaml')
const CONFIG = path.join(ROOT, 'osv-scanner.toml')
const OSV_BATCH = 'https://api.osv.dev/v1/querybatch'
const BATCH_SIZE = 100
const JSON_OUT = process.argv.includes('--json')

/**
 * 解析 pnpm v9 lockfile 里所有 name -> Set(version)。
 * 形如：
 *   packages:
 *     '@scope/name@1.2.3':
 *     name@1.2.3:
 *   snapshots:
 *     '@scope/name@1.2.3(peer@1.0.0)':
 *
 * 注意：v9 里 scoped 包名带引号，正则必须兼容。
 * snapshot 键可能带 peer 后缀以及 (patch_hash=...)，需截断到第一个 '(' 并剥离哈希。
 */
function parse_lockfile(file) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  /** @type {Map<string, Set<string>>} */
  const found = new Map()

  let inSection = false
  for (const line of lines) {
    if (/^(packages|snapshots):\s*$/.test(line)) {
      inSection = true
      continue
    }
    if (/^\S/.test(line)) {
      // 顶层键（importers / settings / overrides ...）结束当前段
      inSection = false
      continue
    }
    if (!inSection) continue

    // 2 空格缩进的键：'@scope/name@1.2.3':
    const m = line.match(/^ {2}'?((?:@[^/'@]+[/])?[^'@]+)@([^'(]+)(?:\([^)]*\))*'?:/)
    if (!m) continue
    const name = m[1]
    const version = m[2].replace(/\(.*$/, '').trim()
    if (!name || !version) continue
    if (!found.has(name)) found.set(name, new Set())
    found.get(name).add(version)
  }
  return found
}

/** 读取 osv-scanner.toml 里所有被忽略的漏洞 id */
function parse_ignored(file) {
  if (!fs.existsSync(file)) return new Set()
  const text = fs.readFileSync(file, 'utf8')
  const ids = new Set()
  for (const m of text.matchAll(/^\s*id\s*=\s*"([^"]+)"/gm)) ids.add(m[1])
  return ids
}

async function query_batch(queries) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(OSV_BATCH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ queries }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      return await res.json()
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 800 * attempt))
    }
  }
}

function severity_of(vuln) {
  const sev = vuln.database_specific?.severity
  if (sev) return sev
  const cvss = vuln.severity?.find((s) => s.type === 'CVSS_V3' || s.type === 'CVSS_V4')
  return cvss?.score ?? ''
}

async function main() {
  if (!fs.existsSync(LOCK)) {
    console.error(`找不到 lockfile: ${LOCK}`)
    process.exit(2)
  }

  const pkgs = parse_lockfile(LOCK)
  const ignored = parse_ignored(CONFIG)

  // 展开成 (name, version) 列表
  const entries = []
  for (const [name, versions] of pkgs) {
    for (const version of versions) entries.push({ name, version })
  }

  if (!JSON_OUT) {
    console.log(`解析 ${path.relative(ROOT, LOCK)}：${entries.length} 个 (包, 版本) 组合`)
    if (ignored.size) console.log(`osv-scanner.toml 忽略 ${ignored.size} 条：${[...ignored].join(', ')}`)
    console.log('查询 OSV API ...\n')
  }

  const findings = []
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const chunk = entries.slice(i, i + BATCH_SIZE)
    const queries = chunk.map((e) => ({
      package: { name: e.name, ecosystem: 'npm' },
      version: e.version,
    }))
    const data = await query_batch(queries)
    const results = data.results ?? []
    results.forEach((r, idx) => {
      for (const vuln of r.vulns ?? []) {
        findings.push({
          package: chunk[idx].name,
          version: chunk[idx].version,
          id: vuln.id,
          aliases: vuln.aliases ?? [],
          summary: vuln.summary ?? '',
          severity: severity_of(vuln),
          ignored: ignored.has(vuln.id),
          fixed: (vuln.affected ?? [])
            .filter((a) => a.package?.name === chunk[idx].name)
            .flatMap((a) => (a.ranges ?? []).flatMap((rg) => (rg.events ?? []).map((ev) => ev.fixed).filter(Boolean)))
            .filter((v, i2, arr) => arr.indexOf(v) === i2),
        })
      }
    })
  }

  const active = findings.filter((f) => !f.ignored)

  if (JSON_OUT) {
    console.log(JSON.stringify({ total: findings.length, active, ignored: findings.filter((f) => f.ignored) }, null, 2))
    process.exit(active.length ? 1 : 0)
  }

  console.log(`总命中 ${findings.length} 条，其中被忽略 ${findings.length - active.length} 条，**未忽略 ${active.length} 条**\n`)

  if (active.length) {
    const byPackage = new Map()
    for (const f of active) {
      const key = `${f.package}@${f.version}`
      if (!byPackage.has(key)) byPackage.set(key, [])
      byPackage.get(key).push(f)
    }

    console.log('| 包 | 版本 | 修复版本 | 漏洞数 | 漏洞 id |')
    console.log('| --- | --- | --- | --- | --- |')
    for (const [key, list] of [...byPackage.entries()].sort()) {
      const [name, version] = key.split(/@(?=[^@]*$)/)
      const fixed = [...new Set(list.flatMap((f) => f.fixed))].join(', ') || '—'
      const ids = [...new Set(list.map((f) => f.id))].join('<br>')
      console.log(`| ${name} | ${version} | ${fixed} | ${list.length} | ${ids} |`)
    }
    console.log('')
    console.log('❌ 存在未忽略的依赖漏洞，CI 门禁会失败')
    process.exit(1)
  }

  console.log('✅ 无未忽略的依赖漏洞')
  process.exit(0)
}

main().catch((err) => {
  console.error('扫描失败：', err)
  process.exit(2)
})
