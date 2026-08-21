---
title: Aiyatsbus 附魔配置工作流 · 排错
description: 按加载、事件、变量、数据包和实服边界定位 Aiyatsbus 附魔问题。
---

# 排错

> 本文档基于 Aiyatsbus 官方技能包 v0.0.2，以当前服务器源码和配置为准。

先把问题归到一个层次：YAML 没加载、脚本没编译、事件没触发、状态没保存、数值不对，或是另一个系统也在生效。不要在没有日志和最小复现的情况下同时修改多个节点。

## 常见问题

| 现象 | 优先检查 | 处理方式 |
| --- | --- | --- |
| reload 后没有附魔 | YAML 缩进、`basic.enable`、ID、配置目录、完整 reload 日志 | 先还原为最小骨架，逐段加回 |
| `FunctionNotFoundException` | 实际 Fluxon 扩展、函数参数、事件类型 | 不要猜 Java getter；按 [Fluxon 参考](./reference) 或当前 JAR 源码改写 |
| `modifiable` 每次都回到初始值 | 是否只写了 `&变量 = ...`，是否读写同一个 `&item` | 使用 `variables::modifiable(...)` 和 `variables::setModifiable(...)` |
| `variables::modifiable` 报参数错误 | 是否传了第四个默认值 | 当前签名只接收 enchant、item、name 三个参数 |
| 方块交互空指针或脚本错误 | 空气点击、左右手双触发、`clickedBlock` 语法 | 先判断 `isClickBlock()`，使用 `&event::clickedBlock()`，再按 `hand()` 过滤 |
| 移动脚本始终用当前位置 | 使用了旧的“from/to 不可用”方案 | 当前版本可用 `&event::from()` 和 `&event::to()` |
| 数据包效果和插件效果叠加 | 同 ID 或同机制仍由 datapack 生效 | 按 [数据包边界](./datapack-boundaries) 只保留一个机制所有者 |
| reload 成功但游戏内无效 | 槽位、目标、条件、事件、区域保护、PVP、反作弊 | 走 [验证与实服验收](./validation) 的功能和组合回归层 |
| 玩家速度/属性异常残留 | ticker 中全局属性写入与其他系统冲突 | 停止把 base attribute/metadata 恢复作为通用实现，改为短效、边界明确的机制或保留数据包实现 |

## 最小复现步骤

1. 复制问题附魔为单独测试 ID，暂时去掉 ticker、变量和跨事件逻辑。
2. 用 `/aiyatsbus book <enchant> [level] [player]` 或 `/aiyatsbus enchant <enchant> [level] [player]` 得到测试物品。
3. 只保留一个 `listener`，让它做可观察但低风险的最小效果。
4. 记录 reload 后第一条报错及完整堆栈，不要只截最后一行。
5. 验证事件触发后，再逐项加回变量、冷却、ticker 和外部兼容逻辑。

## YAML 检查重点

- `handle`、`pre-handle`、`post-handle` 必须使用块标量 `|-`，避免双引号、多行转义和缩进混合。
- 变量名、显示引用与脚本中的字符串名称必须完全一致。
- `alternative` 是可选节点，删除它本身不会导致普通自定义附魔失效。
- `basic.id` 不应与另一份 Aiyatsbus 配置或数据包注册项冲突。
- 保留当前可加载文件的键名风格，不要在没有版本验证时做“统一连字符/下划线”的机械迁移。

## 证据优先级

1. 当前服务器启动/reload 日志和当前部署 JAR。
2. 当前 Aiyatsbus 与 Fluxon 源码。
3. 当前配置包内已经可加载的同类附魔。
4. 官方 Wiki 和教程。
5. 旧文档、论坛片段和旧 Kether 示例。

资料冲突时，低优先级资料不能覆盖高优先级证据。静态检查、源码阅读和 reload 都不能替代目标服务器的游戏内验收。
