---
title: 煎蛋与特色食物
description: 锐界幻境煎蛋与特色食物图鉴：煎海龟蛋、煎嗅探兽蛋、煎龙蛋 3 种煎蛋料理，加粽子、草莓 2 种特色食物，含熔炉与合成台配方。
outline: [2, 3]
---

# 煎蛋与特色食物

这页收录 5 种食物：3 种用熔炉煎出来的蛋类料理，加 2 种节日与基础食材。

## 煎蛋系列

三种煎蛋都放进熔炉，用煤炭煎制。

### 煎海龟蛋

<FoodEntry
  name="煎海龟蛋"
  quality="common"
  :hunger="3"
  :saturation="2.0"
  effect="食用后获得 10秒 缓慢"
  quote="好吃，但这是一颗未来的小海龟，下嘴前先想想"
>
  <Furnace
    :input="{id:'turtle_egg'}"
    :result="{id:'fried_turtle_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

### 煎嗅探兽蛋

<FoodEntry
  name="煎嗅探兽蛋"
  quality="rare"
  :hunger="7"
  :saturation="4.0"
  effect="45秒生命恢复 + 2分钟抗性提升 I"
  quote="来自远古的味道...唇齿留香，蕴含远古生命之力"
>
  <Furnace
    :input="{id:'sniffer_egg'}"
    :result="{id:'fried_sniffer_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

### 煎龙蛋

<FoodEntry
  name="煎龙蛋"
  quality="legendary"
  :hunger="2"
  :saturation="20.0"
  effect="30分钟免疫坠落、火焰、弹射物伤害 + 抗性 II + 生命恢复 I + 伤害吸收 V。近战攻击附带龙息粒子。食用时解锁永久称号「龙之胃」及专属进出服消息。30分钟冷却。"
  quote="奢侈中的奢侈，真的可以吃得起吗...吃下去就是半个创造模式"
>
  <Furnace
    :input="{name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'}"
    :result="{id:'fried_dragon_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

## 特色食物

### 粽子

<FoodEntry
  name="粽子"
  quality="common"
  :hunger="6"
  :saturation="4.0"
  effect="5秒跳跃提升 II + 8秒生命恢复"
  quote="锐界幻境黏糊糊端午风味，感觉像吃下了一整个端午"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'string'}, null],
      [{id:'wheat'}, {id:'sweet_berries'}, {id:'wheat'}],
      [null, {id:'seagrass'}, null]
    ]"
    :result="{id:'zongzi', count:2}"
  />
</FoodEntry>

### 草莓

<FoodEntry
  name="草莓"
  quality="common"
  :hunger="3"
  :saturation="1.0"
  effect="无特殊效果，但很好吃。是制作多种甜品的基础原料"
  quote="新鲜采摘的草莓，酸甜可口。也是制作多种甜品的基础原料"
>
  <McItem id="strawberry" size="lg" />
</FoodEntry>
