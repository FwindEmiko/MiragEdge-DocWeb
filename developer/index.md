---
title: 开发者文档
description: 锐界幻境开发者文档的总入口，按开发工作流、参考与规范、站点与协作、运维与归档四块组织，涵盖数据包、CraftEngine、附魔、Geyser 与服务器参考的入口。
outline: [2, 3]
---

# 开发者文档

这页是开发者文档的总入口，按四块组织：开发工作流、参考与规范、站点与协作、运维与归档。

## 开发工作流

- [数据包工作流](./workflows/datapack/)：编写、验证与部署数据包。
- [CraftEngine 工作流](./workflows/craftengine/)：创建物品、模型和资源。
- [附魔配置工作流](./workflows/enchanting/)：维护自定义附魔内容。
- [自定义作物工作流](./workflows/custom-crops)：维护作物配置与资源。
- [钓鱼系统工作流](./workflows/fishing/)：维护钓鱼玩法和配置。
- [Geyser 基岩版工作流](./workflows/geyser/)：资源包转换、映射与跨端验收。
- [插件开发规范与协作流程](./process/plugin-lifecycle)：需求核对、实现边界、验证与交付规则。

## 参考与规范

- [服务器模块职责](./reference/server-modules)：专属模块的职责边界与反作弊桥接规范。
- [经济基准参考](./reference/economy)：货币体系、日平衡表与定价锚点。
- [经济审查工作流](./reference/economy-audit/)：改动经济数值前的五阶段审查流程。
- [附魔 ID 对照表](./reference/enchantment_ids)：编写配置、命令或脚本时查询附魔 ID。
- [Stellarity 技术附魔说明](./reference/stellarity-technical-enchantments)：数据包内部的技术附魔标记。
- [祛魔成本计算器](./reference/enchantment-calculator)：拖动滑块查看祛魔消耗。
- [UltimateShop 商店系统配置](./reference/ultimateshop/)：商店插件在 MiragEdge 的定制配置。

## 站点与协作

- [文档站内容维护工作流](./website/content-workflow)：内容新增、事实修订、页面迁移与验证规范。
- [图片自动化模块](./website/autoimage)：`SmartImage` 组件的参数与用法。
- [Minecraft 配方可视化组件](./website/mcrecipe)：`McItem` 配方组件套件的 props 与示例。
- [已注册物品速查](./website/mc-textures)：581 个物品的 id 与中文名。
- [统一图标系统](./website/vectoricons)：`MapIcon` 用法与语义映射表。
- [AI Skills 系统](./ai-skills)：供 AI 读取的技能包与参考配置。
- [开发团队](./team)：成员、贡献者与赞助者名单。

## 运维与归档

- [更新日志](./ops/changelog)：服务器与文档站的变更记录。
- [待办事项](./ops/todo)：开发待办与近期计划。
- [云计算价格表](./ops/compute)：对外售卖的服务器租用价目表。
- [原创插件归档](./archive/plugins/)：未核对暂存与已移除插件的清册。
- [宣传推广方案](./archive/promotion)：历史的推广方案记录。
- [原创插件文档](/plugin-guides/)：独立插件的安装、配置与维护资料。
