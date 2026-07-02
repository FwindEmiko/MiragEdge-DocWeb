# 温度系统

<SmartImage
  src="https://oss.miragedge.top/images/web_image/features/seasons/temperature.png"
  alt="温度系统"
  caption="温度系统"
  width="300"
  radius="12px"
  shadow
  border
/>

> <MapIcon name="thermometer" :size="24" /> 季节系统的核心配套机制！让你的冒险更加真实~

作为**真实季节系统**的核心配套，我们为服务器添加了一套完善的温度模拟系统。每个玩家的界面都会显示当前环境的**空气温度**，不同生物群系的温度差异非常明显！

## 目录

- [核心机制](#核心机制)
- [温度影响因素](#温度影响因素)
- [温度效果详情](#温度效果详情)
- [危险警告](#危险警告)
- [实用小贴士](#实用小贴士)

## 核心机制

### 温度怎么算？

你的体温会受到**多种因素**的共同影响：

- <MapIcon name="sparkles" :size="24" /> **季节**：每个季节的基础温度不同
- <MapIcon name="globe" :size="24" /> **生物群系**：最关键的因素！沙漠很热，雪原很冷
- <MapIcon name="clock" :size="24" /> **时间**：夜晚比白天更冷
- <MapIcon name="cloud-rain" :size="24" /> **天气**：下雨/雪会降低温度
- <MapIcon name="mountain" :size="24" /> **高度**：越高通常越冷（冬季除外）
- <MapIcon name="shield" :size="24" /> **护甲**：厚重护甲保暖但也保暖...在夏天会热
- <MapIcon name="cooking" :size="24" /> **食物**：吃饱饭可以御寒，喝水可以消暑
- <MapIcon name="flame" :size="24" /> **周围方块**：火把、营火、岩浆可以取暖

> <MapIcon name="refresh-cw" :size="24" /> 系统会**每 2 秒**重新计算一次体温，数据实时更新

### 温度奖惩

- <MapIcon name="snowflake" :size="24" /> **< -10℃**：饥饿、缓慢、冻伤（持续伤害）、无法回血
- <MapIcon name="sun" :size="24" /> **> 50℃**：无法自然回血、缓慢、灼烧
- <MapIcon name="check" :size="24" /> **15℃ - 30℃**：舒适区间（可能有奖励效果）

> <MapIcon name="lightbulb" :size="24" /> 部分效果仅为**视觉表现**，不影响游戏平衡：呼气寒雾（< 0℃）、流汗效果（> 40℃）

## 温度影响因素

### 1. 季节基础温度

- 冬季：-12℃ ~ 0℃
- 春季：0℃ ~ 20℃
- 夏季：20℃ ~ 40℃
- 秋季：5℃ ~ 20℃

### 2. 生物群系影响（最关键！）

- <MapIcon name="flame" :size="24" /> **恶地、沙漠**：+15℃
- <MapIcon name="palm-tree" :size="24" /> **丛林**：+12℃
- <MapIcon name="sun" :size="24" /> **热带草原**：+10℃
- <MapIcon name="tree-pine" :size="24" /> **其他常见生物群系**：0℃
- <MapIcon name="mountain" :size="24" /> **山地、针叶林**：-4℃
- <MapIcon name="snowflake" :size="24" /> **积雪/冰冻生物群系**：-12℃

### 3. 天气与时间

**天气影响**：
- 晴朗：±0℃
- <MapIcon name="cloud-rain" :size="24" /> 雨/雪：-4℃
- <MapIcon name="cloud-lightning" :size="24" /> 雷暴：-5℃

**时间段**：
- 白天 (6000-12000)：+0℃ ~ +3℃
- 夜间 (14800-23500)：-5℃ ~ 0℃

### 4. 特殊环境

- <MapIcon name="droplet" :size="24" /> **水中/细雪**：夏季/冬季 -10℃，春/秋季 -4℃（离开后逐渐恢复）
- <MapIcon name="footprints" :size="24" /> **疾跑**：+4℃（寒冷时快速升温的好方法）
- <MapIcon name="mountain" :size="24" /> **非冬季 Y>64**：每格 -0.08℃
- <MapIcon name="mountain" :size="24" /> **冬季 Y>64**：高度不影响温度

### 5. 方块影响（16格范围内）

**取暖**：
- 岩浆：+22℃
- 火：+16℃
- 营火：+15℃
- 火把/灯笼：+7℃

**降温**：
- 灵魂火：-16℃
- 蓝冰：-15℃
- 灵魂营火：-10℃
- 冰/浮冰：-6℃
- 灵魂灯笼：-7℃

### 6. 护甲影响

- 🟤 **皮革**：单件 +5℃，全套 +20℃（仅体温<25℃时生效）
- ⚪ **铁/金/钻石**：单件 +1.25℃，全套 +5℃
- 🔶 **黄玉护甲**：单件约 +11.25℃，全套 +45℃（凛冬神器！需钢锭+黄玉合成）
- ⚫ **下界合金**：单件 +0.75℃，全套 +3℃

### 7. 食物小技巧

- <MapIcon name="snowflake" :size="24" /> **太冷**：吃饱饭 → +5℃（需饥饿值满）
- <MapIcon name="sun" :size="24" /> **太热**：喝水/药水 → -10℃（持续5分钟）

## 温度效果详情

- **< -20℃**：冻伤！每2秒受到半颗心伤害
- **< -15℃**：缓慢效果
- **< -10℃**：饥饿效果
- **< 0℃**：呼气寒雾（视觉）
- **15℃ - 30℃**：舒适区间
- **> 40℃**：流汗效果（视觉）
- **> 50℃**：无法自然回血
- **> 60℃**：缓慢效果
- **> 65℃**：灼烧效果！

## 危险警告

当体温达到**危险阈值**时，服务器会通过以下方式提醒你：

1. <MapIcon name="alert" :size="24" /> **行动栏警告** - 文字颜色变化 + 提示信息
2. <MapIcon name="message-circle" :size="24" /> **聊天框警告** - 发送警告消息

> <MapIcon name="settings" :size="24" /> 警告的触发阈值、样式、频率均可自定义

## 实用小贴士

- <MapIcon name="sun" :size="24" /> **沙漠探险**：带够水！避免穿全套厚护甲
- <MapIcon name="snowflake" :size="24" /> **冬季外出**：随身带火把/营火，离水远点
- <MapIcon name="mountain" :size="24" /> **高山探索**：冬季反而更暖和（Y>64不影响温度）
- <MapIcon name="moon" :size="24" /> **夜间行动**：注意保暖，可以疾跑升温

> <MapIcon name="flame" :size="24" /> **小技巧**：疾跑是寒冷环境快速升温的最佳方法！

> <MapIcon name="pin" :size="24" /> 想了解更多关于**季节系统**的信息？返回[季节系统总览](./info.md)~
> <MapIcon name="shield" :size="24" /> **冬季保暖神器**：想了解超强的黄玉护甲？查看 [黄玉护甲](/features/adventure/armor/yuxi-armor)~
