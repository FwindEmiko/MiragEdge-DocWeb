---
title: 烘焙糕点
---

# <MapIcon name="cooking" :size="24" /> 烘焙糕点

精致的面点料理，从小巧的派到华丽的纸杯蛋糕。烘焙是一门艺术，也是饱食与增益的完美结合。

::: tip 分类说明
本页收录 5 种烘焙糕点，精良品质居多，提供饱和、抗性、加速等强力 buff。
:::

## 派

<FoodEntry
  name="派"
  quality="common"
  :hunger="9"
  :saturation="6.0"
  effect="无特殊效果"
  quote="蛋糕的青春版，一个人也能享受的完美甜点"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'wheat'}, {id:'egg'}, {id:'wheat'}],
      [{id:'sugar'}, {id:'sweet_berries'}, {id:'sugar'}],
      [null, {id:'wheat'}, null]
    ]"
    :result="{id:'pie'}"
  />
</FoodEntry>

## 草莓甜甜圈

<FoodEntry
  name="草莓甜甜圈"
  quality="fine"
  :hunger="6"
  :saturation="5.0"
  effect="4秒生命恢复 + 5秒反胃（太甜了！）"
  quote="香香软软的，但是一口吃掉好像太腻了..."
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'wheat'}, null],
      [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
      [null, {id:'strawberry'}, null]
    ]"
    :result="{id:'strawberry_donuts', count:2}"
  />
</FoodEntry>

## 奶油纸杯蛋糕

<FoodEntry
  name="奶油纸杯蛋糕"
  quality="fine"
  :hunger="7"
  :saturation="3.0"
  effect="3秒饱和 + 30秒抗性 I + 40秒移动速度 +10%。"
  quote="小时候挺爱吃的...长大后好像只能在锐界幻境吃到了，一口回到童年"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'wheat'}, null],
      [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
      [null, {id:'milk_bucket'}, null]
    ]"
    :result="{id:'cream_cupcakes', count:2}"
  />
</FoodEntry>

## 甜浆果纸杯蛋糕

<FoodEntry
  name="甜浆果纸杯蛋糕"
  quality="common"
  :hunger="5"
  :saturation="5.0"
  effect="食用后获得 8秒 抗性提升 I"
  quote="锐界幻境童年风味，小小的纸杯里装着大大的幸福"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'wheat'}, null],
      [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
      [null, {id:'sweet_berries'}, null]
    ]"
    :result="{id:'sweet_berries_cupcake', count:2}"
  />
</FoodEntry>

## 发光浆果纸杯蛋糕

<FoodEntry
  name="发光浆果纸杯蛋糕"
  quality="common"
  :hunger="5"
  :saturation="5.0"
  effect="8秒抗性提升 I + 15秒自发光"
  quote="发光的纸杯蛋糕！晚上都不用带火把了（虽然只有一会儿）"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'wheat'}, null],
      [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
      [null, {id:'glow_berries'}, null]
    ]"
    :result="{id:'glow_berries_cupcake', count:2}"
  />
</FoodEntry>


*本页为烘焙糕点分类 · 设计与数值可能随游戏版本调整*
