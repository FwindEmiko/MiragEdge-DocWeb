---
title: "Geyser 工作流 · 转换与发布"
description: "使用 Rainbow 将 CE 最终合并 Java 资源包转换为 Geyser 映射和 Bedrock 资源包，并以可回滚的发布物部署。"
outline: deep
---

# 转换与发布

本页处理“从最终 Java 视觉输入到 Geyser 发布物”的主路径。它不处理 CE YAML 的设计细节，也不承诺复杂实体可自动转换；这两部分分别见 [CE 合并资源包适配](./craftengine) 和 [复杂数据包实体与展示](./entities)。

## 0. 先冻结版本

转换结果和以下版本强绑定：Java 服务端、Geyser build、Bedrock 协议、Java 测试客户端、Fabric/Fabric API、Rainbow build、CE 生成的 Java 包。任何一项改变，都应视为新的转换候选版本。

在 `release.json` 补齐版本字段；Bridge 的 `reports/audit.json` 会自动记录 Java ZIP、CE merge 输入、SHA、目录统计和差异。采集前至少确认下列字段：

```yaml
schema: 1
release: 2026-07-31-r01
generated_at: "2026-07-31T00:00:00+08:00"
java_server: "填写实际服务端与构建号"
java_test_client: "填写实际客户端版本"
bedrock_target: "填写测试客户端版本"
geyser: "填写 Geyser build"
rainbow: "填写 Rainbow build"
craftengine:
  config: "F:/FCelestial/CraftEngine/config.yml"
  source_pack: "F:/FCelestial/CraftEngine/generated/resource_pack_unprotected.zip"
  source_sha256: "生成后填写"
  protected_pack_sha256: "生成后填写"
inputs:
  - kind: ce-final-merge
    path: "F:/FCelestial/CraftEngine/generated/resource_pack_unprotected.zip"
    required: true
```

Rainbow 的 README 和官网指南在版本文字上可能短暂不同步。不要从旧教程复制“必须使用某个固定 Minecraft 版本”；应以当前 Rainbow 发布页、mod 元数据、游戏启动日志和服务器目标版本共同确认可用组合。

## 1. 选择唯一的 Java 输入包

### 当前 MiragEdge 的正确输入

CE 当前配置会输出：

```text
F:\FCelestial\CraftEngine\generated\resource_pack.zip
F:\FCelestial\CraftEngine\generated\resource_pack_map.zip       # map-plugin/BlueMap 专用，排除
F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip
```

这是配置声明的目标产物，不是文件存在性的保证。2026-07-31 的现场快照已包含未保护副本；它比主包早 241 秒，处于受管 Bridge 的 900 秒同批次时间窗口内。这个结果只说明可以进入资源结构审计，不表示 CE 外部合并输入已经完整；后者仍由 `bridge.py audit` 的逐项存在性和 SHA 检查决定。不要因为路径已写在配置里就退回使用受保护主包。

转换时优先选择同一 CE 生成批次的 `resource_pack_unprotected.zip`，理由如下：

- 它已经包含 CE 配置资源、`merge-external-folders` 与 `merge-external-zip-files` 的最终覆盖结果。
- 配置明确说明它使用标准 Java ZIP，适合 Bedrock 资源包转换器。
- 主 `resource_pack.zip` 启用了保护和混淆；它可能拥有混淆覆盖目录、命名空间/路径和大图集，增加转换器解析失败或报告失真的概率。
- 不能把“从某个外部 ZIP 提取到的模型”与“最终合并包里的模型”混为同一个输入。CE 冲突处理、`merge_json`、`merge_legacy_model`、图集和字体合并都可能已改变最终内容。

在开始前执行只读核对：

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

若未保护副本不存在、时间比主包明显旧，或其 SHA 在发布记录中无法解释，停止转换并先重新生成 CE 资源包。不要拿旧副本补齐，也不要临时关闭保护后忘记恢复原有策略。

### MiragEdge 受管 Bridge

本机实现位于 `F:\FCelestial\Geyser-Velocity\bridge\bridge.py`。它不替代 Rainbow，而是把“当前可工作的 Geyser 旧资产”和“每次新的 Rainbow 输出”变成一个可校验、可回滚的增量发布链。

首次仅执行一次：

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
python .\bridge.py init
python .\bridge.py audit --release 2026-07-31-r01
python .\bridge.py stage --release 2026-07-31-r01
python .\bridge.py validate --release 2026-07-31-r01
```

`init` 只复制当前由 MiragEdge 拥有的 `miragedge_*.json`、`miragedge_*.zip`、现有头颅和 locale override 到 `bridge/state/baseline/`，不会碰 Geyser 正在加载的文件。`audit` 必须读取 `resource_pack_unprotected.zip`，明确忽略 `resource_pack_map.zip`，并逐项检查 CE 配置声明的外部目录和 ZIP。首个 audit 产生全量收集清单是正常现象；只有 audit 通过后才执行一次 `--adopt`，把当前 Java 文件 SHA 固化为可信增量基线：

```powershell
python .\bridge.py audit --release <可信首发编号> --adopt
```

不要用 `--force-adopt` 把缺失 merge 输入的快照当成可部署版本。它只能建立“变化观测基线”，不能让后续 `validate` 或 `apply` 绕过 CE 输入不完整的问题。

后续新增或修改内容的固定操作是：

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
python .\bridge.py audit --release <新编号>
# 在 Java 测试客户端加载本次 CE 最终包，再把新的 Rainbow 输出放到 .\incoming\<新编号>\
python .\bridge.py ingest --release <新编号>
python .\bridge.py validate --release <新编号>
python .\bridge.py apply --release <新编号> --yes
```

`audit` 的 `reports/rainbow-collection.json` 只列出变更的 Java 资产、需要采集的模型和复杂内容路线；`reports/java-languages.json` 列出最终 Java 包各 locale 的来源数量、翻译键数量和跨来源同键异值，供人工/Rainbow 语言采集核对。它不是可直接投放的 Bedrock locale。`ingest` 会把 Rainbow 的 v2 mappings、Bedrock ZIP/MCPACK、`locales/overrides/*.json`、`custom-skulls.yml` 合并到一个 staging release；同一 Java selector、同一 Bedrock registry key 或同一路径资产内容不同会阻断。确实要替换旧模型时，人工确认差异后才加 `--replace-matching`，绝不能依赖多个历史包的加载顺序。

`apply` 是唯一会修改 Geyser 活动 `packs/`、`custom_mappings/`、locale override 和 `custom-skulls.yml` 的命令。它先在 `bridge/backups/<时间>-<release>/` 复制精确旧文件，再用 `custom_mappings/managed/miragedge-managed.json` 和一个 `miragedge-bridge-<release>.mcpack` 替换本项目的旧 `miragedge_*` 文件；`GeyserRecipeFix`、`incendium-pack.mcpack`、`menu.mcpack`、`nullback.mcpack` 等其他所有者文件不在操作范围内。

### 输入包结构审计

先展开到只读工作目录，确认它是一个 Java 资源包而不是“ZIP 外又套一层根目录”的归档：

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
- 输出内容是否确实包含外部合并包的预期标识，而不是只包含 CE 自建物品。

不要把这个结构检查写成“只要 ZIP 可解压就通过”。资源包中缺少纹理、父模型、语言、音频、条件模型或覆盖层，都可能使 Java 端和 Rainbow 看到不同结果。

## 2. 建立内容清单与覆盖目标

Rainbow 只能映射它见到的真实对象，无法凭空知道某个数据包任务奖励、隐藏战利品或管理员物品。先列出目标集合，再采集。

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
    source: "对应数据包的掉落/任务/函数入口"
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

每一个 `planned` 条目都必须获得一个终态：`mapped`、`manual`、`unsupported`、`intentionally-java-only` 或 `blocked`。未进入清单的内容不计入覆盖率。

### 物品身份的采集规则

Geyser v2 会按“基础 Java 物品 + `minecraft:item_model`”匹配；legacy 路线按“基础 Java 物品 + `custom_model_data`”匹配。名称、Lore、PDC、CE ID 和 Java 纹理路径都不能替代这两个匹配键。

因此对每个物品必须从真实物品栈记录：

| 字段 | 为什么必须记录 |
| --- | --- |
| Java 基础物品 | 例如 `minecraft:fishing_rod`；它决定 Geyser 映射的顶层键及默认行为。 |
| `minecraft:item_model` | 现代 v2 映射的首选匹配键。它常与贴图文件路径不同。 |
| `custom_model_data` | 当前 CE 同时下发 CMD；可用于 legacy 回退和诊断。 |
| 动态组件 | 食物、装备、耐久、冷却、工具等会影响 Bedrock 的预定义行为。 |
| Java 可见场景 | 决定必须采集和测试哪些状态。 |
| Bedrock identifier/icon | 必须与 Bedrock pack 内资源一致。同一 Bedrock 定义可被多个不同 Java 基础物品显式复用；一旦 `components`、`bedrock_options` 或图标语义不同，就必须使用新 identifier。 |

## 3. 准备 Java 采集客户端

Rainbow 是客户端 Fabric mod，不运行在 Paper/CE/Geyser 服务器上。准备一个隔离的 Java 测试 profile：

```text
Java 测试客户端
├── 与服务端兼容的 Minecraft 版本
├── Fabric Loader
├── Fabric API
├── 当前 Rainbow
├── 不会改变服务端数据的管理员测试账号
└── 已接受并实际加载 CE 最终 Java 资源包
```

开始映射前在 Java 客户端人工确认：

1. 资源包已成功下载并应用，未出现缺失纹理。
2. CE 代表物品、数据包物品、外部模型/声音和方块在 Java 端呈现为预期状态。
3. 需要采集的管理员菜单、展示箱、配方、战利品入口都可访问。
4. 当前 Java 客户端不是只加载了缓存中的旧包。建议在启动器资料夹中记录所加载包的 SHA-256。

Java 显示错误时，不要先跑 Rainbow。它会把错误输入稳定地转成错误输出，让后续排错更困难。

## 4. Rainbow 采集闭环

### 初始化

每个发布批次使用一个新的 Rainbow 输出目录；`/rainbow create` 的目标目录可能被覆盖。

```text
/rainbow create miragedge-2026-07-31-r01
```

输出通常位于 Java 客户端的：

```text
.minecraft/rainbow/miragedge-2026-07-31-r01/
├── custom_mappings/
├── pack.zip
├── lang/
├── custom-skulls.yml
└── report.txt
```

在执行任何映射前，把 release ID、Java 包 SHA、客户端版本写进外部发布记录。不要把 Rainbow 的临时目录直接当部署目录。

### 方块与声音

```text
/rainbow auto blocks
/rainbow auto sounds
```

`/rainbow auto blocks` 会遍历已加载包中的方块状态覆盖，可能短暂冻结客户端。它覆盖的是支持的资源包模式，不等于 CE 的所有服务器端真实方块都已映射。自动扫描后，逐个在世界中放置清单里的重点方块；漏项使用：

```text
/rainbow map block <目标坐标>
```

声音可按全包自动扫描，也可在需要隔离来源时使用：

```text
/rainbow map sound <namespace>
```

### 物品、头颅与容器

先把代表物品放到测试背包：

```text
/rainbow mapinventory
```

再启动长时间采集：

```text
/rainbow auto inventory
```

此时依次打开：CE 管理菜单、物品图鉴、专门准备的收集箱、任务奖励预览、数据包商店、战利品测试容器。每打开一个来源都在清单里标记“已扫”。采集结束后：

```text
/rainbow auto stop
```

对 Rainbow 未自动识别的物品，特别是覆盖原版 item model 定义的物品，手持后逐个执行：

```text
/rainbow map item
```

这一步不能省略。Rainbow 官方明确提示：`mapinventory`、`auto inventory` 和 `auto recipes` 都可能漏掉“覆盖原版 item model definition”的物品。

### 配方输出与隐藏物品

对由数据包配方、CE 配方或进度奖励产生的物品，先让测试账号获得可见配方，再执行：

```text
/recipe give @s *
/rainbow auto recipes
```

它只能采集已知配方的结果。不能被配方、菜单、收集箱或 `/ce item get` 获得的物品，必须由管理员用其实际生成路径拿到后手动 `map item`。对数据包掉落物，优先使用测试战利品表、专用 function 或受控刷怪环境，而不是在生产世界盲测。

### 完成导出

```text
/rainbow finish
```

完成后立即复制整个 Rainbow 输出目录到发布工作区，而不是只复制 `pack.zip`。`report.txt` 和导出的 mappings 是质量证据；单独留下 ZIP 无法解释漏项。

## 5. 审计 Rainbow 输出

### `report.txt` 是阻塞器

逐条处理或归档以下类型的信息：

- 未解析模型、纹理、父模型、动画或材质。
- 不支持的 Java item model 定义、predicate、CEM/OptiFine/EMF 内容。
- 被跳过的方块、物品、声音、头颅或重复 Bedrock identifier。
- 为 3D 模型降级出的 GUI 图标、attachable 或动画警告。
- 资源路径的大小写、父模型、覆盖层和多纹理问题。

报告中没有 `error` 不等于覆盖完成。必须把 `custom_mappings`、`.mcpack` 和 `coverage.json` 交叉比较，确认每个计划条目都有可解释状态。

### 静态检查模板

以下 PowerShell 片段只检查发布物，不会修改 Geyser：

```powershell
$release = 'F:\FCelestial\Geyser-Velocity\bridge\releases\2026-07-31-r01'
$mappings = Join-Path $release 'custom_mappings'
$pack = Join-Path $release 'packs\miragedge-bridge-2026-07-31-r01.mcpack'

Get-ChildItem $mappings -Filter *.json | ForEach-Object {
  try {
    Get-Content $_.FullName -Raw -Encoding utf8 | ConvertFrom-Json | Out-Null
    "OK JSON  $($_.Name)"
  } catch {
    "BAD JSON $($_.Name): $($_.Exception.Message)"
  }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($pack)
try {
  $names = $archive.Entries.FullName
  foreach ($required in 'manifest.json') {
    if ($names -notcontains $required) { "MISSING $required" } else { "OK $required" }
  }
  $hasItemMapping = Get-ChildItem $mappings -Filter *.json | Select-String -Pattern '"items"\s*:'
  if ($null -ne $hasItemMapping) {
    if ($names -notcontains 'textures/item_texture.json') { 'MISSING textures/item_texture.json (item mappings exist)' }
    else { 'OK textures/item_texture.json' }
  } else {
    'SKIP textures/item_texture.json (no item mappings in this release)'
  }
} finally {
  $archive.Dispose()
}

Get-FileHash $pack -Algorithm SHA256
```

这个检查不会证明 Bedrock 能加载或渲染；它只阻止破损 JSON、空 ZIP 和缺少最小资源包骨架的发布物进入服务器。

## 6. 理解并审查映射

### v2 `item_model` 示例

以下是说明结构的最小样例，不可直接复制到 MiragEdge。`minecraft:fishing_rod` 和 `miragedge_items:star_rod` 必须替换为从真实物品栈/Rainbow 输出得到的值。

```json
{
  "format_version": 2,
  "items": {
    "minecraft:fishing_rod": [
      {
        "type": "definition",
        "model": "miragedge_items:star_rod",
        "bedrock_identifier": "miragedge:star_rod",
        "display_name": "星辉钓鱼竿",
        "bedrock_options": {
          "icon": "miragedge.star_rod",
          "display_handheld": true,
          "tags": ["miragedge:rod"]
        }
      }
    ]
  }
}
```

约束：

- `bedrock_identifier` 不得映射到两个不同的 Bedrock-facing 定义，且不能使用 `minecraft` 命名空间。相同图标/组件的菜单占位符可以跨不同 Java 基础物品复用同一个 identifier；这必须在 release 中显式记录，不能靠加载顺序碰巧生效。
- `icon` 是 `textures/item_texture.json` 的 shorthand，不是 PNG 文件名；推荐显式填写，避免 `:` 转 `.`、`/` 转 `_` 的默认转换歧义。
- 武器、工具、钓竿等通常需要 `display_handheld: true`；不要让普通 2D 消耗品继承这个选项。
- 基岩物品行为由预注册的静态 components 决定。不要把会因单个物品实例变化的 Java components 直接写成唯一映射。

### legacy CMD 示例

当实际物品仍靠 legacy CMD 匹配时，Geyser v2 文件仍使用 `format_version: 2`，定义类型为 `legacy`：

```json
{
  "format_version": 2,
  "items": {
    "minecraft:fishing_rod": [
      {
        "type": "legacy",
        "custom_model_data": 203,
        "bedrock_identifier": "miragedge:star_rod_legacy",
        "bedrock_options": {
          "icon": "miragedge.star_rod",
          "display_handheld": true
        }
      }
    ]
  }
}
```

当前 CE 同时下发现代模型与 CMD，是兼容资产而不是要求同一物品重复注册两个无条件映射。以 Rainbow 输出和实际目标 Geyser 版本的选择结果为准，避免让两条定义竞争同一条目。

### 状态型物品

对于同一 Java 物品模型在“默认/损坏/抛竿/数量/维度”下需要不同 Bedrock 外观或预定义行为的场景，使用 `group` 与支持的 predicates。例子：

```json
{
  "type": "group",
  "model": "miragedge_items:star_rod",
  "definitions": [
    {
      "bedrock_identifier": "miragedge:star_rod_cast",
      "predicate": {
        "type": "condition",
        "property": "fishing_rod_cast"
      },
      "bedrock_options": {
        "icon": "miragedge.star_rod_cast",
        "display_handheld": true
      }
    },
    {
      "bedrock_identifier": "miragedge:star_rod",
      "bedrock_options": {
        "icon": "miragedge.star_rod",
        "display_handheld": true
      }
    }
  ]
}
```

Geyser 会排序常见 predicate，但复杂的多范围条件组合仍可能需要 `priority`。不要用名称或 Lore 伪造 predicate；它们不在 Geyser 官方支持的常规映射条件里。

## 7. Bedrock 资源包应包含什么

Rainbow 生成的 `pack.zip` 应被当作一个基岩资源包，而不是 Java 资源包的镜像。典型内容包括：

```text
manifest.json
textures/item_texture.json
textures/items/
textures/blocks/
models/entity/
attachables/
entity/
animations/
animation_controllers/
sounds/
texts/
```

其中实际文件集合取决于被采集内容。对 2D 物品，`item_texture.json` 中的 `texture_data` shorthand 必须与映射 `bedrock_options.icon` 一致；PNG 路径通常不写扩展名。对 3D 物品，Rainbow 可能输出 attachable、Bedrock geometry、动画与 GUI 图标。不要为了“看起来完整”手工塞入 Java 的 `assets/`、`pack.mcmeta`、OptiFine 文件或 Bedrock 行为包文件。

`manifest.json` 的 header/module UUID、version 与 pack 内容必须有效且稳定可追踪。重新生成后 UUID 是否改变由输出工具决定；若改变，应在 release manifest 中记录，避免 Bedrock 客户端拿旧缓存误判为新包。

## 8. 受控部署到 Geyser

### 前置配置

确认 Geyser 配置：

```yaml
gameplay:
  enable-custom-content: true
```

该开关关闭时，自定义 item/block/skull mappings 会被禁用；修改它需要重启 Geyser。不要把“热重载没有报错”当成它已注册。

### 投放位置

Geyser 官方目录随平台变化，但逻辑固定：

```text
<Geyser data folder>/
├── custom_mappings/       # 本项目拥有的 JSON 映射文件
├── packs/                 # Bedrock ZIP 或 MCPACK
├── locales/overrides/     # Rainbow 导出的语言覆盖
├── custom-skulls.yml      # 结构化合并后的活动文件，不整体覆盖
└── extensions/            # 仅复杂实体/Display 路线需要
```

在 Paper/Spigot 平台中通常是 `plugins/Geyser-<platform>/` 下的相应目录；Standalone 则位于 Geyser 根目录。以实际服务器安装路径为准，不要在文档站或开发机的同名目录部署。

### Custom skulls 的幂等合并

Rainbow 若输出 `custom-skulls.yml`，先原样放入 release 的 `rainbow/input/`，不要把它改名后直接投放。发布脚本必须用 YAML 解析器读取“当前活动 `custom-skulls.yml`”和 Rainbow 原始输入，逐 section 处理 `player-usernames`、`player-uuids`、`player-profiles`、`skin-hashes`：

1. 缺失 section 按 Geyser 当前 schema 初始化，保留原有值的类型和结构。
2. 每个 section 都是字符串 list；以 username、UUID、profile 或 skin hash 的完整字符串去重，相同值跳过，保证重复执行不会增长文件。
3. 新条目追加到内存结构；不要把 list 当成可按“key 更新”的 map，也不要静默删除现有头颅。
4. 输出本次新增 `custom-skulls.patch.yml`，再输出全量 `merged/custom-skulls.yml`，只有后者才可原子替换 Geyser 活动文件。
5. 对合并结果重新解析 YAML、统计四个 section 的条目数并记录 SHA；只有这个最终文件进入部署清单。

这一步是“patch → active file”的转换，不是字符串拼接；不要用正则替换 YAML，也不要把 `custom-skulls.patch.yml` 当成 Geyser 会自动读取的文件。

### 原子发布原则

1. 先把 release 目录完整生成并静态检查通过。
2. 记录 Geyser 当前拥有的本项目文件 SHA 与名称。
3. 只替换本项目命名空间拥有的映射/pack/语言文件；不动其他插件或服务器已存在的文件。
4. 对历史文件先归档到 release archive，再在确认活动清单后移除精确文件名。绝不清空整个 `packs/` 或 `custom_mappings/`。
5. 重启 Geyser/服务器，采集启动日志。
6. 使用干净或已清资源包缓存的 Bedrock 客户端重新连接进行验收。

推荐在 Geyser 目录中使用固定、可归属的文件名，例如：

```text
custom_mappings/managed/miragedge-managed.json
packs/miragedge-bridge-<release-id>.mcpack
locales/overrides/zh_cn.json
```

不要让 Rainbow 输出覆盖一个不带项目归属的 `mappings.json`，否则很难判断一个旧映射是本项目、另一个插件还是人工修补产生的。

### 远程资源包限制

若不使用本地 `packs/` 而改用 Geyser API 发送远程资源包，Bedrock 客户端要求：最终链接可直接下载、`Content-Length` 精确、`Content-Type: application/zip`。重定向可以存在，但最终响应仍必须满足这些条件。部署前用：

```shell
curl -I -L https://example.invalid/miragedge-bedrock-r01.zip
```

验证响应头；网页预览链接、鉴权 HTML、未知长度的流式下载和错误 Content-Type 都会导致 Bedrock 下载失败。

## 9. 回滚

回滚不是“重新跑 Rainbow”。保留上一个已通过实机测试的 release：

1. 记录故障 release ID、Geyser build、Bedrock 客户端版本和首条错误日志。
2. 精确恢复前一 release 拥有的 mappings、pack、locale 与头颅合并结果。
3. 重启 Geyser并让 Bedrock 客户端重新连接。
4. 验证前一 release 的 SHA 与上线记录一致。
5. 故障 release 保留在 archive，连同 `report.txt` 与差异，禁止删除证据后再试图复现。

实际是否渲染正确仍要按 [验收与排错](./validation) 完成；ZIP、JSON 和启动日志都只是逐层通过，不是玩家视角的最终结论。
