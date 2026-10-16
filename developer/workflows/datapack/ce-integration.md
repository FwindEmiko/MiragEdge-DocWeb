---
title: 数据包与 CraftEngine 集成
description: 数据包与 CraftEngine 的职责边界与对接规则。涵盖物品 ID 的六种引用场景、方块注册与战利品表绑定、worldgen 中的 provider 类型，以及 CE 命令速查。
outline: [2, 3]
---

# 数据包与 CraftEngine 集成

这页划定两套系统的边界，并给出跨系统引用物品 ID 的写法。它们通过物品 ID 对接。

## 职责边界

```text
CraftEngine 负责：
  items/     物品配置
  blocks/    方块配置
  recipes/   配方配置

数据包负责：
  function / loot_table / tag / structure / advancement
```

CE 管物品、数据组件、材质和方块注册。数据包管逻辑、掉落、结构和进度。两者通过物品 ID 对接。

CE 物品、方块和资源包的完整结构见 [CE 开发工作流](../craftengine/)。当数据包伴随资源包需要交付给基岩版玩家时，继续执行 [Geyser 基岩版内容转换工作流](../geyser/)。

## 物品 ID 引用规则

| 场景 | 引用方式 | 示例 |
| --- | --- | --- |
| CE YAML 内部引用 | `namespace:id` | `miragedge:ruby_sword` |
| 数据包 loot_table | `craftengine:item` 入口加 `name` | `{"type":"craftengine:item","name":"miragedge:ruby"}` |
| mcfunction 命令 | `/ce item get namespace:id` | `/ce item get miragedge:ruby 64` |
| 原版 JSON recipe | 不支持 | 原版无法识别 CE 物品 ID，改用 CE YAML 配方 |
| CE YAML recipe | `namespace:id` | `id: miragedge:ruby_sword` |
| 外部插件引用 | `插件名小写:物品名小写` | `mythicmobs:kingscrown` |

::: danger 原版配方不能引用 CE 物品
原版 `minecraft:item` 入口只识别 `minecraft:` 命名空间下的物品 ID。原料或产物含 CE 物品时，配方必须写在 CE 的 YAML 中。
:::

## 方块注册与战利品表绑定

CE 方块通过 YAML 注册为真实服务端方块，不是音符盒替代。这意味着：

- 方块有独立的硬度、爆炸抗性和亮度。
- 方块可被活塞推动、可含水、可传导红石信号，具体取决于配置。
- 方块可在 worldgen 中用 `craftengine:simple_state_provider` 引用。

```yaml
# plugins/CraftEngine/resources/<pack>/configuration/blocks.yml
blocks:
  miragedge:ruby_block:
    settings:
      hardness: 5.0
      blast_resistance: 10.0
      luminance: 3
    loot:
      pools:
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_block"
    states:
      default:
        model:
          path: "minecraft:block/emerald_block"
```

方块在世界生成中的引用方式见[结构页的世界生成说明](./modules/structures#6-在世界生成中引用-ce-方块)。

## CE 命令速查

```bash
# 获取 CE 物品
/ce item get <namespace:id> [amount] [player]

# 重载全部配置，会重新生成资源包
/ce reload

# 仅重载配方
/ce reload recipe

# 仅重载物品配置
/ce reload item

# 查看方块内部 ID
/ce block info <x> <y> <z>

# 查看 CE 版本
/ce version
```

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 战利品表不产出 CE 物品 | 入口类型写成了 `minecraft:item` | 改为 `craftengine:item` |
| 原版配方报未知物品 | 配方引用了 CE 物品 ID | 把配方迁到 CE 的 YAML 配置 |
| 结构中的 CE 方块变成空气 | CE 未重载或配置不一致 | 先 `/ce reload`，再核对跨环境 CE 配置 |
| worldgen 中 CE 方块不生成 | provider 类型写了 `minecraft:` | 改为 `craftengine:simple_state_provider` |
| `/ce item get` 报未知物品 | 物品 ID 的命名空间与 pack.yml 不符 | 核对目标 pack 的 `namespace` |
