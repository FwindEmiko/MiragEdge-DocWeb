---
title: 数据包工作流 · 生物掉落
description: 修改生物掉落与生成。涵盖覆盖原版生物战利品表、用谓词控制掉落条件、通过 DeathLootTable 绑定实体、CE 实体掉落配置，以及 /loot 与 /summon 校验方式。
outline: [2, 3]
---

# 数据包工作流 · 生物掉落

修改生物掉落有三种方式：

1. 覆盖战利品表。
2. 用谓词控制掉落条件。
3. 在 CE 实体配置中直接写掉落。

## 注入方式

| 方式 | 做法 | 特点 |
| --- | --- | --- |
| 直接覆盖 | 创建与生物 ID 同名的战利品表文件 | 完全替换原版掉落 |
| 实体数据绑定 | 召唤实体时指定 `DeathLootTable` | 只影响该实体，不改原版 |
| CE YAML | 在 CE 的实体配置中定义 `loot:` | 适用于 CE 自定义生物 |

## 编写

### 1. 覆盖原版生物战利品表

```json
// data/miragedge/loot_table/entities/zombie.json
// 完全覆盖原版僵尸的掉落表
{
  "type": "minecraft:entity",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:rotten_flesh",
          "weight": 1,
          "functions": [
            {
              "function": "minecraft:set_count",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 2 }
            },
            {
              "function": "minecraft:looting_enchant",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 1 }
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "craftengine:item",
          "name": "miragedge:corrupted_soul",
          "weight": 10
        },
        {
          "type": "minecraft:item",
          "name": "minecraft:iron_ingot",
          "weight": 1,
          "conditions": [
            {
              "condition": "minecraft:entity_properties",
              "entity": "killer",
              "predicate": {
                "type_specific": {
                  "type": "minecraft:player",
                  "advancements": {
                    "miragedge:defeated_wither": true
                  }
                }
              }
            }
          ]
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:killed_by_player"
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:zombie_head"
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:killed_by_player"
        },
        {
          "condition": "minecraft:random_chance_with_enchanted_bonus",
          "enchanted": "minecraft:looting",
          "unenchanted_chance": 0.025,
          "enchanted_chance": {
            "type": "minecraft:linear",
            "base": 0.03,
            "per_level_above_first": 0.01
          }
        }
      ]
    }
  ]
}
```

### 2. 用谓词控制掉落条件

把条件抽成独立的谓词文件，便于多处复用：

```json
// data/miragedge/predicate/entities/is_boss_killer.json
// 谓词：检查击杀者是否击败过凋灵
{
  "condition": "minecraft:entity_properties",
  "entity": "killer",
  "predicate": {
    "type_specific": {
      "type": "minecraft:player",
      "advancements": {
        "miragedge:defeated_wither": true
      }
    }
  }
}
```

### 3. CE YAML 方式定义生物掉落

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/entities.yml
entities:
  miragedge:ruby_golem:
    type: iron_golem
    health: 100
    damage: 12
    loot:
      pools:
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_shard"
              weight: 1
              functions:
                - type: set_count
                  count:
                    type: uniform
                    min: 2
                    max: 5
            - type: item
              item: "minecraft:poppy"
              weight: 5
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_core"
              weight: 1
          conditions:
            - type: killed_by_player
```

## 校验

```bash
/reload

# 生成测试生物并击杀
/summon zombie ~ ~ ~
/kill @e[type=zombie,limit=1,sort=nearest]

# 直接模拟战利品表
/loot give @s loot miragedge:entities/zombie

# 生成 CE 生物
/ce mob spawn miragedge:ruby_golem ~ ~ ~

# 检查谓词是否成立
/execute if predicate miragedge:entities/is_boss_killer run say Predicate passed!
```

## 部署

1. 覆盖型战利品表放入 `data/miragedge/loot_table/entities/<entity_id>.json`。
2. CE YAML 实体掉落配置放入 `resources/<pack>/configuration/entities.yml`。
3. 按改动类型执行 `/reload` 或 `/ce reload`。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 原版掉落被清空且无新掉落 | 覆盖文件缺少 `pools` 或 JSON 有语法错误 | 用 Spyglass 校验 JSON |
| CE 物品从不掉落 | 入口类型写成了 `minecraft:item` | 改为 `craftengine:item` |
| 谓词条件恒不成立 | 进度 ID 或玩家字段写错 | 执行 `/execute if predicate` 单独验证 |
| CE 生物无掉落 | 只改了 YAML 未重载 CE | 执行 `/ce reload` |
| 掉落数量与预期不符 | `set_count` 与 `looting_enchant` 叠加 | 用 `/loot give` 重复抽样观察区间 |
