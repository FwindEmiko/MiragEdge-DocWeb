---
title: 称号与入服消息
description: 称号与入服消息的玩家使用教程：管理身份展示、创建自定义称号和选择进退服消息。
---

# 称号与入服消息

## 在聊天里留下自己的名字

这个功能负责“让别人知道你是谁”，不会直接提高攻击、防御或资源产量。

你可以把称号放在聊天身份前，也可以选择已经解锁的入服消息。它适合用来展示游玩经历、社区身份或个人风格。

## 从仓库里挑选，再决定展示

### 称号：拥有和佩戴

<CommandPanel>
  <CommandEntry command="/mt" description="打开称号主界面" />
  <CommandEntry command="/mt shop" description="查看称号商城" />
  <CommandEntry command="/mt storage" description="查看已拥有的称号" />
  <CommandEntry command="/mt equip &lt;ID&gt;" description="装备指定称号" />
  <CommandEntry command="/mt unequip" description="卸下当前称号" />
</CommandPanel>

如果只想创建自己的文字称号，可以使用：

<CommandPanel title="创建自定义称号">
  <CommandEntry command="/mt custom &lt;内容&gt;" description="提交自己的称号文字" />
</CommandPanel>

创建前先确认文字长度和当前账号可用的称号券。当前服务器配置将自定义称号限制为最多 12 个字符。

### 入服消息：选择现在展示的内容

<CommandPanel>
  <CommandEntry command="/mtmessage" description="打开入服消息展示台" />
  <CommandEntry command="/mtmessage equip &lt;ID&gt;" description="装备入服消息" />
  <CommandEntry command="/mtmessage unequip" description="恢复默认消息" />
</CommandPanel>

展示台会区分已解锁和未解锁内容。未解锁的消息不是故障，通常需要完成对应条件后才会出现。

## 当前服务器规则

以下内容来自当前服务器配置索引（2026-07-26）：

- 当前启用服务器经济余额作为称号相关经济来源。
- PlayerPoints 购买路径当前未启用，不要把旧页面中的星痕石价格当成当前规则。
- 普通自定义称号、单色升级和渐变升级各使用 1 张对应称号券；实际库存以游戏内界面为准。
- 在线时间条件由服务器定期检查，页面中的解锁状态可能不会在完成条件的瞬间变化。
- 默认入服消息为 `[+] 玩家名`，默认退服消息为 `[-] 玩家名`；装备其他消息后才会替换它们。

## 展示身份，不把它变成战斗数值

称号和入服消息是低风险的身份表达：它们能让长期游玩、完成挑战或参与社区的玩家留下痕迹，但不把社交展示直接变成战斗数值。

把称号仓库、商城和入服消息分开，是为了让“我拥有了什么”和“我现在展示什么”互不混淆。你可以保留多个称号，只装备其中一个。

## 常见问题

### 为什么我拥有称号但聊天里没有显示？

拥有和装备是两件事。先打开仓库，选中称号并执行装备；如果仍没有显示，再检查客户端是否已经重新进入服务器。

### 为什么不能创建彩色称号？

彩色或渐变属于升级能力，不是所有账号默认开放。以创建界面的权限提示为准，不要直接复制 MiniMessage 标签。

### Java 和基岩版界面一样吗？

功能目标相同，但 Java 版偏向菜单交互，基岩版会使用表单。具体按钮位置见[基岩版兼容说明](/start/bedrock)。

## 相关页面

- [玩家守则](/start/rules)
- [特色功能总览](/plugins/)
