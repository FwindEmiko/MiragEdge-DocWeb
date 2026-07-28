---
title: 服务器模块职责
description: 锐界幻境服务器内部模块的职责边界、配置核对入口与维护注意事项。
---

# 服务器模块职责

本页面面向服主和开发者，用于确认服务器内部模块的职责边界、配置核对入口和维护注意事项。玩家操作说明仍在[特色功能](/plugins/)；可独立部署的原创插件则集中在[原创插件文档](/plugin-guides/)。

## 事实边界

当前服务器配置索引的快照日期为 **2026-07-26**。配置文件能证明“服务器当前写了什么”，不能单独证明所有运行时行为；涉及命令、权限、跨服和 Java/基岩版差异时，仍需结合 JAR、启动日志和游戏内验收。

不要把数据库地址、代理密钥、账号信息或其他敏感字段复制到公开文档。服务端内容索引只用于核对功能，不是公开配置备份。

## 当前专属插件分工

| 插件/模块 | 当前职责 | 玩家文档 |
| --- | --- | --- |
| `EMCShop` | EMC/cc币交换、物品价值和购买流程 | [等价交换商店](/plugins/custom/emc-shop) |
| `MiragEdgeHome` | 家园、公共锚点、TPA 和传送规则 | [星辉锚点](/plugins/custom/miragedge-home) |
| `MiragEdgeTitle` | 称号、称号券和入服/退服消息 | [称号与入服消息](/plugins/custom/miragedge-title) |
| `FE_Back` | 死亡点记录、`/back` 和阶梯惩罚 | [死亡回程](/plugins/custom/death-return) |
| `FE_ABCQ` | 周期问答、聊天抢答和奖励 | [知识问答](/plugins/custom/quiz) |
| `FE_PassPlus` | 按权限生效的周期性权益 | [月卡与通行权益](/plugins/custom/monthly-pass) |
| `FE_NoWeaponFlight` | 飞行状态下的武器限制 | [飞行武器限制](/plugins/custom/flight-guard) |
| `FE_RefreshPapi` | 定时刷新 PAPI 变量，主要供其他系统调用 | 暂无玩家入口 |
| `MiragEdgeMenu` | Java 菜单与基岩版表单入口 | [基岩版兼容](/start/bedrock) |

## 维护顺序

1. 先确认当前服务端内容索引和插件是否仍处于活跃状态。
2. 再确认配置字段、命令和权限是否来自当前版本，而不是旧项目文档。
3. 改动后分别检查 Java 菜单、基岩版表单、跨插件联动和重启后的数据持久化。
4. 只有完成运行时验收，才把行为写入玩家页面；无法确认的内容留在[开发归档](/developer/archive/plugins/)。

## 相关开发工作流

- [数据包工作流](/developer/workflows/datapack/)
- [CraftEngine 工作流](/developer/workflows/craftengine/)
- [附魔配置工作流](/developer/workflows/enchanting/)
- [插件协作流程](/developer/process/plugin-lifecycle)
