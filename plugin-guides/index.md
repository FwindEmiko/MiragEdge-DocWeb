---
title: 原创插件文档
description: 锐界幻境原创插件的部署与维护文档入口。BugEnchantRemover、DragonMiao、HFcatLogin、FE_PVP、FE_Back 五个插件各有独立的安装、配置、命令、权限与排错文档。
outline: [2, 3]
---

# 原创插件文档

这里收录可独立部署的锐界幻境原创插件。每个插件都有自己的安装步骤、配置说明、命令与排错资料，供服主和维护者按插件单独查阅。

## 已发布插件

<FeatureCard
  title="BugEnchantRemover"
  link="/plugin-guides/bug-enchant-remover/"
>
检测并清理异常附魔，兼容 UberEnchant 的 PDC 附魔数据，并保护自定义 GUI 物品。
</FeatureCard>

<FeatureCard
  title="DragonMiao"
  link="/plugin-guides/dragonmiao/"
>
追踪末影龙生命周期与龙蛋记录，支持多末地世界和 Java、基岩版消息适配。
</FeatureCard>

<FeatureCard
  title="HFcatLogin"
  link="/plugin-guides/hfcatlogin/"
>
Velocity 代理端登录插件，支持注册与登录、正版自动登录、会话续登、邮箱找回密码，集成 NanoLimbo 虚拟登录服与 LuckPerms 权限上下文，兼容基岩版 Floodgate。
</FeatureCard>

<FeatureCard
  title="FE_PVP"
  link="/plugin-guides/fepvp/"
>
独立的 PvP 竞技系统，包含单挑、团队竞技、饥饿游戏、押注决斗、快速匹配、观战、装备组合与 ELO 段位排行榜。
</FeatureCard>

<FeatureCard
  title="FE_Back"
  link="/plugin-guides/fe-back/"
>
死亡点记录与 `/back` 返回，每日阶梯死亡惩罚与「遗失的灵叶」金粒掉落，Java 与基岩双端兼容。
</FeatureCard>

## 新插件接入顺序

1. 建独立子目录，放入插件的安装、配置、命令与权限文档。
2. 补齐 frontmatter 的 `title` 与 `description`。
3. 在侧栏增加该插件的目录条目。
