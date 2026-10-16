---
title: 甜品与烘焙
description: 锐界幻境甜品与烘焙食物图鉴：派、甜甜圈、纸杯蛋糕 5 种烘焙糕点，草莓甜筒、蜂蜜陶罐、七彩蛋羹 4 种甜品，含配方与完整效果。
outline: [2, 3]
---

# 甜品与烘焙

这页收录 9 种甜口食物：5 种烘焙糕点加 4 种甜品，全部带配方和效果。

## 烘焙糕点

### 派

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

### 草莓甜甜圈

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

### 奶油纸杯蛋糕

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

### 甜浆果纸杯蛋糕

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

### 发光浆果纸杯蛋糕

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

## 甜品

### 草莓甜筒

<FoodEntry
  name="草莓甜筒"
  quality="fine"
  :hunger="8"
  :saturation="6.0"
  effect="30秒抗火。"
  quote="冰冰凉凉香香甜甜的冰淇淋！吃下去火热的心都降温了"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'sugar'}, null],
      [{id:'milk_bucket'}, {id:'strawberry'}, {id:'snowball'}],
      [null, {id:'sugar'}, null]
    ]"
    :result="{id:'strawberry_ice_cream'}"
  />
</FoodEntry>

### 草莓巧克力冰淇淋

<FoodEntry
  name="草莓巧克力冰淇淋"
  quality="fine"
  :hunger="9"
  :saturation="7.0"
  effect="20秒内走过的水面冻结为临时浮冰（5秒后融化），周围 5格生物获得缓慢 II。"
  quote="香香脆脆冰冰凉凉的巧克力草莓味！！你感到周围都凉快了起来"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'sugar'}, null],
      [{id:'cocoa_beans'}, {id:'strawberry'}, {id:'milk_bucket'}],
      [null, {id:'snowball'}, null]
    ]"
    :result="{id:'strawberry_chocolate_ice_cream'}"
  />
</FoodEntry>

### 蜂蜜陶罐

<FoodEntry
  name="蜂蜜陶罐"
  quality="rare"
  :hunger="14"
  :saturation="12.0"
  effect="45秒生命恢复 II + 2分钟急迫 I + 15秒失明。失明期间周围 5格生物同时获得缓慢 II。"
  quote="满满当当的蜂蜜，和腐竹一样甜美诱人，但吃多会得糖尿病"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'honey_bottle'}, {id:'honey_bottle'}, {id:'honey_bottle'}],
      [{id:'honey_bottle'}, {id:'clay_ball'}, {id:'honey_bottle'}],
      [{id:'honey_bottle'}, {id:'honey_bottle'}, {id:'honey_bottle'}]
    ]"
    :result="{id:'honey_clay_pots'}"
  />
</FoodEntry>

### 七彩蛋羹

<FoodEntry
  name="七彩蛋羹"
  quality="legendary"
  :hunger="4"
  :saturation="20.0"
  effect="10分钟抗性 V + 力量 III + 速度 II + 生命恢复 II + 生命提升 V。食用时解锁永久称号「幻境食神」及专属进出服消息。30分钟冷却。"
  quote="这...未免太奢侈了些？龙蛋做的蛋羹，吃下去你就是幻境最强战士"
>
  <CraftingTable
    :ingredients="[
      {name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'},
      {id:'egg'}, {id:'egg'}, {id:'egg'}, {id:'egg'},
      {id:'turtle_egg'}, {id:'sniffer_egg'},
      {id:'sugar'},
      {id:'bowl'}
    ]"
    :result="{id:'colorful_egg_custard'}"
  />
</FoodEntry>
