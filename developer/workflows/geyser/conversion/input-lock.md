---
title: 输入锁定
description: Geyser 转换的输入核对步骤。涵盖未保护包的只读预检脚本、受管 Bridge 的 init 与 audit 与 ingest 与 validate 与 apply 命令链、输入包结构审计清单，以及内容清单与覆盖目标写法。
outline: [2, 3]
---

# 输入锁定

这页保证进入采集前输入唯一且可追溯。输入不确定就不要开始转换。

## 只读核对未保护包

选择 `resource_pack_unprotected.zip` 的依据见[转换与发布](./)。下面脚本只读，不修改任何文件。

```powershell
$ce = 'F:\FCelestial\CraftEngine'
$unprotected = Join-Path $ce 'generated\resource_pack_unprotected.zip'
$protected = Join-Path $ce 'generated\resource_pack.zip'
$mapOnly = Join-Path $ce 'generated\resource_pack_map.zip'

if (-not (Test-Path -LiteralPath $unprotected)) { throw "BLOCKED: missing CE unprotected pack: $unprotected" }
if (-not (Test-Path -LiteralPath $protected)) { throw "BLOCKED: missing CE protected pack: $protected" }
if (Test-Path -LiteralPath $mapOnly) { "INFO: ignoring map-plugin output: $mapOnly" }
Get-Item $unprotected, $protected | Select-Object FullName, Length, LastWriteTime
Get-FileHash $unprotected, $protected -Algorithm SHA256 | Format-Table Path, Hash
```

::: danger 三种情况必须停止转换
未保护副本不存在或时间比主包明显旧时，停止转换并重新生成 CE 资源包。

SHA 在发布记录中无法解释时，同样停止转换。不要用旧副本补齐，也不要临时关闭保护后忘记恢复。
:::

配置声明目标产物不等于文件存在。2026-07-31 的现场快照已包含未保护副本。它比主包早 241 秒，落在受管 Bridge 的 900 秒同批次窗口内。这只说明可以进入资源结构审计，不表示 CE 外部合并输入已经完整。后者仍由 `bridge.py audit` 的逐项存在性和 SHA 检查决定。

## 受管 Bridge

本机实现位于 `F:\FCelestial\Geyser-Velocity\bridge\bridge.py`。它不替代 Rainbow，而是把两件事变成一个增量发布链：当前可工作的 Geyser 旧资产，以及每次新的 Rainbow 输出。这条链可校验、可回滚。

首次只执行一次：

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
python .\bridge.py init
python .\bridge.py audit --release 2026-07-31-r01
python .\bridge.py stage --release 2026-07-31-r01
python .\bridge.py validate --release 2026-07-31-r01
```

各命令职责：

| 命令 | 作用 |
| --- | --- |
| `init` | 把本项目拥有的 `miragedge_*.json`、`miragedge_*.zip`、现有头颅和 locale override 复制到 `bridge/state/baseline/`，不碰 Geyser 正在加载的文件 |
| `audit` | 读取 `resource_pack_unprotected.zip`，忽略 `resource_pack_map.zip`，逐项检查 CE 配置声明的外部目录和 ZIP |
| `stage` | 建立待审发布目录 |
| `validate` | 校验 staged 映射、资源包与语言文件 |
| `ingest` | 把 Rainbow 输出合并到一个 staging release |
| `apply` | 替换 Geyser 活动目录中的本项目文件 |

首个 `audit` 产生全量收集清单是正常现象。只有 `audit` 通过后才执行一次 `--adopt`，把当前 Java 文件 SHA 固化为可信增量基线：

```powershell
python .\bridge.py audit --release <可信首发编号> --adopt
```

::: warning 不要用 --force-adopt 绕过缺失输入
`--force-adopt` 只能建立变化观测基线，不能让后续 `validate` 或 `apply` 绕过 CE 输入不完整的问题。
:::

后续新增或修改内容的固定操作：

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
python .\bridge.py audit --release <新编号>
# 在 Java 测试客户端加载本次 CE 最终包，再把新的 Rainbow 输出放到 .\incoming\<新编号>\
python .\bridge.py ingest --release <新编号>
python .\bridge.py validate --release <新编号>
python .\bridge.py apply --release <新编号> --yes
```

报告文件的含义：

| 报告 | 内容 |
| --- | --- |
| `reports/audit.json` | Java ZIP、CE merge 输入、SHA、目录统计和差异 |
| `reports/rainbow-collection.json` | 变更的 Java 资产、需要采集的模型和复杂内容路线 |
| `reports/java-languages.json` | 各 locale 的来源数量、翻译键数量和跨来源同键异值，供人工核对 |

`java-languages.json` 不是可直接投放的基岩版 locale。

`ingest` 会把 Rainbow 的 v2 mappings、基岩版 ZIP 与 MCPACK、`locales/overrides/*.json`、`custom-skulls.yml` 合并到一个 staging release。同一 Java selector、同一 Bedrock registry key 或同一路径资产内容不同时会被阻断。

只有确实要替换旧模型时，人工确认差异后才加 `--replace-matching`。不要依赖多个历史包的加载顺序。

`apply` 是唯一会修改 Geyser 活动 `packs/`、`custom_mappings/`、locale override 和 `custom-skulls.yml` 的命令。它先在 `bridge/backups/<时间>-<release>/` 复制精确旧文件，再用 `custom_mappings/managed/miragedge-managed.json` 和一个 `miragedge-bridge-<release>.mcpack` 替换本项目的旧 `miragedge_*` 文件。

`GeyserRecipeFix`、`incendium-pack.mcpack`、`menu.mcpack`、`nullback.mcpack` 等其他所有者文件不在操作范围内。

## 输入包结构审计

展开到只读工作目录，确认它是 Java 资源包，而不是外层又套了一层根目录的归档。

```text
input/java-final/
├── pack.mcmeta
├── assets/
│   ├── minecraft/
│   └── <custom namespaces>/
└── <可能存在的 overlays>/
```

最低检查项：

- 根目录是否直接有 `pack.mcmeta` 与 `assets/`。
- `assets/*/items/`、`assets/*/models/`、`assets/*/textures/`、`assets/*/sounds.json`、`assets/*/lang/` 是否存在。
- 是否含 `optifine/`、`cem/`、`emf/`、`iris/`、shader、`entity/`、`font/` 等高风险目录。
- 是否含大量 `overlays/`，并确认 Java 测试客户端实际启用哪一层。
- 输出内容是否包含外部合并包的预期标识，而不是只包含 CE 自建物品。

::: danger 不要用「ZIP 能解压」当作通过条件
资源包缺少纹理、父模型、语言、音频、条件模型或覆盖层时，两端会看到不同结果。
:::

## 内容清单与覆盖目标

Rainbow 只能映射它见到的真实对象。它无法凭空知道某个数据包任务奖励、隐藏战利品或管理员物品。先列出目标集合，再采集。

```yaml
items:
  - key: miragedge_items:star_rod
    owner: craftengine
    java_base_item: minecraft:fishing_rod
    expected_model: "采集后填写实际 item_model"
    expected_cmd: "采集后填写实际 CMD；若无则 null"
    scenes: [inventory, hand, dropped, fishing_rod_cast]
    route: rainbow-item
    status: planned

  - key: datapack:boss_reward
    owner: datapack-resource-pack
    source: "对应数据包的掉落、任务或函数入口"
    scenes: [inventory, chest, loot]
    route: rainbow-item
    status: planned

blocks:
  - key: customcrops:chinese_cabbage_stage_3
    owner: craftengine
    scenes: [placed, break, growth, chunk_reload]
    route: investigate-before-mapping
    status: planned

entities:
  - key: datapack:boss_alpha
    owner: datapack-resource-pack
    scenes: [spawn, idle, attack, death]
    route: manual-entity-or-extension
    status: blocked-by-design
```

每个 `planned` 条目都必须获得一个终态：

```text
mapped / manual / unsupported / intentionally-java-only / blocked
```

未进入清单的内容不计入覆盖率。

## 物品身份的采集规则

Geyser v2 按「基础 Java 物品加 `minecraft:item_model`」匹配。legacy 路线按「基础 Java 物品加 `custom_model_data`」匹配。名称、Lore、PDC、CE ID 和 Java 纹理路径都不能替代这两个匹配键。

因此必须从真实物品栈记录以下字段：

| 字段 | 为什么必须记录 |
| --- | --- |
| Java 基础物品 | 例如 `minecraft:fishing_rod`，它决定 Geyser 映射的顶层键及默认行为 |
| `minecraft:item_model` | 现代 v2 映射的首选匹配键，常与贴图文件路径不同 |
| `custom_model_data` | 当前 CE 同时下发 CMD，可用于 legacy 回退和诊断 |
| 动态组件 | 食物、装备、耐久、冷却、工具等会影响基岩版的预定义行为 |
| Java 可见场景 | 决定必须采集和测试哪些状态 |
| Bedrock identifier 与 icon | 必须与基岩版包内资源一致 |

::: warning 同一个 Bedrock 定义可被多个 Java 基础物品复用
一旦 `components`、`bedrock_options` 或图标语义不同，就必须使用新的 identifier。
:::

## 下一步

输入锁定完成后，进入 [Rainbow 采集与映射审查](./rainbow)。
