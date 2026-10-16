---
title: 数据包工作流 · CE 物品
description: 用 CraftEngine YAML 定义自定义物品与装备。涵盖物品配置的字段层次、基础材料、装备与食物写法、数据组件速查表、资源包目录对应关系，以及 /ce item get 校验。
outline: [2, 3]
---

# 数据包工作流 · CE 物品

自定义物品由 CraftEngine 通过 YAML 定义，并自动生成对应资源包。这是数据包与资源视觉的衔接点。

## 配置字段层次

```text
物品 ID (miragedge:ruby_sword)
  ├── material: 基础材质，决定底层行为
  ├── data: 数据组件，跨版本兼容
  │    ├── item-name: 物品名称
  │    ├── lore: 物品描述
  │    ├── enchantment: 附魔
  │    ├── attribute_modifiers: 属性修改
  │    ├── unbreakable: 不可损坏
  │    ├── max-damage: 最大耐久
  │    └── dyed-color: 染色
  ├── settings: 物品设置
  │    ├── fuel-time: 燃料时间
  │    ├── food: 食物属性
  │    └── equipment: 装备槽位
  ├── model: 模型定义，关联资源包贴图
  └── tags: 添加原版标签
```

## 编写

### 1. 基础物品

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/ruby_items.yml
items:
  miragedge:ruby:
    material: emerald
    data:
      item-name: "<!i><red>红宝石"
      lore:
        - "<!i><gray>一颗闪耀着红光的宝石"
        - "<!i><dark_gray>稀有材料"
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/ruby"

  miragedge:enchanted_ruby:
    material: emerald
    data:
      item-name: "<!i><light_purple>附魔红宝石"
      enchantment:
        minecraft:sharpness: 1
      hide-tooltip:
        - enchantments
      custom-model-data: 1001
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/enchanted_ruby"
```

### 2. 装备与食物

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/equipment.yml
items:
  # 红宝石剑
  miragedge:ruby_sword:
    material: iron_sword
    data:
      item-name: "<!i><red>红宝石剑"
      lore:
        - "<!i><gray>镶嵌红宝石的利剑"
        - "<!i><gold>+7 攻击伤害"
        - ""
        - "<!i><dark_gray>稀有武器"
      enchantment:
        minecraft:sharpness: 3
      attribute_modifiers:
        - type: attack_damage
          amount: 7
          operation: add_value
          slot: mainhand
        - type: attack_speed
          amount: -2.4
          operation: add_value
          slot: mainhand
      max-damage: 1561
      rarity: rare
    settings:
      tags:
        - "minecraft:swords"
        - "minecraft:enchantable/weapon"
    model:
      template: "default:model/handheld"
      arguments:
        path: "minecraft:item/custom/ruby_sword"

  # 红宝石头盔
  miragedge:ruby_helmet:
    material: iron_helmet
    data:
      item-name: "<!i><red>红宝石头盔"
      attribute_modifiers:
        - type: armor
          amount: 3
          operation: add_value
          slot: head
        - type: armor_toughness
          amount: 2
          operation: add_value
          slot: head
      max-damage: 275
      rarity: rare
    settings:
      equipment:
        slot: head
      tags:
        - "minecraft:head_armor"
        - "minecraft:enchantable/armor"
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/ruby_helmet"

  # 食物
  miragedge:magic_apple:
    material: golden_apple
    data:
      item-name: "<!i><gold>魔法苹果"
      lore:
        - "<!i><gray>散发着神秘的力量"
    settings:
      food:
        nutrition: 4
        saturation: 9.6
        can-always-eat: true
        effects:
          - type: minecraft:regeneration
            duration: 100
            amplifier: 1
            probability: 1.0
          - type: minecraft:absorption
            duration: 2400
            amplifier: 1
            probability: 1.0
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/magic_apple"
```

### 3. 数据组件速查

| YAML 键 | 用途 | 示例值 |
| --- | --- | --- |
| `item-name` | 物品默认名称 | `"<!i><red>物品名"` |
| `custom-name` | 自定义名称，类似铁砧改名 | `"<!i><blue>名称"` |
| `lore` | 物品描述列表 | `["<gray>描述行1", "<gray>描述行2"]` |
| `enchantment` | 附魔 | `minecraft:sharpness: 5` |
| `attribute_modifiers` | 属性修改 | 见上方装备示例 |
| `unbreakable` | 不可损坏 | `true` |
| `max-damage` | 最大耐久值 | `1561` |
| `hide-tooltip` | 隐藏提示 | `[enchantments, attributes]` |
| `dyed-color` | 皮革染色 | `"255,100,50"` |
| `custom-model-data` | CMD 值，用于材质映射 | `1001` |
| `rarity` | 稀有度颜色 | `uncommon`、`rare`、`epic` |
| `fire-resistant` | 防火物品 | `true` |
| `max-stack-size` | 最大堆叠数 | `16` |

### 4. 资源包目录对应

CraftEngine 生成资源包时需要以下目录结构：

```text
plugins/CraftEngine/resources/miragedge/resourcepack/assets/
└── minecraft/
    ├── models/item/custom/
    │   ├── ruby.json
    │   ├── ruby_sword.json
    │   └── ruby_helmet.json
    └── textures/item/custom/
        ├── ruby.png
        ├── ruby_sword.png
        └── ruby_helmet.png
```

CE 模板 `default:model/simplified_generated` 会自动生成标准 `minecraft:item/generated` 模型，指向 `textures/item/custom/<filename>.png`。

## 校验

```bash
# 重载 CE 配置，会重新生成资源包
/ce reload

# 取物品
/ce item get miragedge:ruby_sword
/ce item get miragedge:ruby_helmet
/ce item get miragedge:magic_apple 16

# 检查物品组件
/data get entity @s SelectedItem
```

1. 手持物品，确认名称、Lore、附魔显示正确。
2. 穿戴装备，按 `F3+H` 查看耐久度。
3. 食用食物，确认效果触发。

## 部署

1. YAML 配置放入 `resources/<pack>/configuration/`。
2. 贴图 PNG 放入 `resources/<pack>/resourcepack/assets/minecraft/textures/item/custom/`。
3. 执行 `/ce reload`，CE 会重新生成资源包并分发。
4. 客户端重新加入服务器以更新资源包。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 物品显示为原版材质 | 贴图路径与模型 `arguments.path` 不一致 | 逐级核对 `assets/minecraft` 下的模型与纹理路径 |
| 属性修改不生效 | 缺少 `settings.tags` 中的可附魔或武器标签 | 补齐 `minecraft:enchantable/*` 标签 |
| 装备穿戴后错位 | 只配置了物品栏纹理 | 另配 `equipments` 资产，见 [CE 盔甲工作流](../../craftengine/armor) |
| 自定义食物食用时有紫黑碎屑 | `data` 中残留 `max-damage: 1` | 改用 `minecraft:max_stack_size: 1` |
| 参数未替换 | 模板 `arguments` 缺键 | 核对模板声明的全部 `${}` 参数 |
