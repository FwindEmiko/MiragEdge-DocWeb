---
title: "Geyser 工作流 · CraftEngine 与合并资源包"
description: "按 F:\\FCelestial\\CraftEngine 的真实配置处理 CE 自建内容、数据包伴随包、外部 ZIP、双模型数据和服务器端方块。"
outline: deep
---

# CraftEngine 与合并资源包

本页的核心判断是：**CE 不是只有 `resources/` 目录。** 在 MiragEdge，CE 负责生成 Java 客户端最终看到的资源包，并在生成阶段合并其他插件目录、数据包资源包和独立 ZIP。Geyser 转换的输入应覆盖这条合并链，而不是只转换某个 CE pack。

## 1. 读取当前配置，而不是复制旧示例

事实源：

```text
F:\FCelestial\CraftEngine\config.yml
```

每次转换开始前，AI 必须读取并记录以下配置段的当前值：

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

本文下面的示例来自当前配置的已核对字段；CE 版本升级后仍要用服务器文件和日志确认字段名。文档中的 `texture`、`model`、`pack.yml` namespace 不能替代实际资源文件。

## 2. 识别四个资源来源

### CE 自建资源

通常来自 `CraftEngine/resources/` 下的 pack：物品、方块、模板、装备、字体图标、作物和菜单资源。每个 pack 的 `pack.yml` 决定 namespace；不要因为目录名相似就把所有 ID 写成 `miragedge:*`。

本文核对的资源快照目录如下。它是 inventory 基线，不是允许 AI 凭目录名猜 namespace 的理由：

| 目录 | `pack.yml` namespace（核对值） | 主要用途方向 |
| --- | --- | --- |
| `customcrops` | `customcrops` | 作物、浇水、肥料与农作物资源 |
| `internal` | `internal` | CE 内部界面与映射支持资源 |
| `miragedge_icon` | `miragedge_icon` | 字体图标 |
| `miragedge_items` | `miragedge_items` | 物品、装备、工具与模型 |
| `miragedge_menu` | `miragedge_menu` | 菜单图标与界面资源 |
| `miragedge_other` | `miragedge_other` | GUI、粒子及其他资源 |
| `miragedge_rank` | `miragedge_rank` | 称号/权限图标 |
| `remove_shulker_head` | `minecraft` | 原版命名空间覆盖，必须重点审计冲突 |
| `stellarity_items` | 当前 `pack.yml` 未声明 namespace | 不得猜测；从 CE 注册日志和最终包路径确认 |
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

inventory 中的 namespace、CE 注册日志、最终 Java ZIP 的 `assets/<namespace>/` 必须能互相解释；任一项对不上就停止映射，不要用 `miragedge:*` 作为兜底。

对每个 pack 记录：

| 字段 | 示例形式 | 作用 |
| --- | --- | --- |
| pack 目录 | `resources/<pack>/` | 定位 YAML 和资源包根目录。 |
| `pack.yml` namespace | `customcrops` | 决定 CE 注册 ID 和 Bedrock identifier 的来源命名。 |
| 注册表 | `items`、`blocks`、`templates`、`images`、`equipments` | 决定配置语义，不能互换。 |
| Java 基础材质 | `bread`、`sugar`、`fishing_rod` | 决定 Geyser mapping 的 Java 顶层键。 |
| `texture`/`model`/`file` | CE 资源引用 | 分别对应纹理、模型、字体/文件，不能混写。 |

### 数据包伴随资源包

数据包的 `function`、`loot_table`、`recipe`、`advancement` 或 `structure` 负责逻辑，但自定义物品/方块的外观一般位于其 companion resource pack。若该资源包被 CE 合并，转换器应从 CE 最终包读取它，同时在清单里保留来源数据包的逻辑入口。

这样才能解释“同一物品为什么在任务奖励、战利品和菜单里都需要同一个 Bedrock 映射”：Java 逻辑来源可以不同，视觉 identity 必须统一。

### 外部目录

当前配置已声明以下外部目录会参与合并：

```yaml
merge-external-folders:
  - "ModelEngine/resource pack"
  - "EliteMobs/resource_pack"
```

它们可能包含模型、实体贴图、动画、音效或供家具/生物系统使用的技术实体资源。不能因为它们没有 `CraftEngine/resources/<pack>` 的格式就跳过。

### 外部 ZIP

当前配置还声明了独立 ZIP 合并链，包含 CustomNameplates、BetterModel，以及 `CraftEngine/zip_other/` 下的数据包/世界内容资源包，例如 Dungeons & Taverns、真结局音乐、Sparkles、Stellarity 和 MiragEdge charm 等。具体文件名、版本和存在性以当前 `config.yml` 和实际文件 SHA 为准。

当前配置中的原始列表如下；后续 AI 不得只挑自己认识的包：

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

这些路径是 CE 相对插件目录的输入声明，不代表每个 ZIP 都是“纯贴图包”。转换器应逐个解包审计 `assets/`、模型/实体/动画/声音目录，并把数据包逻辑 ZIP 与 companion resource pack 的关系写入 `source-manifest.yml`；但 Rainbow 的唯一 Java 视觉输入仍是 CE 同批次最终未保护合并包。

本文编写时本地 `F:\FCelestial\CraftEngine\zip_other\` 只看到 `Sparkles_26.2_v1.1.10.zip`、`Stellarity-5.5.2-RP.zip` 和 `true-ending-dragon-music-v1.zip`；配置声明的 `dnt.zip` 与 `miragedge-charm-rp.zip` 不在这个快照中。此现象不能通过删除配置项来“修复”：该目录可能只是脱离服务器的配置/资源快照。应在实际服务器的插件根目录解析相对路径，并对每个 `required` 输入执行存在性和 SHA 检查；真实缺失时让 CE/Rainbow 流程失败。

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

在发布记录中，建议将每个外部输入记录为：

```yaml
external_inputs:
  - path: "<实际路径>"
    kind: folder-or-zip
    sha256: "..."
    required: true
    owner: "ModelEngine / datapack / plugin"
```

缺少某个标记为 `required: true` 的外部输入时，转换流程必须失败，而不是生成一个“看起来能用但缺模型”的 Bedrock 包。

## 3. 使用未保护最终包

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
4. 未保护包不存在或不完整时，重新运行 CE 资源包生成流程；不要把受保护包解 obfuscation 当作常规步骤。

CE 的保护配置包括混淆 namespace/path、图集、JSON、模型和纹理等。即使 `obfuscation.item-model.enable` 当前为 `false`，整体保护仍可能影响其他资产。转换器需要标准资源结构，未保护副本就是本项目明确提供的边界。

配置启用不等于本次文件已经生成。本文核对 `F:\FCelestial\CraftEngine\generated\` 时只发现主包和 map 兼容包，未发现 `resource_pack_unprotected.zip`；这是发布前置条件失败，不是可以忽略的警告。必须重新生成并在同一批次核对两个 ZIP 的时间、大小和 SHA，再把未保护副本交给 Rainbow。

## 4. 双模型数据的设计规则

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

这表示一个 CE 物品可能同时携带现代 `minecraft:item_model` 和兼容用 `custom_model_data`，并为旧资源格式生成模型覆盖。设计 CE 物品时应遵守：

- 对同一个 Java 基础物品，视觉 identity 使用稳定且不冲突的 item model 或 CMD；唯一性作用域是 `(java base item, item_model/CMD)`，不同基础物品可以合法复用同一个 CMD（例如四个盔甲槽位）。不要只改名称和 Lore。
- 不要手工占用 CE 的自动 CMD 范围；当前 Paper 覆盖起点为 20000，新增规则必须以当前配置为准。
- 现代 Geyser v2 映射优先使用实际 `item_model`；legacy 定义只在确实需要 CMD 的版本/物品中保留。
- 同一个 Java 基础物品的不同外观必须有可匹配的模型值。只靠 PDC、Lore、物品名称或 CE YAML 文件名，Geyser 无法通用区分。
- 将一个物品配置拆成多个状态时，显式记录默认、损坏、抛竿、数量、维度、装备槽位等状态；这些状态决定 Geyser predicate/group 的数量。

### 普通物品的 CE 设计样式

以下仅说明 CE 侧的 identity 设计，字段必须以实际 CE 版本为准：

```yaml
items:
  miragedge_items:star_rod:
    material: fishing_rod
    data:
      item-name: "<!i><b>星辉钓鱼竿</b>"
      custom-model-data: 20001
    texture: minecraft:item/rods/star_rod
```

对于当前开启 `client-bound-model` 的环境，不要把 `texture` 误写成 Geyser 的 `model` 值。创建或获取一个真实物品后，让 Rainbow 读取客户端最终组件；上例中的 `20001` 只是配置示意，不能假定它就是最终协议值。

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

转换时要验证 Java 端抛竿前后，实际 `item_model`/模型 predicate 是否变化；Bedrock 侧再检查 Rainbow 是否生成 `fishing_rod_cast` predicate 或等价 attachable 状态。不要凭“两张 PNG”推断 Geyser 已经会切换。

## 5. CE 合并冲突与转换影响

当前 `duplicated-files-handler` 对若干冲突类型有显式处理：

| CE 冲突处理 | 对转换输入的影响 |
| --- | --- |
| `minecraft/models/item` → `merge_legacy_model` | 外部包和 CE 模型覆盖会被合并；转换器必须看合并结果，不能只拿某一方的模型 JSON。 |
| `minecraft/items` → `merge_json` | 现代 item model definition 可能来自多个包，最终结构决定 Geyser `model` 值。 |
| `pack.mcmeta` → `merge_pack_mcmeta` | 版本元数据可能已合并，不要用某个外部 ZIP 的 pack_format 覆盖最终包。 |
| `sounds.json` → `merge_json` | 声音命名空间和事件表需要从最终包采集。 |
| `minecraft/atlases` → `merge_atlas` | 图集路径与纹理可用性必须以合并后的 atlas 为准。 |
| `font/default.json`、`font/uniform.json` → `merge_font` | Java 字体图标合并不代表 Bedrock UI 已兼容；字体需要单独路线。 |

对任何冲突警告，保存 CE 生成日志和最终 ZIP 清单。若转换器报告某模型缺 parent 或纹理，先回到 CE 合并结果排查，不要在 Bedrock 输出里盲目补一份同名 JSON。

## 6. CE 物品收集策略

Rainbow 需要看见实际物品。建议在测试服务器准备一个“转换收集箱”：

1. 按 `pack.yml` namespace 和物品清单为每个 CE 物品生成一格。
2. 用 CE 当前版本真实命令取得物品；命令语法以 `/ce help` 或服务器文档为准，不要把另一个 CE 版本的命令写进脚本。
3. 将数据包任务奖励、战利品、配方结果和外部插件物品也放入收集箱。
4. 用 Rainbow `/rainbow auto inventory` 打开并扫描收集箱。
5. 对覆盖原版 item model、状态型物品、菜单中没有的隐藏物品，手持后执行 `/rainbow map item`。
6. 在清单中记录“实际来源”和“已采集场景”，避免把一个物品只在背包里扫到就宣称掉落、放置或装备也兼容。

CE item ID 只用于服务器侧管理和内容清单。它不能直接成为 Geyser 的 Java mapping key；mapping key 必须是实际基础 Java item，`model` 必须是实际 item model 或 legacy CMD。

## 7. CE 方块、家具与真实服务器状态

当前配置有：

```yaml
block:
  serverside-blocks: 2000
  sound-system:
    enable: true

furniture:
  hide-base-entity: true
```

这意味着方块和家具可能涉及服务器端注册 ID、技术实体、碰撞/交互实体、光照和声音系统。转换路线必须拆开：

- 普通“方块状态覆盖 + Java block model”可先用 Rainbow auto/manual block mapping。
- CE 服务器端真实方块必须从实际放置世界、区块和 Geyser 报告确认 Java 状态；不能假定它是 `note_block`、`tripwire` 或其他原版替代物。
- 家具的可见模型若由 `item_display`、`block_display`、Armor Stand 或技术实体承载，应转到 [实体与展示页](./entities)，不能当成普通 block mapping。
- `sound-system` 解决 Java 客户端声音体验，不会自动把声音事件变成 Bedrock sound definition；Rainbow 仍需扫描并实测。
- `hide-base-entity` 隐藏的是 CE 内部跟踪实体，不能据此认为 Bedrock 客户端会自动获得同样的模型和碰撞。

## 8. 盔甲、装备和鞘翅

物品栏图标和穿戴模型是两条链：

```text
CE items.texture/model
  -> Java 物品栏、手持、掉落物

CE equipment / asset-id / humanoid
  -> Java 装备渲染与实体贴图
```

转换时至少分四个测试：helmet、chestplate、leggings、boots；另加 elytra 的飞行状态。Rainbow 可以分析简单 `equippable` 和装备资产，但自定义鞘翅在 Bedrock 侧目前只能把“视觉显示”作为通过条件，不能假定 Java 侧的所有装备行为都被迁移。

CE 1.21.2+ 的 component 装备与旧版本 trim 分支不能凭教程删除。转换器只应读取最终 Java 包和真实装备组件；若 `report.txt` 没有生成装备 attachable 或 UV 异常，标记为人工处理，而不是强行补图。

## 9. 字体、菜单和图集

当前 CE 可能合并 `font/default.json`、`font/uniform.json`、图标字体和菜单图片。Java 字体 glyph 与 Bedrock UI 不是同一格式：

- CE `images:` 的字符映射可以继续服务 Java 客户端。
- Geyser 语言覆盖只能解决文本翻译，不能把 Java 字体 glyph 变成 Bedrock 菜单布局。
- 菜单按钮的 Java slot、字体宽度和基岩 UI 控件位置不能靠资源包转换器自动等价。
- 对关键菜单应提供 Bedrock 可读的文字/物品图标回退，并把点击、翻页和关闭动作列入实机测试。
- 资源包被 CE 合并或图集优化后，转换器必须读取最终 atlas；不要手工使用某个外部包的 `item_texture.json` 覆盖 Rainbow 产物。

## 10. CE 侧兼容性设计清单

新增 CE 内容前先完成：

- [ ] 物品有稳定的基础 Java material。
- [ ] 在同一基础 Java material 内，视觉 identity 的 `item_model`/CMD 稳定且不冲突，不依赖名称/Lore/PDC。
- [ ] 状态切换能在 Java 测试客户端实际观察到，并已写入清单。
- [ ] 资源路径大小写、namespace、父模型和纹理全部存在。
- [ ] 需要放置/装备/食用/充能的行为由 CE 与 Java 逻辑实现，Bedrock mapping 只登记可预定义的组件。
- [ ] 复杂模型没有被 CE 保护/混淆输出遮蔽；转换使用同批次未保护副本。
- [ ] 外部目录和 ZIP 已加入合并清单，且来源 SHA 可追踪。
- [ ] 真实方块、家具、技术实体和 Display Entity 已标记独立路线。
- [ ] 变更后重新生成 CE 最终包，而不是复用旧 `resource_pack_unprotected.zip`。
- [ ] Java 端通过后才运行 Rainbow；Rainbow 通过后再做 Geyser/Bedrock 测试。

## 11. 常见错误

| 现象 | 根因方向 | 正确处理 |
| --- | --- | --- |
| Rainbow 生成包缺少数据包物品 | 只转换了 CE 自建 pack | 使用 CE 最终未保护合并包，并从配方/奖励/菜单收集真实物品。 |
| Java 正常、Bedrock 只有原版图标 | mapping 的基础物品或 `model` 值错误 | 从真实物品栈和 Rainbow 报告核对，不要从 PNG 路径猜。 |
| 3D 模型变成平面图 | Java 模型父级、display transform、多个纹理或动画超出 Rainbow 范围 | 标记为人工 Bedrock geometry/attachable，保留 2D GUI 回退。 |
| 外部生物包整体缺失 | 被当作独立 ZIP 忽略或模型由技术实体承载 | 检查 CE merge 输入，按实体/Display 路线处理。 |
| 受保护包能给 Java，转换器报路径/JSON 错 | 保护、混淆、图集和 JSON 转义介入 | 使用同批次 `resource_pack_unprotected.zip`。 |
| CE 重载后 Java 包变了，Bedrock 仍是旧模型 | Geyser pack 和 Java pack 是独立缓存 | 生成新 release、更新 Geyser pack/mapping、重启并清理 Bedrock 资源包缓存。 |
