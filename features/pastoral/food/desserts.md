# <MapIcon name="cooking" :size="24" /> 甜品

甜蜜的终极诱惑，从冰淇淋到蜂蜜陶罐，再到传说中的七彩蛋羹。品质越高，材料越稀有，效果也越强大。

::: tip 分类说明
本页收录 4 种甜品，从精良到传说品质，包含本系统最强大的终极战斗料理。
:::

---

## 草莓甜筒

<FoodEntry
  name="草莓甜筒"
  quality="fine"
  :hunger="8"
  :saturation="6.0"
  effect="食用后获得 30秒 抗火"
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

---

## 草莓巧克力冰淇淋

<FoodEntry
  name="草莓巧克力冰淇淋"
  quality="fine"
  :hunger="9"
  :saturation="7.0"
  effect="20秒速度 II + 对周围生物施加 15秒缓慢（寒气四溢！）"
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

---

## 蜂蜜陶罐

<FoodEntry
  name="蜂蜜陶罐"
  quality="rare"
  :hunger="20"
  :saturation="14.0"
  effect="45秒生命恢复 II + 2分钟急迫 I + 20秒失明（太甜了！）"
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

---

## 七彩蛋羹

<FoodEntry
  name="七彩蛋羹"
  quality="legendary"
  :hunger="4"
  :saturation="20.0"
  effect="终极战斗料理：10分钟抗性提升 V + 5分钟速度 II + 5分钟生命恢复 II + 10分钟生命提升 V"
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

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/drinks" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">饮品</span>
  </a>
  <a href="/features/pastoral/food/eggs" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">煎蛋系列</span>
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

*本页为甜品分类 · 设计与数值可能随游戏版本调整*
