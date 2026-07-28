---
title: 星辉锚点
description: 星辉锚点的玩家使用教程：设置家园、浏览公共地点和发起传送请求。
---

# 星辉锚点

## 把常去的地方留住

星辉锚点把你经常往返的位置保存下来，适合自己的基地、公共交通点和与朋友集合的地方。你不需要反复记坐标，也不用为了短距离移动反复穿越危险区域。

它同时提供玩家之间的传送请求，但保留预热、冷却和费用，让传送是便利工具，不会完全取代探索和道路建设。

## 从一个落脚点开始

### 家园：自己的落脚点

<CommandPanel>
  <CommandEntry command="/sethome &lt;名称&gt;" description="保存当前地点" />
  <CommandEntry command="/home [名称]" description="返回指定家园；不填名称时打开列表" />
  <CommandEntry command="/homes" description="查看自己的家园" />
  <CommandEntry command="/delhome &lt;名称&gt;" description="删除不再使用的家园" />
</CommandPanel>

第一次设置时，站在真正想保存的位置再执行命令。家园名称建议使用容易记忆的短名称，例如 `base`、`mine` 或 `shop`。

### 公共锚点：前往大家常用的位置

<CommandPanel>
  <CommandEntry command="/warp [名称]" description="前往公共锚点" />
  <CommandEntry command="/warps" description="浏览公共锚点" />
</CommandPanel>

如果你的账号获得了公开名额，可以使用：

<CommandPanel title="拥有公开名额时">
  <CommandEntry command="/publish &lt;家园名&gt; [显示名] [费用]" description="将家园发布为公共锚点" />
  <CommandEntry command="/unpublish &lt;家园名&gt;" description="取消公开锚点" />
</CommandPanel>

普通玩家默认公开名额为 0；已有公共锚点仍可浏览，能否创建以游戏内提示为准。

### 和朋友集合

<CommandPanel>
  <CommandEntry command="/tpa &lt;玩家&gt;" description="请求传送到对方" />
  <CommandEntry command="/tpahere &lt;玩家&gt;" description="请求对方传送到你这里" />
  <CommandEntry command="/tpaccept [玩家]" description="接受请求" />
  <CommandEntry command="/tpdeny [玩家]" description="拒绝请求" />
  <CommandEntry command="/tpaui" description="打开传送请求管理界面" />
</CommandPanel>

## 当前服务器规则

以下内容来自当前服务器配置索引（2026-07-26）：

| 项目 | 当前规则 |
| --- | --- |
| 默认家园数量 | 1 个 |
| 家园名称长度 | 最多 16 个字符 |
| 禁止设置家园的世界 | `pvp` |
| 传送冷却 | 5 秒 |
| 传送预热 | 3 秒 |
| 预热期间移动或受伤 | 会取消传送 |
| 创建第一个家园 | 350 灵叶 |
| 额外家园 | 每个额外增加 300 灵叶 |
| 删除家园 | 按当前配置返还 60% |
| TPA 请求有效期 | 60 秒 |
| TPA 成功费用 | 100 灵叶 |

传送成功后会有短暂的缓慢和失明效果。这是为了避免玩家刚落地就利用传送保护瞬间完成攻击或定位，不是传送失败。

## 方便移动，也让每次出发有分量

家园解决的是重复赶路，公共锚点解决的是社区交通，TPA 解决的是临时集合。三者分开，可以让玩家在“方便移动”和“仍然需要探索”之间保持平衡。

预热和移动取消让传送不能在战斗中无成本逃跑；费用和数量上限则让锚点仍然需要规划，而不是把所有位置都变成瞬移点。

## 常见问题

### 为什么 `/sethome` 失败？

先确认当前世界不是 `pvp`，并检查是否已经达到家园数量上限。传送或创建过程中如果收到明确提示，以提示内容为准。

### 传送时能不能走动？

不能。当前配置下，预热期间移动或受到伤害都会取消传送。

### 基岩版能不能用？

核心功能与 Java 版一致。Java 版通常使用菜单，基岩版会使用对应表单；按钮布局差异见[基岩版兼容说明](/start/bedrock)。

## 相关页面

- [经济系统](/play/systems/economy)
- [入服与客户端兼容](/start/compatibility)
- [插件教程总览](/plugins/)
