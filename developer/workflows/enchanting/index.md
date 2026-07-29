---
title: Aiyatsbus 附魔配置工作流
description: 以当前 Aiyatsbus 源码、Fluxon 扩展和服务器实际配置为准的附魔维护流程。
---

# Aiyatsbus 附魔配置工作流

这组页面用于维护服务器的 Aiyatsbus 附魔配置，覆盖 YAML 结构、Fluxon 脚本、数据包附魔迁移和验证。它不是旧配置的语法备忘录：遇到冲突时，以当前服务器实际加载的 JAR 和当前上游源码为准。

本轮基线为 [PolarAstrum/aiyatsbus](https://github.com/PolarAstrum/aiyatsbus) 的 `f92123b`（2026-06-25）源码，以及 Fluxon Bukkit 1.1.4 的扩展源码。插件升级后，先重新核实受影响的 API，再复用本页示例。

## 工作顺序

1. 先确定机制归属：原版、数据包或 Aiyatsbus 三者中只能有一个实现同一项效果。
2. 按 [前置与版本](./prerequisites) 建立最小 YAML，再用 [模块结构](./modules) 补齐显示、限制、变量和触发器。
3. 需要脚本时，只使用 [Fluxon 已核实 API](./reference) 中列出的调用；不要把旧 Kether 写法或 Java 方法名直接搬进 `::` 调用。
4. 数据包附魔迁移前先看 [数据包边界](./datapack-boundaries)，特别是属性 modifier、原生状态和投射物数据。
5. 按 [验证与实服验收](./validation) 分层确认；`reload` 成功只说明加载流程没有立刻失败。

## 页面索引

| 页面 | 用途 |
| --- | --- |
| [前置与版本](./prerequisites) | 当前来源、目录约束、命令和最小加载检查 |
| [模块结构](./modules) | YAML 节点、变量、监听器和 ticker 的职责 |
| [Fluxon 参考](./reference) | 经当前源码核实的上下文变量、事件和持久变量写法 |
| [数据包边界](./datapack-boundaries) | 避免数据包与插件重复生效，判断哪些机制不能等价复刻 |
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
