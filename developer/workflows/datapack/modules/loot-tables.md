---
title: 数据包工作流 · 战利品表
description: 战利品表的写法与绑定。涵盖 pools 与 entries 的 JSON 结构层次、方块与生物掉落示例、CraftEngine 物品的入口类型、两种绑定方式的取舍，以及 /loot 校验命令。
outline: [2, 3]
---

# 数据包工作流 · 战利品表

战利品表定义什么条件下掉落什么，可绑定到方块、生物、容器、钓鱼和礼物五种来源。

## 结构层次

```text
Loot Table
  └── Pool (1+)
       ├── rolls: 掷取次数
       ├── conditions: 池生效条件
       ├── entries: 物品条目
       │    ├── type: item / alternatives / sequence / group / tag / loot_table / empty
       │    ├── name: 物品 ID
       │    ├── weight: 权重
       │    ├── functions: 物品级别的后处理
       │    └── conditions: 条目生效条件
       └── functions: 池级别的后处理
```

## CE 物品的入口类型

在战利品表中引用 CraftEngine 自定义物品时，入口类型必须改为 `craftengine:item`。

```json
{
  "type": "craftengine:item",
  "name": "miragedge:ruby"
}
```

原版的 `minecraft:item` 入口无法识别 CE 自定义 ID。这是与标准原版战利品表的关键区别。

## 编写

### 1. 方块掉落战利品表

```json
// data/miragedge/loot_table/blocks/ruby_ore.json
// 绑定到 CE 自定义方块 miragedge:ruby_ore 的破坏掉落
{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "bonus_rolls": 0,
      "entries": [
        {
          "type": "alternatives",
          "children": [
            {
              "type": "craftengine:item",
              "name": "miragedge:ruby_ore",
              "conditions": [
                {
                  "condition": "minecraft:match_tool",
                  "predicate": {
                    "predicates": {
                      "minecraft:enchantments": [
                        {
                          "enchantments": "minecraft:silk_touch",
                          "levels": { "min": 1 }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            {
              "type": "craftengine:item",
              "name": "miragedge:ruby",
              "functions": [
                {
                  "function": "minecraft:apply_bonus",
                  "enchantment": "minecraft:fortune",
                  "formula": "minecraft:ore_drops"
                },
                {
                  "function": "minecraft:explosion_decay"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:experience_bottle",
          "weight": 1
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:survives_explosion"
        }
      ]
    }
  ]
}
```

### 2. 生物掉落战利品表

```json
// data/miragedge/loot_table/entities/ruby_golem.json
// 自定义生物 miragedge:ruby_golem 的死亡掉落
{
  "type": "minecraft:entity",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "craftengine:item",
          "name": "miragedge:ruby_shard",
          "weight": 1,
          "functions": [
            {
              "function": "minecraft:set_count",
              "count": { "type": "minecraft:uniform", "min": 2, "max": 5 }
            },
            {
              "function": "minecraft:looting_enchant",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 2 }
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:iron_ingot",
          "weight": 3
        },
        {
          "type": "craftengine:item",
          "name": "miragedge:ruby_core",
          "weight": 1
        }
      ]
    }
  ]
}
```

### 3. CE YAML 方式绑定

在 CraftEngine 的方块配置 YAML 中绑定战利品表：

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/blocks.yml
blocks:
  miragedge:ruby_ore:
    settings:
      hardness: 5.0
      blast_resistance: 6.0
      requires_tool: true
    loot:
      pools:
        - rolls: 1
          entries:
            - type: alternatives
              children:
                - type: item
                  item: "miragedge:ruby_ore"
                  conditions:
                    - type: match_tool
                      predicate:
                        enchantments:
                          - enchantment: minecraft:silk_touch>=1
                - type: item
                  item: "miragedge:ruby"
                  functions:
                    - type: apply_bonus
                      enchantment: minecraft:fortune
                      formula: ore_drops
                    - type: explosion_decay
    states:
      default:
        model:
          path: "minecraft:block/emerald_ore"
```

### 两种绑定方式怎么选

| 绑定方式 | 位置 | 适用场景 | 生效命令 |
| --- | --- | --- | --- |
| JSON 数据包 | `loot_table/` | 原版方块、标准生物掉落覆盖 | `/reload` |
| CE YAML | 方块定义的 `loot:` 段 | CE 自定义方块 | `/ce reload` |

## 校验

```bash
/reload

# 模拟战利品表给予物品
/loot give @s loot miragedge:blocks/ruby_ore

# 放置方块并手动破坏
/setblock ~ ~ ~ miragedge:ruby_ore

# 测试生物掉落
/summon zombie ~ ~ ~ {DeathLootTable:"miragedge:entities/ruby_golem"}
/kill @e[type=zombie,limit=1,sort=nearest]
```

## 部署

1. 把 JSON 战利品表放入 `data/miragedge/loot_table/` 下对应子目录。
2. 使用 CE YAML 方式时，配置方块定义中的 `loot:` 段。
3. 执行 `/reload`，YAML 方式执行 `/ce reload`。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 进游戏后掉落为空 | 文件不在 `loot_table/` 对应子目录 | 核对 `blocks/` 与 `entities/` 两级路径 |
| CE 物品不产出 | 入口类型写成了 `minecraft:item` | 改为 `craftengine:item` |
| 日志出现 `Unreachable entry!` | `alternatives` 的子条目全部带 `weight` | 改用 `minecraft:group` |
| 掉落无变化 | 改动未覆盖高优先级包的同名文件 | 用 `/datapack list` 确认加载顺序 |
