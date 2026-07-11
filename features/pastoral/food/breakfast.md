# <MapIcon name="cooking" :size="24" /> 早餐简餐

简单的食材，快速的料理，是每个冒险者清晨出发前的能量补给。

::: tip 分类说明
本页收录 6 种基础早餐食物，以普通品质为主，提供稳定的饱食与少量生命恢复效果。
:::

---

## 培根

<FoodEntry
  name="培根"
  quality="common"
  :hunger="5"
  :saturation="7.2"
  effect="无特殊效果，纯粹的美味"
  quote="treetree的炸培根，焦香酥脆，是冒险前的最佳能量补给"
>
  <CraftingTable
    :ingredients="[
      {id:'cooked_porkchop'},
      {name:'杀猪刀', texture:'/mc-textures/item/iron_sword.png'}
    ]"
    :result="{id:'bacon', count:2}"
  />
</FoodEntry>

---

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

---

## 吐司

<FoodEntry
  name="吐司"
  quality="common"
  :hunger="7"
  :saturation="8.0"
  effect="食用后获得 10秒 生命恢复"
  quote="锐界幻境早餐风味，搭配培根煎蛋食用更佳"
>
  <Furnace
    :input="{id:'bread'}"
    :result="{id:'toast'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

---

## 雷霆大面包

<FoodEntry
  name="雷霆大面包"
  quality="fine"
  :hunger="10"
  :saturation="12.0"
  effect="食用后获得 5秒 饱和"
  quote="三层面包锻造而成，雷霆之力蕴藏其中"
>
  <CraftingTable
    :ingredients="[
      {id:'bread'}, {id:'bread'}, {id:'bread'},
      {name:'锻造锤', texture:'/mc-textures/item/iron_ingot.png'}
    ]"
    :result="{id:'double_bread'}"
  />
</FoodEntry>

---

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

---

## 烤南瓜

<FoodEntry
  name="烤南瓜"
  quality="common"
  :hunger="10"
  :saturation="6.0"
  effect="食用后获得 20秒 生命恢复"
  quote="锐界幻境烧烤风味，自然的香甜"
>
  <Furnace
    :input="{name:'南瓜', texture:'/mc-textures/item/pumpkin_pie.png'}"
    :result="{id:'roasted_pumpkin'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/info" class="nav-card nav-back">
    <span class="nav-label">返回总览</span>
    <span class="nav-title">食物系统总览</span>
  </a>
  <a href="/features/pastoral/food/snacks" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">糖果零食</span>
  </a>
</div>

<style>
.food-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0;
}
.nav-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-card:hover {
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.06);
  transform: translateY(-1px);
}
.nav-next { text-align: right; }
.nav-label {
  font-size: 12px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
}
.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1, rgba(255,255,255,0.9));
}
@media (max-width: 640px) {
  .food-nav { grid-template-columns: 1fr; }
}
</style>

---

*本页为早餐简餐分类 · 设计与数值可能随游戏版本调整*
