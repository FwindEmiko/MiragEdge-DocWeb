# <MapIcon name="cooking" :size="24" /> 饮品

各有特色的液体料理，从醉人的啤酒到神秘的珍珠奶茶，再到活动限定的汽水系列。

::: tip 分类说明
本页收录 7 种饮品（含汽水系列 4 种），以精良品质为主，饮用后返还空瓶/空杯。
:::

---

## 啤酒

<FoodEntry
  name="啤酒"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="10秒饱和 + 5秒失明 + 5秒反胃 + 5秒力量 II"
  warning="60秒内饮用超过3次 → 物品栏随机打乱！"
  quote="小麦果汁！有很强的饱腹感，但喝多会醉...注意适量！"
>
  <CraftingTable
    :ingredients="[
      {name:'啤酒花', texture:'/mc-textures/item/wheat_seeds.png'},
      {name:'啤酒花', texture:'/mc-textures/item/wheat_seeds.png'},
      {id:'wheat'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'beer'}"
  />
</FoodEntry>

---

## 珍珠奶茶

<FoodEntry
  name="珍珠奶茶"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="8秒生命恢复 + 随机小范围传送"
  quote="这珍珠...怪怪的？喝起来有种不真实的感觉..."
>
  <CraftingTable
    :ingredients="[
      {id:'milk_bucket'},
      {id:'sugar'},
      {name:'红薯', texture:'/mc-textures/item/potato.png'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'bubble_tea'}"
  />
</FoodEntry>

---

## 汽水四兄弟

<FoodEntry
  name="汽水四兄弟"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="可口可乐: 15秒速度 I | 百事可乐: 15秒跳跃 I | 雪碧: 15秒缓降 | 芬达: 15秒抗火"
  quote="锐界幻境特供汽水系列，活动/任务获取"
>
  <div class="soda-display">
    <div class="soda-item">
      <McItem id="coca_cola" size="lg" />
      <span>可口可乐</span>
    </div>
    <div class="soda-item">
      <McItem id="pepsi_cola" size="lg" />
      <span>百事可乐</span>
    </div>
    <div class="soda-item">
      <McItem id="sprite" size="lg" />
      <span>雪碧</span>
    </div>
    <div class="soda-item">
      <McItem id="fanta" size="lg" />
      <span>芬达</span>
    </div>
  </div>

  <table class="soda-table">
    <thead>
      <tr><th>属性</th><th>可口可乐</th><th>百事可乐</th><th>雪碧</th><th>芬达</th></tr>
    </thead>
    <tbody>
      <tr><td>饥饿值</td><td>5</td><td>5</td><td>5</td><td>5</td></tr>
      <tr><td>饱和度</td><td>4.0</td><td>4.0</td><td>4.0</td><td>4.0</td></tr>
      <tr><td>获取方式</td><td>特殊渠道</td><td>特殊渠道</td><td>特殊渠道</td><td>特殊渠道</td></tr>
      <tr><td>效果</td><td>15秒速度 I</td><td>15秒跳跃 I</td><td>15秒缓降</td><td>15秒抗火</td></tr>
    </tbody>
  </table>
</FoodEntry>

<style>
.soda-display {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}
.soda-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.6));
}
.soda-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.soda-table th,
.soda-table td {
  padding: 6px 8px;
  border: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}
.soda-table th {
  background: rgba(255,255,255,0.05);
  font-weight: 600;
}
.soda-table td:first-child {
  font-weight: 600;
  background: rgba(255,255,255,0.03);
}
@media (max-width: 640px) {
  .soda-display { gap: 10px; }
  .soda-table { font-size: 11px; }
  .soda-table th, .soda-table td { padding: 4px 4px; }
}
</style>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/mains" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">主菜肉食</span>
  </a>
  <a href="/features/pastoral/food/desserts" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">甜品</span>
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

*本页为饮品分类 · 设计与数值可能随游戏版本调整*
