# <MapIcon name="cooking" :size="24" /> 甜品

甜蜜的终极诱惑，从冰淇淋到蜂蜜陶罐，再到传说中的七彩蛋羹。品质越高，材料越稀有，效果也越强大。

::: tip 分类说明
本页收录 4 种甜品，从精良到传说品质，包含本系统最强大的终极战斗料理。
:::

## 草莓甜筒

<FoodEntry
  name="草莓甜筒"
  quality="fine"
  :hunger="8"
  :saturation="6.0"
  effect="🍦 冰火两重天：30秒抗火 + 攻击时 20%概率将目标点燃 3秒（冷与热的碰撞！）"
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

## 草莓巧克力冰淇淋

<FoodEntry
  name="草莓巧克力冰淇淋"
  quality="fine"
  :hunger="9"
  :saturation="7.0"
  effect="❄️ 寒冰行者 20秒：走过的水面冻结为临时浮冰，周围 5格生物缓慢 II。搭配水行药水=水面奔跑！"
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

## 蜂蜜陶罐

<FoodEntry
  name="蜂蜜陶罐"
  quality="rare"
  :hunger="14"
  :saturation="12.0"
  effect="🍯 甜蜜陷阱：45秒生命恢复 II + 2分钟急迫 I + 15秒失明 + 失明期间周围 5格生物也被缓慢 II（大家一起瞎！）"
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

## 七彩蛋羹

<FoodEntry
  name="七彩蛋羹"
  quality="legendary"
  :hunger="4"
  :saturation="20.0"
  effect="终极战斗料理：10分钟抗性提升 V + 5分钟速度 II + 5分钟生命恢复 II + 10分钟生命提升 V | 🌟 食用时全服公告 + 永久称号「幻境食神」+ 专属进出服消息"
  quote="这...未免太奢侈了些？龙蛋做的蛋羹，吃下去你就是幻境最强战士"
>
  <CraftingTable
    :ingredients="[
      {name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'},
      {id:'egg'}, {id:'egg'}, {id:'egg'}, {id:'egg'},
      {id:'sugar'},
      {id:'bowl'}
    ]"
    :result="{id:'colorful_egg_custard'}"
  />
</FoodEntry>


*本页为甜品分类 · 设计与数值可能随游戏版本调整*
