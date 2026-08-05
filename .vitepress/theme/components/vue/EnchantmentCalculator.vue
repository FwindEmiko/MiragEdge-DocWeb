<template>
  <div class="pluck-calculator">
    <div class="calc-header">
      <h2>⚡ 祛魔经济计算器</h2>
      <p class="sub">拖动滑块查看不同参数下的消耗</p>
    </div>

    <div class="controls">
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>附魔等级</label>
          <input type="range" v-model.number="lv" min="1" max="10" />
          <span class="val">{{ lv }}</span>
        </div>
        <div class="ctrl-group">
          <label>最大等级</label>
          <input type="range" v-model.number="ml" min="1" max="10" />
          <span class="val">{{ ml }}</span>
        </div>
        <div class="ctrl-group">
          <label>解析顺序</label>
          <input type="range" v-model.number="order" min="1" max="12" />
          <span class="val">{{ order }}</span>
        </div>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>已剥离次数</label>
          <input type="range" v-model.number="stripCount" min="0" max="10" />
          <span class="val">{{ stripCount }}</span>
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="card" :class="maxBase > 30 ? 'bad' : maxBase > 15 ? 'mid' : 'good'">
        <span class="lbl">最高基础消耗</span>
        <span class="num">{{ maxBase }} 级</span>
      </div>
      <div class="card" :class="maxExp > 60 ? 'bad' : maxExp > 30 ? 'mid' : 'good'">
        <span class="lbl">预期消耗(含失败)</span>
        <span class="num">{{ maxExp.toFixed(0) }} 级</span>
      </div>
      <div class="card" :class="maxWorst > 60 ? 'bad' : maxWorst > 30 ? 'mid' : 'good'">
        <span class="lbl">最坏情况(保底)</span>
        <span class="num">{{ maxWorst }} 级</span>
      </div>
      <div class="card" :class="minSr < 0.3 ? 'bad' : minSr < 0.5 ? 'mid' : 'good'">
        <span class="lbl">最低成功率</span>
        <span class="num">{{ (minSr * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <div class="chart-section">
      <h3>📊 经验消耗 · 按品质</h3>
      <div class="bar-chart">
        <div class="bar-col" v-for="d in data" :key="d.name">
          <div class="bar-label">{{ d.name }}</div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: barHeight(expValue(d)), background: d.color + 'aa' }"></div>
          </div>
          <div class="bar-value">{{ expValue(d) }}<span v-if="expTab !== 'base'">级</span></div>
        </div>
      </div>
      <div class="chart-tabs">
        <button :class="{ active: expTab === 'base' }" @click="expTab = 'base'">基础消耗</button>
        <button :class="{ active: expTab === 'expected' }" @click="expTab = 'expected'">预期消耗</button>
        <button :class="{ active: expTab === 'worst' }" @click="expTab = 'worst'">最坏情况</button>
      </div>
    </div>

    <div class="chart-section">
      <h3>💰 金币消耗 · 按品质</h3>
      <div class="bar-chart">
        <div class="bar-col" v-for="d in data" :key="d.name">
          <div class="bar-label">{{ d.name }}</div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: barHeightVault(vaultValue(d)), background: d.color + 'aa' }"></div>
          </div>
          <div class="bar-value">{{ vaultValue(d).toLocaleString() }}</div>
        </div>
      </div>
      <div class="chart-tabs">
        <button :class="{ active: vaultTab === 'base' }" @click="vaultTab = 'base'">基础消耗</button>
        <button :class="{ active: vaultTab === 'expected' }" @click="vaultTab = 'expected'">预期消耗</button>
      </div>
    </div>

    <div class="chart-section">
      <h3>🎯 成功率 · 按品质</h3>
      <div class="bar-chart">
        <div class="bar-col" v-for="d in data" :key="d.name">
          <div class="bar-label">{{ d.name }}</div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: d.sr * 100 + '%', background: d.color + 'aa' }"></div>
          </div>
          <div class="bar-value">{{ (d.sr * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <div class="table-section">
      <h3>📋 完整数据表</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>品质</th><th>系数</th><th>惩罚</th><th>有效order</th>
              <th>基础消耗</th><th>成功率</th><th>预期消耗</th><th>最坏</th>
              <th>金币(单次)</th><th>星痕石</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in data" :key="d.name">
              <td><span class="dot" :style="{ background: d.color }"></span>{{ d.name }}</td>
              <td>{{ d.mult }}</td>
              <td :class="d.pen > 0 ? 'warn' : 'ok'">{{ d.pen > 0 ? '+' + d.pen : '0' }}</td>
              <td class="info">{{ d.eo.toFixed(1) }}</td>
              <td :class="clsBase(d.expBase)">{{ d.expBase }} 级</td>
              <td>{{ (d.sr * 100).toFixed(1) }}%</td>
              <td :class="clsExp(d.expExp)">{{ d.expExp.toFixed(0) }} 级</td>
              <td>{{ d.worst }} 级</td>
              <td>{{ d.vaultBase.toLocaleString() }}</td>
              <td>{{ d.pts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const RARITIES = [
  { name:'皮肤', color:'#ec9bad', mult:0.8, sr:95, decay:0.05, prio:0 },
  { name:'普通', color:'#f8f4ed', mult:1.0, sr:84, decay:0.08, prio:1 },
  { name:'优良', color:'#66c18c', mult:1.5, sr:73, decay:0.09, prio:2 },
  { name:'稀有', color:'#63bbd0', mult:2.0, sr:63, decay:0.095,prio:3 },
  { name:'诅咒', color:'#d42517', mult:3.0, sr:30, decay:0.10, prio:4 },
  { name:'史诗', color:'#eb507e', mult:3.0, sr:55, decay:0.10, prio:5 },
  { name:'传说', color:'#fba414', mult:3.5, sr:45, decay:0.105,prio:6 },
  { name:'至宝', color:'#fbda41', mult:4.0, sr:38, decay:0.095,prio:7 },
]

const lv = ref(3)
const ml = ref(3)
const order = ref(1)
const stripCount = ref(0)
const expTab = ref('base')
const vaultTab = ref('base')

function calcPenaltyVal(sc: number) {
  return Math.min(4, Math.max(0, sc - 1))
}

function calcExp(lv: number, ml: number, order: number, mult: number, sc: number) {
  const eo = order + calcPenaltyVal(sc)
  return Math.round(1 * (lv / ml) * Math.pow(eo, 1.15) * mult)
}

function calcVault(lv: number, ml: number, order: number, mult: number, sc: number) {
  const eo = order + calcPenaltyVal(sc)
  return Math.round(100 * (lv / ml) * Math.pow(eo, 1.15) * mult)
}

function calcPoints(lv: number, ml: number, order: number, mult: number, sc: number) {
  const eo = order + calcPenaltyVal(sc)
  return Math.round(1 * (lv / ml) * Math.pow(eo, 1.15) * mult)
}

function calcSuccessRate(base: number, decay: number, order: number, priority: number) {
  const eo = order >= priority + 1 ? order : (order + priority + 1) / 2
  const rate = base * (1 - decay * (eo - 1))
  return Math.max(3, Math.min(95, rate)) / 100
}

function expectedAttempts(p: number) {
  if (p <= 0) return Infinity
  if (p >= 1) return 1
  let exp = 0
  const q = 1 - p
  for (let k = 1; k <= 8; k++) exp += k * Math.pow(q, k - 1) * p
  exp += 9 * Math.pow(q, 8)
  return exp
}

const data = computed(() => {
  const sc = stripCount.value
  const penVal = calcPenaltyVal(stripCount.value)
  const eo = order.value + penVal

  return RARITIES.map(r => {
    const expBase = calcExp(lv.value, ml.value, order.value, r.mult, sc)
    const vaultBase = calcVault(lv.value, ml.value, order.value, r.mult, sc)
    const pts = calcPoints(lv.value, ml.value, order.value, r.mult, sc)
    const sr = calcSuccessRate(r.sr, r.decay, order.value, r.prio)
    const ea = expectedAttempts(sr)
    const expExp = expBase * ea
    const vaultExp = vaultBase * ea
    const worst = expBase * 9
    return { name: r.name, color: r.color, mult: r.mult, expBase, vaultBase, pts, sr, expExp, vaultExp, worst, pen: penVal, eo }
  })
})

const maxBase = computed(() => Math.max(...data.value.map(d => d.expBase)))
const maxExp = computed(() => Math.max(...data.value.map(d => d.expExp)))
const maxWorst = computed(() => Math.max(...data.value.map(d => d.worst)))
const minSr = computed(() => Math.min(...data.value.map(d => d.sr)))

function barHeight(val: number) {
  const max = Math.max(...data.value.map(d => expValue(d))) || 1
  return Math.max(4, (val / max) * 100) + '%'
}

function barHeightVault(val: number) {
  const max = Math.max(...data.value.map(d => vaultValue(d))) || 1
  return Math.max(4, (val / max) * 100) + '%'
}

function clsBase(v: number) {
  return v <= 5 ? 'ok' : v <= 15 ? 'warn' : 'bad'
}
function clsExp(v: number) {
  return v <= 15 ? 'ok' : v <= 40 ? 'warn' : 'bad'
}

function expValue(d: any) {
  if (expTab.value === 'expected') return Math.round(d.expExp)
  if (expTab.value === 'worst') return d.worst
  return d.expBase
}
function vaultValue(d: any) {
  if (vaultTab.value === 'expected') return Math.round(d.vaultExp)
  return d.vaultBase
}
</script>

<style scoped>
.pluck-calculator {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  color: #e0e0e0;
  font-size: 14px;
}
.calc-header h2 { margin: 0 0 2px; font-size: 20px; color: #fff; }
.calc-header .sub { color: #666; font-size: 13px; margin: 0 0 16px; }

.controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.ctrl-row { display: flex; flex-wrap: wrap; gap: 12px; }
.ctrl-group { flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 2px; }
.ctrl-group label { font-size: 12px; color: #888; }
.ctrl-group input[type="range"] { width: 100%; accent-color: #7c5cfc; }
.ctrl-group .val { font-size: 14px; color: #7c5cfc; font-weight: 600; }

.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 16px; }
.card {
  background: #12122a; border-radius: 8px; padding: 12px; border: 1px solid #2a2a3e;
  display: flex; flex-direction: column; gap: 2px;
}
.card .lbl { font-size: 11px; color: #666; }
.card .num { font-size: 18px; font-weight: 700; }
.card.good .num { color: #4ade80; }
.card.mid .num { color: #facc15; }
.card.bad .num { color: #f87171; }

.chart-section { margin-bottom: 16px; }
.chart-section h3 { font-size: 14px; color: #888; margin: 0 0 8px; }
.bar-chart { display: flex; gap: 6px; align-items: flex-end; height: 180px; padding: 0 4px 24px; position: relative; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-label { font-size: 11px; color: #888; margin-bottom: 4px; white-space: nowrap; }
.bar-track { flex: 1; width: 100%; max-width: 36px; background: #2a2a3e; border-radius: 4px 4px 0 0; position: relative; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.3s; min-height: 4px; }
.bar-value { font-size: 10px; color: #aaa; margin-top: 4px; white-space: nowrap; }
.chart-tabs { display: flex; gap: 0; margin-top: 4px; }
.chart-tabs button {
  padding: 3px 10px; border: 1px solid #333; background: transparent; color: #666;
  font-size: 11px; cursor: pointer;
}
.chart-tabs button:first-child { border-radius: 4px 0 0 4px; }
.chart-tabs button:last-child { border-radius: 0 4px 4px 0; }
.chart-tabs button.active { background: #7c5cfc22; border-color: #7c5cfc66; color: #7c5cfc; }

.table-section { margin-top: 16px; }
.table-section h3 { font-size: 14px; color: #888; margin: 0 0 8px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { text-align: left; padding: 6px 8px; color: #666; font-weight: 500; border-bottom: 1px solid #2a2a3e; white-space: nowrap; }
td { padding: 4px 8px; border-bottom: 1px solid #1a1a2e; white-space: nowrap; }
tr:hover td { background: #1e1e32; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.ok { color: #4ade80; }
.warn { color: #facc15; }
.bad { color: #f87171; }
.info { color: #60a5fa; }

@media (max-width: 600px) {
  .pluck-calculator { padding: 12px; }
  .ctrl-row { flex-direction: column; }
  .ctrl-group { min-width: 100%; }
  .bar-chart { height: 140px; }
  .bar-label { font-size: 9px; }
  .bar-value { font-size: 8px; }
  .summary { grid-template-columns: repeat(2, 1fr); }
  table { font-size: 11px; }
  th, td { padding: 3px 4px; }
}
</style>