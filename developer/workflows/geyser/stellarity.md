---
title: "Stellarity 5.5.3 末地转换批次"
description: "把启用中的 Stellarity-5.5.3 数据包和 CraftEngine 最终 Java 资源包纳入 Geyser Rainbow 增量发布。"
outline: deep
---

# Stellarity 5.5.3 末地转换批次

本页是当前 FCelestial 服务器的实际操作单，不是通用示例。`Sparkles_26.2_v1.1.10.zip` 属于 Incendium 地狱内容，现有 `incendium-pack.mcpack` 已独立验证，本批次不处理它。真正缺少的是 `Stellarity-5.5.3.zip` 的末地内容。

## 1. 输入锁定

转换必须同时锁定两个版本：

| 输入 | 路径 | SHA-256 | 用途 |
| --- | --- | --- | --- |
| 启用中的数据包 | `F:\FCelestial\datapacks\output_26.2\[S][2繁星末地]Stellarity-5.5.3.zip` | `52314b439dac837b19932c1b97db3205cb105d994c93b9e94478215faaa28767` | 提取 `item_model`、函数入口、声音、实体和 Display 证据 |
| CE 最终 Java 包 | `F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip` | `bf4d96e62f5414f8977f3670542639eee7d19a47240d33d5dced9ab1633c10c1` | Java 客户端实际加载的模型、贴图、语言和声音 |

不要使用 `resource_pack.zip` 做解析输入。它是保护包，标准 ZIP 读取可能出现 CRC/本地条目错误。`Stellarity-5.5.2-RP.zip` 只是 CE 配置中的 companion RP，不能替代启用中的 5.5.3 数据包，也不能替代 CE 最终合并包。

只读预检：

```powershell
$dp = 'F:\FCelestial\datapacks\output_26.2\[S][2繁星末地]Stellarity-5.5.3.zip'
$java = 'F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip'
Get-FileHash $dp, $java -Algorithm SHA256
tar -tf $dp | Select-Object -First 10
tar -tf $java | Select-Object -First 10
```

## 2. 自动转换边界

静态扫描当前版本得到 159 条唯一物品证据，其中 110 条可以生成 Geyser item v2 `definition` 映射：93 条普通二维贴图，17 条 handheld 平面贴图，覆盖 82 个 `stellarity:item_model` 和 43 种 Java 原版基底物品。这 110 条已经进入 bridge r01 的 approved static snapshot。

剩余内容不能被“从 PNG 猜模型”安全替代：

- 32 条 dynamic item model（22 个 selector），实际可达的复杂物品包括 `dragon_wings`、`empress_wings`、`harvester`、`slayer_crossbow`、`sandstorm_trident`、`sharanga`、`starless_scythe`、`stellar_striker` 等；它们含 `using_item`、蓄力、破损、装备槽、钓竿抛出、`trim_material` 或 CMD 分支。
- 6 个 cuboid 模型：`altar_of_the_accursed`、`altar_of_the_sacred`、`ender_dirt_path`、`ender_grass_block`、`pixie_in_a_jar`、`shulker_body`。
- 5 个无法静态分类的模型：`ashen_froglight`、`ender_dirt`、`enderite_block`、`rooted_ender_dirt`、`pufferfish`；另有 `bell_flower`、`chorus_petal`、`chorus_juice`、`loaf_of_plenty` 等缺定义或缺 Java 基底的证据。
- 3 个原版方块状态文件被数据包覆盖：`chorus_flower`、`chorus_plant`、`purpur_block`。它们不是 item mapping。
- 119 行 `item_display`、87 行 `block_display` 位于 Stellarity 函数中；光之女皇的技术模型和翅膀必须走 GeyserDisplayEntity 或专门的 Bedrock 实体适配。
- 6 个实体变体、26 张实体贴图、7 个装备定义、11 个画作变体、35 个 OptiFine 文件（11 CIT、23 随机实体贴图、1 emissive）需要单独人工路线。

因此，“110 条静态通过”只代表普通物品映射可发布，不代表末地 Boss、方块状态、实体和动画已经兼容。

## 3. Java Rainbow 采集

在隔离的 Java 26.2 测试客户端中安装与服务端匹配的 Fabric Loader、Fabric API 和 Rainbow，加载 **CE 最终未保护包**。先确认 Java 客户端看到的 Stellarity 物品没有粉紫缺纹理，再开始导出。

每一批使用新目录，例如 `stellarity-r01`。不要把不同状态混进同一次截图或导出：

```mcfunction
/rainbow create stellarity-r01
```

服务器控制台或管理员执行以下批次函数；`<collector>` 换成测试玩家名：

```mcfunction
execute as <collector> at @s run function stellarity:_cmd/give/armor
execute as <collector> at @s run function stellarity:_cmd/give/blocks
execute as <collector> at @s run function stellarity:_cmd/give/food
execute as <collector> at @s run function stellarity:_cmd/give/misc
execute as <collector> at @s run function stellarity:_cmd/give/potions
execute as <collector> at @s run function stellarity:_cmd/give/spawn_eggs
execute as <collector> at @s run function stellarity:_cmd/give/tools
execute as <collector> at @s run function stellarity:_cmd/give/trinkets
execute as <collector> at @s run function stellarity:_cmd/give/weapons
```

每批拿到物品后在客户端执行 `/rainbow mapinventory`，并分别检查背包、主手、副手、装备槽、丢弃物和容器。额外取出容易被入口函数注释掉的物品：

```mcfunction
loot give <collector> loot stellarity:item/trinket/prismatic_shield
loot give <collector> loot stellarity:item/trinket/radiant_jewel
loot give <collector> loot stellarity:item/weapon/slayer_crossbow
loot give <collector> loot stellarity:item/trinket/bell_flower
loot give <collector> loot stellarity:item/material/chorus_petal
```

动态物品要额外记录状态：

| 物品类型 | 必测状态 |
| --- | --- |
| 鞘翅/翅膀 | 背包、胸甲槽、第一/第三人称、飞行、破损 |
| 弓弩/三叉戟/镰刀 | 未使用、蓄力中、释放、耐久变化、第一/第三人称 |
| 钓竿/工具 | 未抛出、已抛出、损坏、不同耐久区间 |
| 装备 | 四个装备槽、`display_context`、trim 材质和重登后缓存 |

完成所有可达物品后执行：

```mcfunction
/rainbow finish
```

保留 Rainbow 输出目录的完整内容，包括 `custom_mappings/`、`pack/` 或 `pack.zip`、`lang/`、`custom-skulls.yml` 和 `report.txt`。不要直接把它复制到 Geyser 活动目录。

## 4. 首发输入组织

CE Rainbow 已经存在于 `F:\FCelestial\CraftEngine\rainbow`，无需重新采集。首发输入根的第一层就是来源所有者，CE 的独立采集批次不要再套一层 `ce/`，否则它们会被错误视为同一个可互相覆盖的来源：

```text
F:\FCelestial\Geyser-Velocity\bridge\incoming\2026-07-31-r01\
  customcrops\
  food\
  gem\
  item\
  tools\
  vane\
  weapons\
  stellarity\
    <Rainbow stellarity-r01 输出>
```

`customcrops`、`food`、`gem`、`item`、`tools`、`vane`、`weapons` 和 `stellarity` 分别是来源所有者。桥接器会把同一来源的后续修正作为增量替换；不同来源撞到同一 Java selector、Bedrock identifier、registry key、语言键或资源路径时默认阻断，必须先审查报告再决定是否使用 `--replace-matching`。

本次不要放入：

```text
F:\FCelestial\Geyser-Velocity\packs\incendium-pack.mcpack
F:\FCelestial\datapacks\output_26.2\[S][2繁星末地]Stellarity-5.5.3.zip
```

前者是已验证的独立 Bedrock 包，后者是 Java 逻辑证据；二者都不是 Rainbow 产物。

## 5. Bridge 发布命令

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
python .\bridge.py ingest --release 2026-07-31-r01 --source .\incoming\2026-07-31-r01
python .\bridge.py validate --release 2026-07-31-r01
```

`ingest` 会一次性复制输入并生成 staged mapping、Bedrock pack、语言覆盖、skull 合并和 `provenance.json`。之后检查：

- `reports/stage.json` 中出现本次应有的 `customcrops`、`food`、`gem`、`item`、`tools`、`vane`、`weapons` 和 `stellarity` 来源；
- `reports/validation.json` 没有 mapping selector、Bedrock identifier、registry、asset 或 locale error；
- `custom_mappings` 下的 item、block、waypoint 文件格式分别正确；
- `provenance.json` 能逐条对应 mapping selector、pack member、registry key、语言键和新产生的 block/waypoint key；
- `report.txt` 中未处理的动态物品不会被误标成自动完成。

只有静态验证通过后，才在停服或维护窗口执行：

```powershell
python .\bridge.py apply --release 2026-07-31-r01 --yes
```

`apply` 之前不会修改活动 `packs/`、`custom_mappings/` 或 locale 目录；它会先创建时间戳备份。Geyser 上游会递归读取 `custom_mappings` 下的 JSON，但实际运行版本仍要用启动横幅或 JAR SHA 做一次确认。

### 已导入 CE、尚未导入 Stellarity 时

首发输入一旦被 `ingest`，桥接器会冻结 `releases/<release>/rainbow/input/`，不允许后来追加文件。这是为了防止同一 release 的来源被悄悄替换。因此如果 CE 已经导入 r01、Stellarity 仍未采集，**不要 apply r01**。等待 Stellarity 导出后创建新的最终 release，例如 `2026-08-01-r02`，复用 r01 的不可变 CE 输入而不是重新进游戏采集：

```powershell
Set-Location F:\FCelestial\Geyser-Velocity\bridge
$final = '.\incoming\2026-08-01-r02'
New-Item -ItemType Directory -Path $final -Force | Out-Null
Copy-Item '.\releases\2026-07-31-r01\rainbow\input\*' $final -Recurse
Copy-Item '<Stellarity Rainbow 完整输出目录>' (Join-Path $final 'stellarity') -Recurse

python .\bridge.py audit --release 2026-08-01-r02
# 仅首次替换旧 miragedge_*.json baseline 时使用；必须先看 r01 的冲突报告。
python .\bridge.py ingest --release 2026-08-01-r02 --source $final --replace-matching
python .\bridge.py validate --release 2026-08-01-r02
```

完成 r02 的 Java、Geyser 启动和 Bedrock 实机验收后才执行 `apply`。一旦最终 release 被 apply，之后的 release 会以受管 deployed snapshot 为基线；只需重新采集变更的第一层来源目录，不需要重新采集所有 CE 物品。

## 6. 首发后的增量规则

1. CE 或 Stellarity 修改后，重新生成 CE 最终未保护 Java 包，并重新执行 bridge `audit`；不能只替换一个旧外部 ZIP。
2. 只在 Java 测试客户端重新导出受影响的 Rainbow 来源，放进新的 release ID；旧 release 输入永远不追加。
3. 同一来源的 Rainbow 新输出会覆盖该来源的旧 selector/资源/语言键；跨来源冲突继续阻断。
4. 动态物品、Boss、Display、实体、OptiFine 和声音缺口必须保留在 coverage/manual report 中，不能因为静态映射数量增加就删除。
5. Java 客户端回归、Geyser 启动注册和 Bedrock 实机验收全部通过后才 `apply`；任何一层失败都从 `bridge/backups/` 回滚，而不是手工删除未知文件。
