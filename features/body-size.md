---
title: 巨像胸甲与灵影护腿
description: 自定义趣味盔甲——巨像胸甲（变大减速）和灵影护腿（缩小加速）的获取与效果说明
---

# 巨像胸甲与灵影护腿

两款趣味盔甲，分别改变玩家体型与移动速度。穿上胸甲变大变慢，穿上护腿变小变快。

## 获取方式

两款盔甲均通过**工作台**有序合成获得。

### 巨像胸甲

<CraftingTable
  shaped
  size="md"
  :grid="[
    [{name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}, {name:'重型矿镐', texture:'/mc-textures/item/hefty_pickaxe.png'}, {name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}],
    [{name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}, {name:'下界合金胸甲', texture:'/mc-textures/item/netherite_chestplate.png'}, {name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}],
    [{name:'下界合金锭', texture:'/mc-textures/item/netherite_ingot.png'}, {name:'死灵盾牌', texture:'/mc-textures/item/necrotic_shield.png'}, {name:'下界合金锭', texture:'/mc-textures/item/netherite_ingot.png'}]
  ]"
  :result="{name:'巨像胸甲', texture:'/mc-textures/item/giant_chestplate.png'}"
/>

**材料**：
- 烈焰棒 ×4 — 下界基础材料
- **重型矿镐** ×1 — 烬域·废弃实验室
- **下界合金胸甲** ×1 — 原版
- **死灵盾牌** ×1 — 烬域·圣所 / 禁忌城堡
- **下界合金锭** ×2 — 原版

**材质**：下界合金甲（穿上显示下界合金护甲纹理）

**效果**：穿上后体型放大至 200%，移动速度降低 30%。

### 灵影护腿

<CraftingTable
  shaped
  size="md"
  :grid="[
    [{name:'紫颂覆板', texture:'/mc-textures/item/chorus_plating.png'}, {name:'幻翼膜', texture:'/mc-textures/item/phantom_membrane.png'}, {name:'紫颂覆板', texture:'/mc-textures/item/chorus_plating.png'}],
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'下界合金护腿', texture:'/mc-textures/item/netherite_leggings.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}],
    [{name:'末影珍珠', texture:'/mc-textures/item/ender_pearl.png'}, {name:'星辉尘', texture:'/mc-textures/item/glowstone_dust.png'}, {name:'末影珍珠', texture:'/mc-textures/item/ender_pearl.png'}]
  ]"
  :result="{name:'灵影护腿', texture:'/mc-textures/item/shrink_leggings.png'}"
/>

**材料**：
- **紫颂覆板** ×2 — 繁星·诅咒祭坛合成（铁锭 + 爆裂紫颂果）
- 幻翼膜 ×1 — 原版幻翼掉落
- **末影合金碎片** ×2 — 繁星·末地城宝库
- **下界合金护腿** ×1 — 原版
- 末影珍珠 ×2 — 原版末影人掉落
- **星辉尘** ×1 — 繁星·全境

**材质**：钻石护腿（穿上显示钻石护腿纹理）

**效果**：穿上后体型缩小至 50%，移动速度提升 40%。

## 设计思路

| 道具 | 主题维度 | 核心材料 | 设计理念 |
|:----|:--------|:--------|:---------|
| 巨像胸甲 | 烬域·下界 | 重型矿镐 + 死灵盾牌 | 沉重如山，巨像之力 |
| 灵影护腿 | 繁星·末地 | 紫颂覆板 + 末影合金碎片 + 星辉尘 | 轻如幻影，星光之速 |

两款盔甲各对应一个维度，鼓励玩家探索两边的内容。获取难度适中，属于趣味收集向装备，非战斗必需品。

## 注意事项

- 巨像胸甲穿在**胸甲**槽位，灵影护腿穿在**护腿**槽位
- 脱下后立即恢复体型和速度
- 效果可叠加：同时穿戴两件时，体型变化为 `2.0 × 0.5 = 1.0`（正常），但速度变化为 `-30% + 40% = +10%`
- 盔甲槽位限制意味着无法同时穿戴保护附魔的对应部位