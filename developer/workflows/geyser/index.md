---
title: "Geyser 基岩版内容转换工作流 · AI Skills"
description: "把 CraftEngine 合并后的 Java 资源包、数据包伴随资源包和复杂展示内容，变成可审计的 Geyser 映射与基岩版资源包。"
icon: "🌉"
outline: deep
head:
  - - meta
    - name: keywords
      content: "Geyser, Bedrock, Rainbow, CraftEngine, Java resource pack, custom mappings, item_model, custom_model_data, display entity, AI Skills"
---

# Geyser 基岩版内容转换工作流 · AI Skills

这是一套面向 MiragEdge 的可执行工作流，不是“把 Java ZIP 改后缀”的教程。目标是把 Java 侧真正送到玩家客户端的最终视觉内容，转换为 Geyser 能注册的映射和基岩版资源包，并留下可重新生成、可回滚、可验收的发布物。

本工作流同时覆盖三类输入：

1. CraftEngine 自己的物品、方块、盔甲、家具、字体与声音资源。
2. 数据包提供逻辑、但随 Java 资源包携带的物品、方块、模型、声音、头颅和展示物。
3. CE 在生成阶段合并的外部资源包，包括模型/生物系统、名称牌、复杂数据包资源包与独立 ZIP。

本文依据 2026-07-31 检索的 Geyser/Rainbow 上游资料和 `F:\FCelestial\CraftEngine\config.yml` 编写。Geyser、Bedrock 协议、Rainbow 和 CE 都会演进；每次升级后都必须重新做版本锁定和实机验收。

## 先给结论

- Geyser **不会**自动把 Java 资源包转换成 Bedrock 资源包；Java ZIP 不能直接放进 Geyser 的 `packs/` 目录。
- 对物品、简单方块、声音、头颅和部分 3D 物品，首选 Rainbow 生成 `custom_mappings`、Bedrock pack 和报告。
- 基岩版行为包或 Add-on 不能替代 Java 服务端逻辑。数据包和 CE 仍运行在 Java 服务端，Bedrock 包只负责客户端视觉与 Geyser 注册结果。
- 复杂生物、CEM/OptiFine/EMF 规则、Display Entity 组合和高级动画不是通用自动转换目标；它们必须进入“手工 Bedrock 实体 + Geyser 扩展”或“第三方 Display Entity 扩展”的独立验收分支。
- 当前 CE 已配置输出未保护副本，且会把外部资源包合并为最终 Java 包。转换器的输入应优先是这个**同一发布批次的未保护最终合并包**，不是单独挑某个 CE pack，也不是受保护的 `resource_pack.zip`。

## 系统边界

```mermaid
flowchart LR
  A["CE resources"] --> D["CE 最终 Java 资源包"]
  B["数据包伴随资源包"] --> D
  C["外部目录与 ZIP 资源包"] --> D
  D --> E["Java 测试客户端加载最终包"]
  E --> F["Rainbow 采集真实物品/方块/声音/头颅"]
  F --> G["Geyser custom_mappings"]
  F --> H["Bedrock resource pack"]
  F --> I["语言覆盖与报告"]
  G --> J["Geyser 启动注册"]
  H --> J
  I --> J
  J --> K["Bedrock 客户端实机验收"]
  L["复杂实体与 Display Entity"] --> M["人工 Bedrock 实体或扩展适配"]
  M --> J
```

这里的关键是“最终 Java 资源包”。CE 的配置可以把目录和 ZIP 合并到一个产物中，Java 客户端看到的是合并后的资源优先级与冲突处理结果。若拿 CE 自建 pack、某个数据包 ZIP 或某个外部模型包分别转换，通常会漏掉覆盖后的模型、纹理、语言、图集或声音。

## 当前 CE 事实基线

以 `F:\FCelestial\CraftEngine\config.yml` 为准，当前转换链路必须认识到以下配置事实：

| 配置事实 | 对基岩转换的含义 |
| --- | --- |
| `resource-pack.path: ./generated/resource_pack.zip` | 这是 Java 玩家实际接收的主产物，但启用了保护/混淆，不应作为转换器首选输入。 |
| `map-plugin-compatibility.enable: true`，路径为 `./generated/resource_pack_map.zip` | 这是给 BlueMap 等地图插件的兼容产物。它不是完整 Java 客户端包，禁止作为 Rainbow 或 Geyser 转换输入；当前 `generated/` 中确实存在此文件。 |
| `protection.unprotected-copy.enable: true`，路径为 `./generated/resource_pack_unprotected.zip` | 配置要求生成同一批次的标准 ZIP，优先作为 Rainbow 的输入。本文编写时实际 `generated/` 目录只见主包和 map 包，未见此副本；它必须被视为阻断前置条件，先重新生成 CE 包并核对文件，再开始转换。 |
| `merge-external-folders` | ModelEngine、EliteMobs 等目录被并入最终包，不能因它们不在 `resources/` 下就排除。 |
| `merge-external-zip-files` | CustomNameplates、BetterModel、D&T、真结局、Sparkles、Stellarity、魅力系统等 ZIP 已是最终视觉输入的一部分。 |
| `client-bound-model: true` | CE 会把客户端模型数据下发到物品栈，Rainbow 应从真实获得的物品读取，而不是仅猜 YAML。 |
| `always-use-item-model: true` 与 `always-use-custom-model-data: true` | 同一物品可能同时具备现代 `minecraft:item_model` 和兼容用 CMD；首选 v2 的 `item_model` 映射，同时保留 legacy 覆盖的审计能力。 |
| `always-generate-model-overrides: true` | 会生成兼容性模型覆盖；这有利于旧式 CMD 识别，但不是“所有模型都可自动转换”的保证。 |
| `block.serverside-blocks: 2000` | CE 方块可能是服务器端真实方块，不能假定它们都是音符盒或其他原版状态覆盖。必须从实际世界和 Geyser/Rainbow 报告确认映射路线。 |

`generate-mod-assets: true` 只说明 CE 还生成供 Java Fabric 客户端工具使用的资源，不会生成任何 Bedrock 资产。CE 的混淆、图集和保护选项也不会自动变成 Bedrock 兼容格式。

## 选择路线

先按最终效果选择路线，再开始转换。不要用“这是一个数据包”或“这是 CE 物品”替代技术分类。

| Java 侧最终效果 | 首选路线 | 自动化边界 | 必须验收 |
| --- | --- | --- | --- |
| 2D 自定义物品 | Rainbow 物品映射 + `item_texture.json` | 通常可自动生成 | 背包、手持、掉落物、容器、配方书 |
| 单纹理 3D 物品 | Rainbow 3D 物品/attachable | 支持简单 Java 模型和部分 display transform | GUI 图标、第一/三人称、头部槽、掉落物 |
| 物品状态切换 | Rainbow 生成 v2 predicate/group | 仅限支持的 broken、damaged、CMD、rod cast、范围/选择条件 | 损坏、蓄力、抛竿、数量和维度切换 |
| 简单盔甲/鞘翅 | Rainbow 读取 `equippable`/装备资源 | 鞘翅仅保证视觉，复杂装备分支需人工检查 | 四个槽位、飞行、第三人称、死亡/重登 |
| 覆盖原版状态的自定义方块 | Rainbow block mapping | 自动扫描可能漏项；可手工标记世界坐标 | 放置、破坏、碰撞、光照、朝向、含水状态 |
| CE 服务器端真实方块 | 先做实测识别，再决定 Geyser 自定义方块 JSON/API | 不承诺 Rainbow 可以覆盖所有注册方式 | 世界同步、交互、区块重载、状态变化 |
| 自定义头颅 | Rainbow `custom-skulls.yml` + Geyser 生成包 | 可导出，但合并不能覆盖已有头颅 | 背包、穿戴、展示框、放置 |
| 自定义声音 | Rainbow sound mapping + Bedrock sound 资源 | 支持资产采集，不保证所有触发语义 | 玩家动作、方块、实体、距离和音量 |
| Java 字体图标、菜单 UI | 单独设计 Bedrock UI/图标回退 | Rainbow 没有承诺通用 Java 字体/UI 转换 | 菜单可读性、点击坐标、文字回退 |
| 原版生物全局换肤 | 手工编写对应 Bedrock 实体资源 | Java 与 Bedrock 实体格式不同 | 所有同类实体是否被错误替换 |
| 条件化自定义生物/CEM/复杂动画 | Geyser Entity API 扩展 + Bedrock 实体包 | API 为实验性；无 JSON 通用映射 | 生成、状态切换、动画、卸载/重载、性能 |
| `item_display`/`block_display` 组合 | 单独评估 GeyserDisplayEntity 或自建扩展 | 官方 Geyser 不原生支持 Display Entity | 可见性、旋转、缩放、跨区块、交互 |

若一个效果横跨多行，例如“数据包 Boss = 实体模型 + 掉落物 + 自定义音乐 + 展示台”，必须拆成多个可验收对象。不要将“Boss 能生成”写成“基岩版兼容”。

## 工作流目录

按以下顺序执行；每页都可以独立交给另一个 AI，但输入、输出和验收记录必须共享同一发布编号。

1. [转换与发布](/developer/workflows/geyser/conversion)：冻结最终 Java 输入、用 Rainbow 采集、审计产物并部署到 Geyser。
2. [CraftEngine 与合并资源包](/developer/workflows/geyser/craftengine)：把 CE YAML、双模型数据、外部合并包和物品收集方法接到转换流水线。
3. [复杂数据包实体与展示](/developer/workflows/geyser/entities)：处理生物模型、Display Entity、ModelEngine/BetterModel 类内容和 Geyser 扩展边界。
4. [验收与排错](/developer/workflows/geyser/validation)：静态审计、Geyser 启动、Bedrock 客户端测试、回滚和故障定位。
5. [协议与产物参考](/developer/workflows/geyser/reference)：查阅 Custom Content、Rainbow、item/block/skull/entity mapping 与 Bedrock pack 的字段边界。

## 发布物契约

每个发布批次必须有一个不可变的目录，且至少包含以下项目：

```text
geyser-bridge/releases/<release-id>/
├── input/
│   ├── resource_pack_unprotected.zip
│   ├── source.sha256
│   └── source-manifest.yml
├── rainbow/
│   └── report.txt
├── custom_mappings/
│   └── <owned-mapping>.json
├── packs/
│   └── miragedge-bedrock-<release-id>.zip
├── locales/
│   └── overrides/
├── custom-skulls.patch.yml
├── merged/
│   └── custom-skulls.yml
├── coverage.yml
└── release.json
```

`custom-skulls.patch.yml` 只保存 Rainbow 本次新增/更新的差异，不能直接复制到 Geyser。`merged/custom-skulls.yml` 才是按四个 section 与服务器现有清单幂等合并后的活动文件。`release.json` 最少记录：CE 生成时间、Java 输入 SHA-256、Geyser build、Rainbow build、Java 测试客户端版本、目标 Bedrock 版本、映射文件名、Bedrock pack SHA-256、已知未覆盖项和实机验收人/时间。不要只保留一个名为 `latest.zip` 的文件；那样既无法回滚，也无法解释某一项为什么消失。

## AI 执行契约

任何 AI 接到“让这个 CE/数据包内容支持基岩版”的任务时，必须遵守以下规则。

1. 先读取 `F:\FCelestial\CraftEngine\config.yml` 的资源包、合并、保护和 item 段，再查看本次实际生成的 ZIP、日志与资源路径。
2. 把 CE 自建资源、外部合并包和数据包伴随包统一看作 Java 最终输入的一部分；不得只扫描 `resources/`。
3. 建立内容清单。每个条目至少记录 Java 基础物品、实际 `item_model`/CMD、Java 可见场景、Bedrock identifier、映射状态、异常与验收状态。
4. 通过 Java 测试客户端实际加载最终 Java 包，再让 Rainbow 从真实物品、容器、配方和世界方块采集；不要凭文件名伪造映射。
5. 检查 `report.txt`，将未转换、警告、重复 ID、未知模型和实体问题写入覆盖清单。没有覆盖项不等于转换完整。
6. 只向 Geyser 部署本项目拥有的映射文件、资源包和语言覆盖。`custom-skulls.yml` 必须做结构化合并，禁止整体覆盖。
7. `gameplay.enable-custom-content` 必须为 `true`，并通过重启后的 Geyser 日志确认映射注册。该开关变化需要重启才能生效。
8. 最终结论必须分成“静态通过”“Geyser 启动通过”“Bedrock 实机通过”“尚未覆盖/不支持”四类。没有基岩真机测试时，不得宣称兼容完成。

## 明确禁止

- 将 Java `resource_pack.zip`、数据包 ZIP 或 CE pack 目录直接改名成 `.mcpack` 后投放给 Bedrock 客户端。
- 使用 Bedrock 行为包来补 Java 服务端数据包逻辑；Geyser 的资源包投放不支持该路线。
- 仅用物品名称、Lore、PDC 或配置文件名区分映射。Geyser v2 映射的核心是基础 Java 物品加 `item_model`，或 legacy CMD；这些展示数据不是可靠的通用匹配条件。
- 假定 CE 的 `texture:` 路径就是发给客户端的 `minecraft:item_model` 值。必须从真实物品或 Rainbow 输出确认。
- 把生成的 `custom_mappings` 整个目录无差别覆盖到 Geyser，或把 Rainbow 导出的 `custom-skulls.yml` 覆盖已有服务器清单。
- 依赖 `packs/` 中多个历史 ZIP 的不透明加载顺序。每个项目应只有一个受控的活动 Bedrock 合并包。
- 把 GeyserDisplayEntity 当作所有复杂实体的通用解法。它是社区扩展，解决的是特定 Display Entity 场景。
- 因为 Java 客户端显示正常就跳过 Bedrock 测试。Java 和 Bedrock 的模型、动画、GUI、实体与缓存路径是两条不同链路。

## 参考来源

- [Geyser：Custom Content](https://geysermc.org/wiki/geyser/custom-content)
- [Geyser：Custom Items v2](https://geysermc.org/wiki/geyser/custom-items)
- [Geyser：Custom Blocks](https://geysermc.org/wiki/geyser/custom-blocks)
- [Geyser：Using Resource Packs](https://geysermc.org/wiki/geyser/packs)
- [Geyser：Entity API](https://geysermc.org/wiki/geyser/custom-entities)
- [Geyser：Rainbow](https://geysermc.org/wiki/other/rainbow/)
- [GeyserMC/Rainbow](https://github.com/GeyserMC/Rainbow)
- [GeyserExtensionists/GeyserDisplayEntity](https://github.com/GeyserExtensionists/GeyserDisplayEntity)
- [Kas-tle/java2bedrock.sh](https://github.com/Kas-tle/java2bedrock.sh)：仅作历史背景，已不应作为当前主流程。
