---
title: Aiyatsbus 附魔配置工作流
description: 以官方 Aiyatsbus 技能包 v0.0.2 为权威基线，覆盖 YAML 结构、Fluxon 脚本、数据包附魔迁移和验证的完整附魔开发者工作流。
---

# Aiyatsbus 附魔配置工作流

这组页面基于 **Aiyatsbus 官方技能包 v0.0.2**，结合当前服务器源码与配置，提供附魔开发的完整参考。它不是旧配置的语法备忘录：遇到冲突时，以当前服务器实际加载的 JAR 和当前上游源码为准。

本轮基线为 [PolarAstrum/aiyatsbus](https://github.com/PolarAstrum/aiyatsbus) 源码，以及 Fluxon Bukkit 1.1.4 的扩展源码。插件升级后，先重新核实受影响的 API，再复用本页示例。

## 工作顺序

1. 先确定机制归属：原版、数据包或 Aiyatsbus 三者中只能有一个实现同一项效果。
2. 按 [前置与版本](./prerequisites) 建立最小 YAML，再用 [模块结构](./modules) 补齐显示、限制、变量和触发器。
3. 选择 [开发方式](./development-methods) 之一：纯代码附魔、YAML + Builtin 或 YAML + Fluxon。
4. 需要脚本时，选择对应的 [触发器](#触发器参考) 类型，并遵循 [Fluxon 语言参考](./fluxon-language) 编写脚本。
5. 数据包附魔迁移前先看 [数据包边界](./datapack-boundaries)。
6. 按 [验证与实服验收](./validation) 分层确认。

## 页面索引

### 基础入门

| 页面 | 用途 |
| --- | --- |
| [前置与版本](./prerequisites) | 当前来源、目录约束、命令和最小加载检查 |
| [模块结构](./modules) | YAML 节点、变量、监听器和 ticker 的职责 |

### 开发方式（基于官方技能包）

| 页面 | 用途 |
| --- | --- |
| [开发方式总览](./development-methods) | 三种附魔开发方式的选择指南 |
| [纯代码附魔](./code-defined) | 使用 Java Builder 定义附魔信息和效果 |
| [YAML 附魔](./config-defined) | 通过 YAML 管理附魔信息，结合 Java Builtin 或 Fluxon 脚本 |
| [附魔字段速查](./enchantment-fields) | 各字段含义、变量类型、展示格式规范 |

### 触发器参考（基于官方技能包）

| 页面 | 用途 |
| --- | --- |
| [机制总览](./mechanisms) | 5 类附魔机制的选择规则和配置结构 |
| [Listener 触发器](./listener-trigger) | 监听 Bukkit 事件并执行 Fluxon 脚本 |
| [Ticker 触发器](./ticker-trigger) | 按固定 tick 间隔执行 Fluxon 脚本 |
| [Skill 触发器](./skill-trigger) | 由玩家主动动作触发并支持冷却的 Fluxon 技能 |
| [Builtin 触发器](./builtin-trigger) | 使用 Java 编写附魔效果（YAML + Builtin） |
| [Artifact 触发器](./artifact-trigger) | 快速配置粒子附魔 |
| [事件函数索引](./event-functions) | Java EventFunctions 回调签名 |

### Fluxon 语言参考（基于官方技能包）

| 页面 | 用途 |
| --- | --- |
| [Fluxon 语言参考](./fluxon-language) | 语法规则、变量引用、运算符、控制流 |
| [内置函数与扩展函数](./fluxon-stdlib) | 全局内置函数和扩展函数 API |
| [JVM 互操作参考](./fluxon-jvm-interop) | 成员访问、静态成员、构造器、注解系统 |
| [Bukkit/Java API 调用语义](./fluxon-bukkit-java-semantics) | getter/setter/跨版本函数/枚举/构造器规则 |
| [Import 模块参考](./fluxon-modules) | 时间、文件、加密、反射、字节码注入模块 |
| [平台函数](./fluxon-platform-functions) | String 扩展、任务调度、Folia 区域调度 |
| [运行时容器](./fluxon-containers) | 触发器私有容器和全局容器 |
| [Aiyatsbus Fluxon 函数](./aiyatsbus-fluxon-functions) | 宿主函数：block、cooldown、entity、inventory、variables 等 |

### 其他参考

| 页面 | 用途 |
| --- | --- |
| [Fluxon 参考(整合)](./reference) | 经当前源码核实的 Fluxon API 参考（精简版） |
| [官方技能包文件浏览](./skill-files) | 通过 AI Skills 浏览器直接访问官方技能包文件 |
| [数据包边界](./datapack-boundaries) | 避免数据包与插件重复生效 |
| [验证与实服验收](./validation) | 静态、加载、功能、组合回归四层检查 |
| [排错](./troubleshooting) | 常见加载、脚本、持久化和重复生效问题 |

## 维护原则

- 先复制一份当前可运行的同类附魔，再做一项机制改动；不要同时重写 YAML、脚本和数值。
- `basic.id` 是稳定标识。改名用 `basic.name`，不要用中文或展示名替代 ID。
- `modifiable` 是物品状态。读取后必须通过 `variables::setModifiable(...)` 写回，给 `&变量名` 赋值不会持久化。
- 把配置加载、触发事件、实际数值、数据包开关组合分开验收；任何单项通过都不等于整体可上线。
- 本文档只给出当前源码可验证的行为。区域保护、反作弊、PVP、经济和客户端表现必须在目标服务器实测。

## 外部资料

- [Aiyatsbus Wiki](https://wiki.aiy.sh/)
- [Wiki 备用站](https://wiki.polarastrum.cc/)
- [TabooLib 文档镜像](https://taboolib.hhhhhy.kim/category/aiyatsbus)
- [Fluxon 官方教程](https://fluxon.tabooproject.org)
- [Aiyatsbus 官方仓库](https://github.com/PolarAstrum/aiyatsbus)
- [官方技能包文件浏览](./skill-files)
