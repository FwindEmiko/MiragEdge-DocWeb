# <MapIcon name="cooking" :size="24" /> 饮品

各有特色的液体料理，从醉人的啤酒到神秘的珍珠奶茶，再到活动限定的汽水系列。

::: tip 分类说明
本页收录 7 种饮品（含汽水系列 4 种），以精良品质为主，饮用后返还空瓶/空杯。
:::

## 啤酒

<FoodEntry
  name="啤酒"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="🍺 微醺之力：10秒饱和+5秒力量II+5秒失明+5秒反胃。60秒内≥3瓶→物品栏打乱 + 10秒力量III（醉拳！）"
  warning="60秒内饮用超过3次 → 物品栏随机打乱！"
  quote="小麦果汁！有很强的饱腹感，但喝多会醉...注意适量！"
>
  <CraftingTable
    :ingredients="[
      {id:'hop'},
      {id:'hop'},
      {id:'wheat'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'beer'}"
  />
</FoodEntry>

## 珍珠奶茶

<FoodEntry
  name="珍珠奶茶"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="🧋 珍珠弹跳：每次跳跃落地在周围生成 3颗珍珠粒子（碰触1点伤害+击退），15秒 + 小范围随机传送"
  quote="这珍珠...怪怪的？喝起来有种不真实的感觉..."
>
  <CraftingTable
    :ingredients="[
      {id:'milk_bucket'},
      {id:'sugar'},
      {id:'sweet_potato'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'bubble_tea'}"
  />
</FoodEntry>

## 汽水四兄弟

<FoodEntry
  name="汽水四兄弟"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="🥤 可口: 碳酸嗝气+速度 | 百事: 跳跃提升+双倍伤害概率 | 雪碧: 缓降+水下加速 | 芬达: 抗火+攻击点燃"
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


*本页为饮品分类 · 设计与数值可能随游戏版本调整*
