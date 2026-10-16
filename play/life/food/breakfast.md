---
title: 早餐简餐
description: 锐界幻境早餐食物图鉴：培根、煎蛋、吐司、雷霆大面包、奶酪、烤南瓜 6 种基础食物，含合成台与熔炉配方、饥饿值和食用效果。
outline: [2, 3]
---

# 早餐简餐

这页收录 6 种基础食物，配方简单，是每天出门前的第一顿补给。

## 培根

<FoodEntry
  name="培根"
  quality="common"
  :hunger="5"
  :saturation="5.0"
  effect="无特殊效果，纯粹的美味"
  quote="treetree的炸培根，焦香酥脆，是冒险前的最佳能量补给"
>
  <CraftingTable
    :ingredients="[
      {id:'cooked_porkchop'},
      {id:'pig_slayer'}
    ]"
    :result="{id:'bacon', count:2}"
  />
</FoodEntry>

## 煎蛋

<FoodEntry
  name="煎蛋"
  quality="common"
  :hunger="4"
  :saturation="3.0"
  effect="无特殊效果"
  quote="早餐的灵魂伴侣"
>
  <Furnace
    :input="{id:'egg'}"
    :result="{id:'fried_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

## 吐司

<FoodEntry
  name="吐司"
  quality="common"
  :hunger="7"
  :saturation="8.0"
  effect="10秒速度 I + 10秒生命恢复。"
  quote="锐界幻境早餐风味，搭配培根煎蛋食用更佳"
>
  <Furnace
    :input="{id:'bread'}"
    :result="{id:'toast'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

## 雷霆大面包

<FoodEntry
  name="雷霆大面包"
  quality="fine"
  :hunger="7"
  :saturation="8.0"
  effect="2秒饱和。5秒后若仍处于满饱食状态，额外回复 2点生命值。"
  quote="三层面包锻造而成，雷霆之力蕴藏其中"
>
  <CraftingTable
    :ingredients="[
      {id:'bread'}, {id:'bread'}, {id:'bread'},
      {id:'forging_hammer'}
    ]"
    :result="{id:'double_bread'}"
  />
</FoodEntry>

## 奶酪

<FoodEntry
  name="奶酪"
  quality="common"
  :hunger="4"
  :saturation="5.0"
  effect="无特殊效果"
  quote="没错，杰瑞最喜欢这个了"
>
  <CraftingTable
    :ingredients="[
      {id:'milk_bucket'},
      {id:'sugar'}
    ]"
    :result="{id:'cheese'}"
  />
</FoodEntry>

## 烤南瓜

<FoodEntry
  name="烤南瓜"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="5秒生命恢复 + 8秒内受到伤害降低 15%。"
  quote="锐界幻境烧烤风味，自然的香甜"
>
  <Furnace
    :input="{name:'南瓜', texture:'/mc-textures/item/pumpkin.png'}"
    :result="{id:'roasted_pumpkin'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>
