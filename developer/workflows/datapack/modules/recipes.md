---
title: 数据包工作流 · 配方
description: 配方系统的选择与写法。对比原版 JSON 配方与 CraftEngine YAML 配方的适用场景，给出有序、无序、烧炼、附魔结果四类示例，含重载命令与校验方式。
outline: [2, 3]
---

# 数据包工作流 · 配方

Minecraft 有两套配方系统：

1. 原版 JSON 配方。
2. CraftEngine YAML 配方。

选错会直接导致配方无效。

## 两套系统的分工

| 系统 | 位置 | 适用场景 |
| --- | --- | --- |
| 原版 JSON 配方 | `data/<namespace>/recipe/` | 纯原版物品，支持 `minecraft:crafting_shaped`、`minecraft:crafting_shapeless`、`minecraft:smelting` 等类型 |
| CraftEngine YAML 配方 | `resources/<pack>/configuration/` | 原料或产物含 CE 自定义物品，或需要复杂条件 |

## 选型表

| 场景 | 方案 | 原因 |
| --- | --- | --- |
| 纯原版物品合成 | 原版 JSON | 无需插件依赖 |
| 原料或产物含 CE 物品 | CE YAML | 原版无法识别 CE 物品 ID |
| 需要复杂条件或权限控制 | CE YAML | CE 支持 condition 系统 |
| 需要合成后附魔或写入数据 | CE YAML | CE 支持 result post-processor |
| 需要与原版标签联动 | CE YAML | CE 物品可添加原版标签 |
| Stonecutter 配方 | CE YAML，慎用 | CE 自定义物品做原料可能引起客户端视觉问题 |

## 编写

### 1. 原版 JSON 配方

```json
// data/miragedge/recipe/ruby_block_from_rubies.json
{
  "type": "minecraft:crafting_shaped",
  "category": "building",
  "pattern": [
    "RRR",
    "RRR",
    "RRR"
  ],
  "key": {
    "R": {
      "item": "minecraft:emerald"
    }
  },
  "result": {
    "id": "minecraft:diamond_block",
    "count": 1
  }
}
```

带组件结果的配方：

```json
// data/miragedge/recipe/ruby_sword.json
{
  "type": "minecraft:crafting_shaped",
  "category": "equipment",
  "pattern": [
    " R ",
    " R ",
    " S "
  ],
  "key": {
    "R": {
      "item": "minecraft:emerald"
    },
    "S": {
      "item": "minecraft:stick"
    }
  },
  "result": {
    "id": "minecraft:iron_sword",
    "count": 1,
    "components": {
      "minecraft:custom_name": "{\"text\":\"红宝石剑\",\"color\":\"red\",\"italic\":false}",
      "minecraft:enchantments": {
        "levels": {
          "minecraft:sharpness": 2
        }
      }
    }
  }
}
```

### 2. CraftEngine YAML 配方

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/recipes.yml
recipes:
  # 有序合成：CE 物品作为原料和产物
  miragedge:flame_sword_recipe:
    type: shaped
    category: equipment
    group: miragedge_weapons
    pattern:
      - " R "
      - " R "
      - " S "
    ingredients:
      R: "miragedge:flame_ruby"
      S: "minecraft:stick"
    result:
      id: miragedge:flame_sword
      count: 1

  # 无序合成
  miragedge:ruby_block:
    type: shapeless
    category: building
    group: miragedge_blocks
    ingredients:
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
    result:
      id: miragedge:ruby_block
      count: 1

  # 烧炼配方，200 ticks 等于 10 秒
  miragedge:ruby_smelt:
    type: smelting
    category: misc
    ingredient: "miragedge:ruby_ore"
    time: 200
    experience: 1.0
    result:
      id: miragedge:ruby
      count: 1

  # 带后处理器的配方
  miragedge:enchanted_ruby_sword:
    type: shaped
    category: equipment
    pattern:
      - " R "
      - " R "
      - " S "
    ingredients:
      R: "miragedge:enchanted_ruby"
      S: "minecraft:stick"
    result:
      id: miragedge:ruby_sword
      count: 1
      post-processors:
        - type: apply_data
          data:
            enchantment:
              minecraft:sharpness: 5
              minecraft:fire_aspect: 2
            lore:
              - "<!i><gray>传说中红龙之息淬炼而成"
              - "<!i><red>锋利 V 火焰附加 II"
```

## 校验

```bash
# 重载 CE 配方
/ce reload recipe

# 取原料
/ce item get miragedge:flame_ruby 64
/give @s minecraft:stick 64

# 取烧炼原料
/give @s miragedge:ruby_ore 64
```

1. 打开工作台，确认配方出现在配方书中。
2. 手动摆放物品，确认合成结果。
3. 把矿石放入熔炉，确认烧炼产出。
4. 检查控制台日志中 CE 配方注册是否报错。

## 部署

1. 原版 JSON 配方放入 `data/miragedge/recipe/`，执行 `/reload`。
2. CE YAML 配方放入 `resources/<pack>/configuration/`，执行 `/ce reload recipe`。
3. 两套系统并用时，涉及自定义物品的配方一律用 CE 管理。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 配方不在配方书中 | 原版配方引用了 CE 物品 ID | 改用 CE YAML 配方 |
| CE 配方不生效 | 文件不在 `configuration/` 目录 | 核对 pack 目录与 `/ce reload recipe` |
| 合成后附魔丢失 | 用了原版 JSON 配方承载附魔结果 | 改用 CE 的 `post-processors` |
| 重载后配方引用失效 | 只重载了 CE 未重载数据包 | 同时执行 `/reload` |
| Folia 上重载崩溃 | 配方管理器非线程安全 | 只使用 `/ce reload recipe`，不使用 `/ce reload all` |
