---
title: 全插件经济速查表
description: 涉及经济的全插件速查表——灵叶与星痕石的产出源和消耗端、珍材商店价目、稀有资源交易所价目、签到与在线奖励、祛魔成本，以及确认不产出星痕石的插件清单。
outline: [2, 3]
---
<script setup>
// §1-4 的产出源与消耗端合并为一张可筛选表：按「货币 · 方向」筛选，或直接搜插件名。
// 数据源即原文 §1-4 的表格内容，逐行搬运未做改动。
const ecoColumns = [
  { key: 'plugin', label: '插件' },
  { key: 'feature', label: '功能' },
  { key: 'amount', label: '数值', align: 'right' },
  { key: 'freq', label: '频率' },
  { key: 'cap', label: '上限' },
  { key: 'note', label: '备注' },
]

const ecoRows = [
  { plugin: 'MiragEdgeMenu', feature: '在线奖励（满 8h）', amount: '10,000', freq: '每日', cap: '无', note: '阶梯发放', group: '灵叶 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '每日任务', amount: '1,000~3,000/个', freq: '每日 5 个', cap: '无', note: '2 易 + 2 中 + 1 难', group: '灵叶 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '周任务', amount: '5,000~15,000/个', freq: '每周 8 个', cap: '无', note: '周入约 40K~65K', group: '灵叶 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '全完成奖励', amount: '+7,000~12,000', freq: '每日或每周', cap: '无', note: '做满额外', group: '灵叶 · 产出' },
  { plugin: 'LiteSignIn', feature: '每日签到', amount: '800', freq: '每日', cap: '无', note: '全服第一翻倍 1,600', group: '灵叶 · 产出' },
  { plugin: 'FE_ABCQ', feature: '知识问答', amount: '500', freq: '约 15min/题', cap: '无', note: '需不少于 4 人在线', group: '灵叶 · 产出' },
  { plugin: 'FE_PVP', feature: '竞技场', amount: '200×段位×加成', freq: '每场', cap: '10,000', note: '基准 200', group: '灵叶 · 产出' },
  { plugin: 'BountyHunter', feature: '赏金猎人', amount: '3,275~5,000', freq: '每日', cap: '日限量', note: '跨日重置', group: '灵叶 · 产出' },
  { plugin: 'Welcome-NEXT', feature: '欢迎新玩家', amount: '100~150', freq: '每位新玩家', cap: '无', note: '60 秒内', group: '灵叶 · 产出' },
  { plugin: 'FE_PassPlus', feature: '月卡（飞行）', amount: '无', freq: '每日', cap: '无', note: '给飞行时间，不给灵叶', group: '灵叶 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '在线奖励', amount: '30', freq: '每日', cap: '无', note: '阶梯发放', group: '星痕石 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '每日任务', amount: '5~15/个', freq: '每日 5 个', cap: '无', note: '全完成另加 8~12', group: '星痕石 · 产出' },
  { plugin: 'MiragEdgeMenu', feature: '周任务', amount: '10~30/个', freq: '每周 8 个', cap: '无', note: '全完成另加 45', group: '星痕石 · 产出' },
  { plugin: 'LiteSignIn', feature: '每日签到', amount: '35', freq: '每日', cap: '无', note: '补签 30，全服第一 70', group: '星痕石 · 产出' },
  { plugin: 'FE_ABCQ', feature: '知识问答', amount: '5', freq: '约 15min/题', cap: '无', note: '需不少于 4 人在线', group: '星痕石 · 产出' },
  { plugin: 'FE_PVP', feature: '竞技场', amount: '1×段位×加成', freq: '每场', cap: '50', note: '基准 1', group: '星痕石 · 产出' },
  { plugin: 'Welcome-NEXT', feature: '欢迎新玩家', amount: '2~10', freq: '每位新玩家', cap: '无', note: '随机值', group: '星痕石 · 产出' },
  { plugin: 'CyberLevels', feature: '等级奖励', amount: '10~15', freq: '一次性', cap: '无', note: '2 级与 3 级、10 级为 10，11~100 级为 15', group: '星痕石 · 产出' },
  { plugin: 'FE_PassPlus', feature: '星痕石月卡·新秀', amount: '+28/天', freq: '每日', cap: '无', note: '权限 `fepp.points.1`', group: '星痕石 · 产出' },
  { plugin: 'FE_PassPlus', feature: '星痕石月卡·精英', amount: '+55/天', freq: '每日', cap: '无', note: '权限 `fepp.points.2`', group: '星痕石 · 产出' },
  { plugin: 'FE_PassPlus', feature: '星痕石月卡·大师', amount: '+110/天', freq: '每日', cap: '无', note: '权限 `fepp.points.3`', group: '星痕石 · 产出' },
  { plugin: 'Crucible（祛魔）', feature: '祛魔普通', amount: '300', freq: '按需', cap: '', note: '另加 3 级经验', group: '灵叶 · 消耗' },
  { plugin: 'Crucible（祛魔）', feature: '祛魔至宝', amount: '1,050', freq: '按需', cap: '', note: '另加 10 级经验与 8 星痕石', group: '灵叶 · 消耗' },
  { plugin: 'Crucible（重铸）', feature: '重铸普通', amount: '50', freq: '按需', cap: '', note: '另加 3 粉尘', group: '灵叶 · 消耗' },
  { plugin: 'Crucible（重铸）', feature: '重铸至宝', amount: '8,000', freq: '按需', cap: '', note: '另加 25 结晶与 15 星痕石', group: '灵叶 · 消耗' },
  { plugin: 'Crucible（增幅）', feature: '增幅附魔', amount: '30~200', freq: '按需', cap: '', note: '另加材料', group: '灵叶 · 消耗' },
  { plugin: 'Crucible（结晶）', feature: '粉尘→结晶', amount: '100/组', freq: '按需', cap: '', note: '无', group: '灵叶 · 消耗' },
  { plugin: 'FE_Pluck', feature: 'RTP 随机传送', amount: '100', freq: '按需', cap: '', note: '无', group: '灵叶 · 消耗' },
  { plugin: 'MiragEdgeHome', feature: '创建家', amount: '350', freq: '按需', cap: '', note: '无', group: '灵叶 · 消耗' },
  { plugin: 'MiragEdgeHome', feature: 'TPA 传送', amount: '100', freq: '按需', cap: '', note: '无', group: '灵叶 · 消耗' },
  { plugin: 'MiragEdgeHome', feature: '死亡返回', amount: '阶梯', freq: '按需', cap: '', note: '前 30 次免费', group: '灵叶 · 消耗' },
  { plugin: 'UltimateShop', feature: '稀有资源·钻石买', amount: '1,600', freq: '按需', cap: '', note: '供应池限量', group: '灵叶 · 消耗' },
  { plugin: 'UltimateShop', feature: '稀有资源·远古残骸买', amount: '4,000', freq: '按需', cap: '', note: '供应池限量', group: '灵叶 · 消耗' },
  { plugin: 'UltimateShop', feature: '稀有资源·下界合金买', amount: '7,000', freq: '按需', cap: '', note: '供应池限量', group: '灵叶 · 消耗' },
  { plugin: 'Crucible', feature: '祛魔至宝', amount: '8', freq: '按需', cap: '', note: '另加 1,050 灵叶与 10 级经验', group: '星痕石 · 消耗' },
  { plugin: 'Crucible', feature: '祛魔传说', amount: '5', freq: '按需', cap: '', note: '无', group: '星痕石 · 消耗' },
  { plugin: 'Crucible', feature: '祛魔史诗', amount: '2', freq: '按需', cap: '', note: '无', group: '星痕石 · 消耗' },
  { plugin: 'Crucible', feature: '重铸至宝', amount: '15', freq: '按需', cap: '', note: '另加 8,000 灵叶与 25 结晶', group: '星痕石 · 消耗' },
  { plugin: 'Crucible', feature: '重铸传说', amount: '5', freq: '按需', cap: '', note: '无', group: '星痕石 · 消耗' },
  { plugin: 'Crucible', feature: '增幅高品质', amount: '1~2', freq: '按需', cap: '', note: '无', group: '星痕石 · 消耗' },
  { plugin: 'UltimateShop', feature: '珍材商店·各物品', amount: '见下一节', freq: '按需', cap: '', note: '无', group: '星痕石 · 消耗' },
]
</script>



# 全插件经济速查表

审查经济改动时，用这 10 张表核对产出源与消耗端。

数据截止 2026-09-02，数值变动后需同步更新本表。审查方法见 [经济审查工作流](/developer/reference/economy-audit/index)。

## 1. 产出源与消耗端总表

审查改动时先在这里定位：按「货币 · 方向」筛选，或直接搜插件名，可以一次看清某个插件动了哪些经济环节。

<DataTable
  :columns="ecoColumns"
  :rows="ecoRows"
  group-key="group"
  :page-size="0"
  search-placeholder="输入插件名或功能筛选"
  note="共 41 条，覆盖灵叶与星痕石的产出源和消耗端；数据截止 2026-09-02。"
/>


## 2. 珍材商店价目表（星痕石）

| 代号 | 物品 | 价格（星痕石） | 肝度 | 占日收入 | 评估 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A | 蕨 | 0.5 | 1 | 小于 1% | 可再生装饰品，不该用星痕石 |
| B | 高草丛 | 0.5 | 1 | 小于 1% | 同上 |
| C | 缠怨藤 | 2.0 | 2 | 1~2% | 下界可再生 |
| D | 末影之眼 | 20.0 | 3 | 13~20% | 合理 |
| E | 菌丝 | 15.0 | 2 | 10~15% | 可再生，偏贵 |
| F | 绯红菌 | 2.5 | 2 | 2~3% | 下界泛滥 |
| G | 诡异菌 | 2.5 | 2 | 2~3% | 同上 |
| H | 龙息 | 40.0 | 3 | 27~40% | 合理 |
| I | 信标 | 200.0 | 4 | 133~200% | 合理 |
| J | 附魔书·经验修补 | 280.0 | 4 | 187~280% | 合理 |
| K | 附魔书·无限 | 200.0 | 4 | 133~200% | 合理 |
| L | 附魔金苹果 | 120.0 | 3 | 80~120% | 合理 |
| M | 附魔金苹果×4 | 450.0 | 3 | 300~450% | 批量优惠 |
| N | 侦测器 | 6.0 | 2 | 4~6% | 合成品，建议改灵叶 |
| O | 潜影壳 | 46.0 | 4 | 31~46% | 合理 |
| P | 下界之星 | 128.0 | 4 | 85~128% | 合理 |
| Q | 岩浆块 | 30 灵叶 | 2 | 无 | 唯一灵叶品，建议移出 |
| R | 海洋之心 | 50.0 | 4 | 33~50% | 合理 |
| S | 鹦鹉螺壳 | 15.0 | 3 | 10~15% | 合理 |
| T | 湿海绵 | 25.0 | 3 | 17~25% | 合理 |
| U | 经验瓶 | 8.0 | 2 | 5~8% | 合理 |
| V | 龙首 | 350.0 | 5 | 233~350% | 合理 |
| W | 猪灵蛮兵头颅 | 90.0 | 3 | 60~90% | 合理 |
| X | 潮汐波纹唱片 | 75.0 | 4 | 50~75% | 合理 |
| Y | 猪鼻唱片 | 60.0 | 4 | 40~60% | 合理 |
| Z | 光明方块 | 8.0 | 2 | 5~8% | 合理 |

肝度按 1~5 级计：1 级为登录或挂机即得，5 级为几乎不可重复。分级标准见[经济审查工作流](/developer/reference/economy-audit/index)。

## 3. 稀有资源交易所价目表（灵叶·供应池模式）

| 代号 | 物品 | 卖价（玩家得） | 买价（玩家付） | 差价 | 回收率 | 个人日卖限 | VIP 日卖限 | 全服池限 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| A | 钻石 | 1,200 | 1,600 | 400 | 25% | 10 | 15 | 128 |
| B | 远古残骸 | 3,000 | 4,000 | 1,000 | 25% | 4 | 6 | 64 |
| C | 下界合金锭 | 5,000 | 7,000 | 2,000 | 29% | 1 | 2 | 10 |
| D | 下界合金碎片 | 1,500 | 2,000 | 500 | 25% | 2 | 3 | 32 |

## 4. 签到奖励详表

| 触发条件 | 灵叶 | 星痕石 | 物品 | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| 普通签到 | 800 | 35 | 无 | 每日 |
| 补签 | 800 | 30 | 无 | 需补签卡 |
| 全服第一 | 1,600 | 70 | 无 | 翻倍 |
| 连签 3 天 | 无 | 无 | 铁锭×3 | 无 |
| 连签 7 天 | 无 | 无 | 金苹果×1 + 补签卡×1 | 全服广播 |
| 连签 14 天 | 无 | 无 | 绿宝石×2 + 补签卡×2 | 全服广播 |
| 连签 21 天 | 无 | 无 | 钻石×1 + 补签卡×2 | 无 |
| 连签 30 天 | 无 | 无 | 钻石×3 + 补签卡×3 | 全服广播 |
| 周日额外 | 无 | 无 | 金苹果×1 | 无 |
| 每周期 7 天 | 无 | 无 | 铁锭×5 | 循环 |

## 5. 在线奖励阶梯

| 时长 | 灵叶 | 星痕石 | 累计灵叶 | 累计星痕石 |
| :--- | :--- | :--- | :--- | :--- |
| 30 分钟 | 700 | 1 | 700 | 1 |
| 60 分钟 | 1,200 | 3 | 1,900 | 4 |
| 120 分钟 | 1,700 | 5 | 3,600 | 9 |
| 180 分钟 | 2,200 | 7 | 5,800 | 16 |
| 360 分钟 | 2,400 | 9 | 8,200 | 25 |
| 480 分钟 | 1,800 | 5 | 10,000 | 30 |

## 6. 祛魔成本详表（Crucible）

| 品质 | 经验等级 | 灵叶 | 星痕石 | 材料 |
| :--- | :--- | :--- | :--- | :--- |
| 普通 | 3 | 300 | 2 | 3 粉尘 |
| 优良 | 5 | 150 | 0 | 8 粉尘 |
| 稀有 | 7 | 400 | 0 | 20 粉尘 |
| 诅咒 | 10 | 1,200 | 2 | 3 结晶 |
| 史诗 | 15 | 3,000 | 5 | 8 结晶 |
| 至宝 | 30 | 8,000 | 15 | 25 结晶 |

## 7. 不产出星痕石的插件

以下插件经全量扫描确认不涉及星痕石产出，审查时无需检查。

| 插件 | 结论 |
| :--- | :--- |
| BountyHunter 赏金猎人 | 只发灵叶（Vault） |
| ajParkour 无尽跑酷 | 只发灵叶 |
| FotiaCrates 抽奖箱 | `type: points` 是经验点，不是 PlayerPoints |
| EMCShop 方块银行 | 只维护块币体系 |
| UltimateShop | 是消耗端不是产出端 |
| RTP 与传送类 | 无星痕石产出 |
