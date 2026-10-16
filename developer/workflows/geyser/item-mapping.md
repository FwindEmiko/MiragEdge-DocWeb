---
title: 自定义物品映射
description: Geyser 自定义物品的 V2 映射格式。涵盖 definition、legacy、group 三种定义类型、bedrock_options 与 components 字段、谓词系统，以及六类物品无法兼得的硬限制。
outline: [2, 3]
---

# 自定义物品映射

映射文件把 Java 物品映射到基岩版物品。这页给出 V2 格式的字段与限制。

## 文件结构

映射文件放在 `custom_mappings/` 目录下。

```json
{
  "format_version": 2,
  "items": {
    "minecraft:JAVA_ITEM": [
      { "定义1" },
      { "定义2" }
    ]
  }
}
```

`items` 的键是 Java 基础物品，不是 CE 物品 ID。

## 三种定义类型

### definition：对应 1.21.4 以上的 item_model

```json
{
  "type": "definition",
  "model": "stellarity:dragonblade",
  "bedrock_identifier": "stellarity:dragonblade",
  "bedrock_options": {
    "icon": "stellarity.item_dragonblade",
    "display_handheld": true
  }
}
```

### legacy：对应旧版 custom_model_data

```json
{
  "type": "legacy",
  "custom_model_data": 1450104,
  "bedrock_identifier": "incendium:trailblazer",
  "bedrock_options": {
    "icon": "incendium.trailblazer",
    "display_handheld": true
  }
}
```

### group：多定义分组

```json
{
  "type": "group",
  "model": "example:my_item",
  "definitions": [
    {
      "bedrock_identifier": "example:my_item_nether",
      "predicate": {
        "type": "match",
        "property": "context_dimension",
        "value": "minecraft:the_nether"
      }
    },
    {
      "bedrock_identifier": "example:my_item"
    }
  ]
}
```

## 必填字段

| 字段 | 说明 |
| --- | --- |
| `bedrock_identifier` | 基岩版物品标识符，必填，不能使用 `minecraft:` 命名空间，不能与其他定义重复 |
| `model` | definition 类型必填，填 Java 的 item_model 标识符 |
| `custom_model_data` | legacy 类型必填，填旧版 CMD 数值 |

## bedrock_options 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | string | bedrock_identifier | 物品图标，对应 `item_texture.json` 的键名 |
| `display_handheld` | bool | false | 是否以工具或武器姿势手持 |
| `allow_offhand` | bool | true | 是否允许放副手 |
| `protection_value` | int | 0 | 护甲值显示，仅可装备物品有效 |
| `creative_category` | string | none | 创造模式分类 |
| `creative_group` | string | — | 创造模式组 |
| `tags` | array | — | 物品标签 |

## components 列表

| 组件 | 说明 |
| --- | --- |
| `minecraft:consumable` | 食用与饮用行为 |
| `minecraft:equippable` | 可装备，需指定 slot |
| `minecraft:food` | 食物属性 |
| `minecraft:max_damage` | 最大耐久 |
| `minecraft:max_stack_size` | 最大堆叠 |
| `minecraft:use_cooldown` | 使用冷却 |
| `minecraft:enchantable` | 可附魔 |
| `minecraft:tool` | 工具属性 |
| `minecraft:repairable` | 可修复 |
| `minecraft:enchantment_glint_override` | 附魔光效覆盖 |
| `minecraft:attack_range` | 攻击范围 |
| `minecraft:kinetic_weapon` | 动能武器，弓 |
| `minecraft:piercing_weapon` | 穿透武器，弩 |
| `minecraft:swing_animation` | 挥动动画 |
| `minecraft:use_effects` | 使用效果 |

移除基础物品的默认组件时，在组件名前加 `!`：

```json
"components": {
  "!minecraft:food": {}
}
```

## 谓词系统

### condition 谓词

| 属性 | 说明 |
| --- | --- |
| `broken` | 物品是否损坏，仅剩 1 点耐久 |
| `damaged` | 物品是否受损 |
| `custom_model_data` | 检查 CMD flag 的指定 index |
| `has_component` | 是否拥有指定组件 |
| `fishing_rod_cast` | 钓竿是否抛出 |

```json
"predicate": {
  "type": "condition",
  "property": "broken"
}
```

### match 谓词

| 属性 | 说明 |
| --- | --- |
| `charge_type` | 弩装填的弹药类型，arrow 或 rocket |
| `trim_material` | 盔甲纹饰材料 |
| `context_dimension` | 当前维度 |
| `custom_model_data` | CMD 字符串 |

```json
"predicate": {
  "type": "match",
  "property": "context_dimension",
  "value": "minecraft:the_end"
}
```

### range_dispatch 谓词

| 属性 | 可标准化 | 说明 |
| --- | --- | --- |
| `bundle_fullness` | 否 | 收集袋充满度 |
| `damage` | 是 | 物品损伤值 |
| `count` | 是 | 物品数量 |
| `custom_model_data` | 否 | CMD 浮点值 |

```json
"predicate": {
  "type": "range_dispatch",
  "property": "count",
  "threshold": 32
}
```

### 策略与优先级

- `predicate_strategy` 取 `and` 时全部谓词都需满足，这是默认值。
- 取 `or` 时任一谓词满足即可。
- `priority` 数值越高优先级越高，排在前面的定义先检查。

## 完整示例

### 武器

```json
{
  "type": "definition",
  "model": "stellarity:dragonblade",
  "bedrock_identifier": "stellarity:dragonblade",
  "bedrock_options": {
    "icon": "stellarity.item_dragonblade",
    "display_handheld": true
  }
}
```

### 盔甲

```json
{
  "type": "definition",
  "model": "stellarity:champion_chestplate",
  "bedrock_identifier": "stellarity:champion_chestplate",
  "bedrock_options": {
    "icon": "stellarity.item_champion_chestplate",
    "protection_value": 8
  },
  "components": {
    "minecraft:equippable": {
      "slot": "chest",
      "asset_id": "stellarity:champion"
    },
    "minecraft:max_stack_size": 1
  }
}
```

### 食物

```json
{
  "type": "definition",
  "model": "geyser_mc:yummy_food",
  "bedrock_identifier": "geyser_mc:yummy_food",
  "components": {
    "minecraft:consumable": {},
    "minecraft:food": {
      "nutrition": 5,
      "saturation": 0.0
    },
    "minecraft:max_stack_size": 16
  }
}
```

## 硬限制：六类物品不可兼得

::: danger 实测定论 2026-08-07
基岩版的行为动画全部硬编码在原版物品 ID 上。自定义 `bedrock_identifier` 会创建全新物品类型，所有原版行为动画全部丢失。
:::

Geyser 源码 `CustomItemRegistryPopulator.java`（约 2037-2135 行）会根据 vanilla mapping 的 `bedrock_identifier` 自动注入 `chargeable` 与 `throwable` 组件到物品 NBT：

```java
// 源码逻辑（简化）
case "minecraft:bow" -> GeyserChargeable.builder()
    .maxDrawDuration(1.0F)
    .ammunition(Identifier.of("arrow"))
    .build();
case "minecraft:crossbow" -> GeyserChargeable.builder()
    .chargeOnDraw(true)
    .ammunition(Identifier.of("arrow"))
    .build();
// 三叉戟自动获得 SPEAR 动画
if (mapping.getBedrockIdentifier().equals("minecraft:trident")) {
    return Optional.of(new Consumable(
        DEFAULT_ITEM_USE_DURATION,
        Consumable.ItemUseAnimation.TRIDENT,
        null, false, List.of()
    ));
}
```

基岩客户端不认这些注入，因为行为动画是客户端硬编码的，不受服务端 NBT 控制。

基岩版动画映射值：

```text
NONE=0, EAT=1, DRINK=2, BLOCK=3, BOW=4, SPEAR=6, CROSSBOW=9, SPYGLASS=10, BRUSH=12
```

实测结果：

| 物品 | 原版行为 | 自定义 bedrock_identifier 的后果 | 能否兼得自定义纹理与原版行为 |
| --- | --- | --- | --- |
| `minecraft:bow` | 拉弓动画，3 段 | 能射但无拉弓动画 | 否 |
| `minecraft:crossbow` | 蓄力动画 | 无法射出 | 否 |
| `minecraft:trident` | 投掷动画 | 无投掷动画 | 否 |
| `minecraft:fishing_rod` | 抛竿动画 | 手持角度歪斜 | 否 |
| `minecraft:elytra` | 飞行功能 | 无法飞行 | 否 |
| `minecraft:shield` | 格挡动画 | 无法格挡 | 否 |

`bedrock_identifier` 在 V2 格式中是必填字段。省略它只设 `icon` 会导致：

```text
InvalidCustomMappingsFileException: While reading key "bedrock_identifier"
in single item definition: key is required but was not present
```

两个选择分别是：有 `bedrock_identifier` 就创建新物品类型并丢失原版行为；无 `bedrock_identifier` 则 Geyser 拒绝加载。

::: tip 结论
以下 6 类物品在基岩版无法同时拥有自定义纹理与原版行为动画：弓、弩、三叉戟、钓竿、鞘翅、盾。唯一解是删除这 6 类物品的全部映射条目，走纯原版。功能正常但无自定义纹理。
:::

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| Geyser 拒绝加载映射 | 缺少 `bedrock_identifier` | 为每个定义补齐该字段 |
| 日志报 `namespace cannot be minecraft` | `bedrock_identifier` 用了 `minecraft:` 前缀 | 换成自定义命名空间 |
| 物品只显示原版图标 | Java 基础物品或 `model` 值写错 | 从真实物品栈核对 |
| 弓无法拉弓 | 该物品有自定义 `bedrock_identifier` | 删除弓的映射条目 |
| 带条件的定义不生效 | 谓词相同或缺少 fallback | 保留一个无谓词的兜底定义 |
