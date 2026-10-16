---
title: CE 与合并资源包
description: 按实际配置处理 CraftEngine 的合并资源链。说明事实源配置、四个资源来源、外部目录与 ZIP 清单、双模型数据规则、合并冲突对转换的影响，以及 CE 物品的收集策略。
outline: [2, 3]
---

# CE 与合并资源包

核心判断是：CE 不只有 `resources/` 目录。在 MiragEdge，CE 负责生成 Java 客户端最终看到的资源包。

生成阶段还会合并其他插件目录、数据包资源包和独立 ZIP。Geyser 的转换输入应覆盖这条合并链，而不是只转换某个 CE pack。

## 事实源

```text
F:\FCelestial\CraftEngine\config.yml
```

每次转换开始前必须读取并记录以下配置段的当前值：

```yaml
resource-pack:
  path: "./generated/resource_pack.zip"
  merge-external-folders: []
  merge-external-zip-files: []
  validation: {}
  protection: {}
  duplicated-files-handler: []
item: {}
block: {}
furniture: {}
```

本文示例来自当前配置中已核对的字段。CE 版本升级后仍要用服务器文件和日志确认字段名。文档中的 `texture`、`model`、`pack.yml` namespace 不能替代实际资源文件。

## 四个资源来源

### CE 自建资源

来自 `CraftEngine/resources/` 下的 pack，包含物品、方块、模板、装备、字体图标、作物和菜单资源。每个 pack 的 `pack.yml` 决定 namespace。不要因为目录名相似就把所有 ID 写成 `miragedge:*`。

已核对的资源快照目录：

| 目录 | `pack.yml` namespace | 主要用途 |
| --- | --- | --- |
| `customcrops` | `customcrops` | 作物、浇水、肥料与农作物资源 |
| `internal` | `internal` | CE 内部界面与映射支持资源 |
| `miragedge_icon` | `miragedge_icon` | 字体图标 |
| `miragedge_items` | `miragedge_items` | 物品、装备、工具与模型 |
| `miragedge_menu` | `miragedge_menu` | 菜单图标与界面资源 |
| `miragedge_other` | `miragedge_other` | GUI、粒子及其他资源 |
| `miragedge_rank` | `miragedge_rank` | 称号与权限图标 |
| `remove_shulker_head` | `minecraft` | 原版命名空间覆盖，必须重点审计冲突 |
| `stellarity_items` | 当前 `pack.yml` 未声明 namespace | 不得猜测，从 CE 注册日志和最终包路径确认 |
| `vane_trifles` | `vane_trifles` | Vane 物品与工具 |

每次新增或升级 pack，先重新生成 inventory：

```powershell
$root = 'F:\FCelestial\CraftEngine\resources'
Get-ChildItem $root -Directory | ForEach-Object {
  $packYml = Join-Path $_.FullName 'pack.yml'
  $namespace = if (Test-Path $packYml) {
    (Select-String -LiteralPath $packYml -Pattern '^\s*namespace\s*:' | Select-Object -First 1).Line
  } else { '<missing pack.yml>' }
  [PSCustomObject]@{ pack = $_.Name; namespace = $namespace }
}
```

inventory 中的 namespace、CE 注册日志、最终 Java ZIP 的 `assets/<namespace>/` 必须能互相解释。任一项对不上就停止映射，不要用 `miragedge:*` 作为兜底。
每个 pack 需要记录的字段：

| 字段 | 示例形式 | 作用 |
| --- | --- | --- |
| pack 目录 | `resources/<pack>/` | 定位 YAML 和资源包根目录 |
| `pack.yml` namespace | `customcrops` | 决定 CE 注册 ID 与 Bedrock identifier 的来源命名 |
| 注册表 | `items`、`blocks`、`templates`、`images`、`equipments` | 决定配置语义，不能互换 |
| Java 基础材质 | `bread`、`sugar`、`fishing_rod` | 决定 Geyser mapping 的 Java 顶层键 |
| `texture` 与 `model` 与 `file` | CE 资源引用 | 分别对应纹理、模型、字体与文件，不能混写 |

### 数据包伴随资源包

数据包的 `function`、`loot_table`、`recipe`、`advancement` 或 `structure` 负责逻辑。自定义物品与方块的外观一般位于其伴随资源包。

若该资源包被 CE 合并，转换器应从 CE 最终包读取它。

同时在清单里保留来源数据包的逻辑入口。

这样才能解释这一现象。同一物品在任务奖励、战利品和菜单里都需要同一个 Bedrock 映射。Java 逻辑来源可以不同，视觉 identity 必须统一。

### 外部目录

当前配置声明以下外部目录参与合并：

```yaml
merge-external-folders:
  - "ModelEngine/resource pack"
  - "EliteMobs/resource_pack"
```

它们可能包含模型、实体贴图、动画、音效或供家具与生物系统使用的技术实体资源。不要因为它们没有 `CraftEngine/resources/<pack>` 的格式就跳过。

### 外部 ZIP

当前配置的原始列表如下。后续不要只挑自己认识的包：

```yaml
resource-pack:
  merge-external-folders:
    - "ModelEngine/resource pack"
    - "EliteMobs/resource_pack"
  merge-external-zip-files:
    - "CustomNameplates/resourcepack.zip"
    - "BetterModel/build.zip"
    - "CraftEngine/zip_other/dnt.zip"
    - "CraftEngine/zip_other/true-ending-dragon-music-v1.zip"
    - "CraftEngine/zip_other/Sparkles_26.2_v1.1.10.zip"
    - "CraftEngine/zip_other/Stellarity-5.5.2-RP.zip"
    - "CraftEngine/zip_other/miragedge-charm-rp.zip"
```

这些路径是 CE 相对插件目录的输入声明，不代表每个 ZIP 都是纯贴图包。转换器应逐个解包审计 `assets/`、模型、实体、动画、声音目录，并把数据包逻辑 ZIP 与伴随资源包的关系写入 release 的 `reports/audit.json` 和 `release.json`。Rainbow 的唯一 Java 视觉输入仍是 CE 同批次最终未保护合并包。

::: warning 本地快照缺失不代表配置错误
本地 `F:\FCelestial\CraftEngine\zip_other\` 只看到 `Sparkles_26.2_v1.1.10.zip`、`Stellarity-5.5.2-RP.zip` 和 `true-ending-dragon-music-v1.zip`。配置声明的 `dnt.zip` 与 `miragedge-charm-rp.zip` 不在这个快照中。

该目录可能只是脱离服务器的配置与资源快照。应在实际服务器的插件根目录解析相对路径，并对每个 `required` 输入执行存在性和 SHA 检查。真实缺失时让 CE 与 Rainbow 流程失败，不要通过删除配置项来消除报错。
:::

```powershell
$craftEngine = 'F:\FCelestial\CraftEngine'
$pluginsRoot = Split-Path $craftEngine -Parent  # 按实际服务器目录调整
$declared = @(
  'ModelEngine/resource pack',
  'EliteMobs/resource_pack',
  'CustomNameplates/resourcepack.zip',
  'BetterModel/build.zip',
  'CraftEngine/zip_other/dnt.zip',
  'CraftEngine/zip_other/true-ending-dragon-music-v1.zip',
  'CraftEngine/zip_other/Sparkles_26.2_v1.1.10.zip',
  'CraftEngine/zip_other/Stellarity-5.5.2-RP.zip',
  'CraftEngine/zip_other/miragedge-charm-rp.zip'
)
$missing = foreach ($relative in $declared) {
  $resolved = Join-Path $pluginsRoot $relative
  if (-not (Test-Path -LiteralPath $resolved)) { $resolved }
}
if ($missing) { throw "BLOCKED: CE merge input missing:`n$($missing -join "`n")" }
```

### Sparkles 与 Stellarity 的边界

名称对应关系必须固定记录，不能按文件名猜测数据包维度：

| Java 数据包或资源包 | 内容归属 | 本次发布策略 |
| --- | --- | --- |
| `Sparkles_26.2_v1.1.10.zip` | Incendium 地狱内容 | 不作为本次新增转换输入，现有 `F:\FCelestial\Geyser-Velocity\packs\incendium-pack.mcpack` 独立保留 |
| `Stellarity-5.5.3.zip` | Stellarity 末地数据包 | 本次缺失内容，必须与 CE 最终未保护包一起作为 Java 采集和静态审计输入 |
| `Stellarity-5.5.2-RP.zip` | CE 配置声明的伴随资源包 | 不能替代启用中的 `Stellarity-5.5.3.zip`，只用于追溯合并来源，最终模型以 CE 未保护合并包为准 |

首发 Rainbow 输入应组织为：

```text
F:\FCelestial\Geyser-Velocity\bridge\incoming\2026-07-31-r01\
  ce\          # F:\FCelestial\CraftEngine\rainbow 的完整目录
  stellarity\  # Java 26.2 测试客户端导出的 Stellarity Rainbow 目录
```

::: danger 不要把 incendium-pack 混入 stellarity
它是另一个所有者、另一个 Bedrock pack 生命周期。混入会让语言、声音和同名资源的来源无法审计。
:::

外部输入在发布记录中的写法：

```yaml
external_inputs:
  - path: "<实际路径>"
    kind: folder-or-zip
    sha256: "..."
    required: true
    owner: "ModelEngine / datapack / plugin"
```

缺少某个标记为 `required: true` 的外部输入时，转换流程必须失败，而不是生成一个看着能用但缺模型的基岩版包。

## 使用未保护最终包

当前 CE 关键配置：

```yaml
resource-pack:
  path: "./generated/resource_pack.zip"
  protection:
    unprotected-copy:
      enable: true
      path: "./generated/resource_pack_unprotected.zip"
```

转换策略：

1. 生产玩家继续使用主 `resource_pack.zip`，不要为方便转换而关闭保护。
2. Rainbow 使用同一生成批次的 `resource_pack_unprotected.zip`。
3. 记录两个包的 SHA-256 和生成时间，确认未保护包不是旧缓存。
4. 未保护包不存在或不完整时，重新运行 CE 资源包生成流程。不要把受保护包解混淆当作常规步骤。

CE 的保护配置包括混淆 namespace 与 path、图集、JSON、模型和纹理。即使 `obfuscation.item-model.enable` 当前为 `false`，整体保护仍可能影响其他资产。转换器需要标准资源结构，未保护副本就是本项目明确提供的边界。

配置启用不等于文件已生成。2026-07-31 现场已确认 `resource_pack_unprotected.zip` 存在，且与主包修改时间相差 241 秒，Bridge 用 900 秒窗口记录这一事实。真正的阻断项是 CE 配置中六个外部 merge 输入在当前插件根目录缺失，必须恢复来源或经内容所有者确认后移除配置并重新生成。

## 合并冲突对转换的影响

当前 `duplicated-files-handler` 对若干冲突类型有显式处理：

| CE 冲突处理 | 对转换输入的影响 |
| --- | --- |
| `minecraft/models/item` 走 `merge_legacy_model` | 外部包和 CE 模型覆盖会被合并，转换器必须看合并结果，不能只拿某一方的模型 JSON |
| `minecraft/items` 走 `merge_json` | 现代 item model definition 可能来自多个包，最终结构决定 Geyser 的 `model` 值 |
| `pack.mcmeta` 走 `merge_pack_mcmeta` | 版本元数据可能已合并，不要用某个外部 ZIP 的 pack_format 覆盖最终包 |
| `sounds.json` 走 `merge_json` | 声音命名空间和事件表需要从最终包采集 |
| `minecraft/atlases` 走 `merge_atlas` | 图集路径与纹理可用性必须以合并后的 atlas 为准 |
| `font/default.json` 与 `font/uniform.json` 走 `merge_font` | Java 字体图标合并不代表基岩版 UI 已兼容，字体需要单独路线 |

对任何冲突警告，保存 CE 生成日志和最终 ZIP 清单。

若转换器报告某模型缺 parent 或纹理，先回到 CE 合并结果排查。不要在基岩版输出里盲目补一份同名 JSON。

## 双模型数据的设计规则

当前 item 段关键值：

```yaml
item:
  client-bound-model: true
  always-use-item-model: true
  always-use-custom-model-data: true
  always-generate-model-overrides: true
  custom-model-data-starting-value:
    default: 10000
    overrides:
      paper: 20000
```

这表示一个 CE 物品可能同时携带现代 `minecraft:item_model` 和兼容用的 `custom_model_data`，并为旧资源格式生成模型覆盖。设计 CE 物品时遵守：

- 对同一个 Java 基础物品，视觉 identity 使用稳定且不冲突的 item model 或 CMD。唯一性作用域是「Java 基础物品加 item model 或 CMD」。不同基础物品可以合法复用同一个 CMD，例如四个盔甲槽位。不要只改名称和 Lore。
- 不要手工占用 CE 的自动 CMD 范围。当前 Paper 覆盖起点为 20000，新增规则必须以当前配置为准。
- 现代 Geyser v2 映射优先使用实际 `item_model`。legacy 定义只在确实需要 CMD 的版本或物品中保留。
- 同一个 Java 基础物品的不同外观必须有可匹配的模型值。只靠 PDC、Lore、物品名称或 CE YAML 文件名，Geyser 无法通用区分。
- 把一个物品配置拆成多个状态时，显式记录默认、损坏、抛竿、数量、维度、装备槽位等状态。这些状态决定 Geyser 谓词与 group 的数量。

### 普通物品的 CE 设计样式

以下只说明 CE 侧的 identity 设计，字段必须以实际 CE 版本为准：

```yaml
items:
  miragedge_items:star_rod:
    material: fishing_rod
    data:
      item-name: "<!i><b>星辉钓鱼竿</b>"
      custom-model-data: 20001
    texture: minecraft:item/rods/star_rod
```

对于当前开启 `client-bound-model` 的环境，不要把 `texture` 误写成 Geyser 的 `model` 值。创建或获取一个真实物品后，让 Rainbow 读取客户端最终组件。上例中的 `20001` 只是配置示意，不能假定它就是最终协议值。

### 多状态物品

鱼竿、耐久工具、充能武器等应保留状态模型，而不是只保留一张 GUI 图：

```yaml
items:
  miragedge_items:star_rod:
    material: fishing_rod
    texture:
      - minecraft:item/rods/star_rod
      - minecraft:item/rods/star_rod_cast
```

转换时要验证 Java 端抛竿前后实际 `item_model` 或模型谓词是否变化。基岩版侧再检查 Rainbow 是否生成 `fishing_rod_cast` 谓词或等价 attachable 状态。不要凭两张 PNG 推断 Geyser 已经会切换。

## CE 物品收集策略

Rainbow 需要看见实际物品。在测试服务器准备一个转换收集箱：

1. 按 `pack.yml` namespace 和物品清单为每个 CE 物品生成一格。
2. 用 CE 当前版本的真实命令取得物品。命令语法以 `/ce help` 或服务器文档为准，不要把另一个 CE 版本的命令写进脚本。
3. 把数据包任务奖励、战利品、配方结果和外部插件物品也放入收集箱。
4. 用 `/rainbow auto inventory` 打开并扫描收集箱。
5. 对覆盖原版 item model、状态型物品、菜单中没有的隐藏物品，手持后执行 `/rainbow map item`。
6. 在清单中记录实际来源和已采集场景，避免把一个物品只在背包里扫到就宣称掉落、放置或装备也兼容。

::: warning CE item ID 不能直接当映射键
CE item ID 只用于服务器侧管理和内容清单。Geyser 的 Java mapping key 必须是实际基础 Java item，`model` 必须是实际 item model 或 legacy CMD。
:::

## 相关页面

- [CE 方块、家具与服务器状态](./resource-sources#1-ce-方块与家具)
- [CE 内容设计规则与清单](./resource-sources)
- [CE 开发工作流](../../craftengine/)
- [复杂数据包实体与展示](../entities)
- [转换与发布](../conversion/)
