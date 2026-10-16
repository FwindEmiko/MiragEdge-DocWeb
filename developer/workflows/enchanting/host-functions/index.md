---
title: 宿主函数总览
description: Aiyatsbus 附魔脚本可用的宿主函数索引：API 优先级、自动导入、上下文调用写法，以及 block、world、entity、guard、variables 等命名空间的分页入口。
outline: [2, 3]
---

# 宿主函数总览

这页说明 Aiyatsbus 附魔脚本能用哪些宿主函数，以及在没有现成函数时该按什么顺序找替代方案。函数按命名空间分三页收录：本页给出优先级和调用规则，[世界与实体](./world-entity)、[变量与运行时组合](./variables-combos) 给出逐个函数的签名和示例。

宿主函数指 `aiy:*` 包下由 Aiyatsbus 提供的函数。Fluxon 语言语法、标准库和 JVM 互操作分别见 [Fluxon 语言参考](../fluxon-language)、[内置函数与扩展函数](../fluxon-stdlib) 和 [JVM 互操作参考](../fluxon-jvm-interop)。调用 Bukkit 或其他 Java API 时，必须同时遵循 [Bukkit/Java 调用语义](../fluxon-bukkit-java-semantics)。

## API 优先级

宿主函数优先于自行通过 JVM 互操作实现同一能力。编写脚本前依次检索本页与以下参考：

1. 本页三个宿主函数页面。
2. [内置函数与扩展函数](../fluxon-stdlib)。
3. [Import 模块参考](../fluxon-modules)。
4. [Fluxon 语言参考](../fluxon-language)。
5. [JVM 互操作参考](../fluxon-jvm-interop)。

已有 API 能完成需求时不要重复实现。只有以上参考均没有对应能力时，才使用 `static`、反射或自行构造 Java 工具。

## 调用规则

Aiyatsbus 会自动导入本页涉及的 `aiy:*` 包，附魔 YAML 的脚本块中通常不需要手动 `import`。

普通模块使用上下文调用：

```fluxon
locations = block::getVein(&origin, 16)
ready = cooldown::isReady(&player, &enchant, 5.0)
```

也可以显式调用模块访问器，但通常没有必要：

```fluxon
locations = block()::getVein(&origin, 16)
```

必须遵循以下规则：

- 读取变量时使用 `&name`。裸标识符是字符串字面量，例如 `player` 表示字符串 `"player"`，`&player` 才表示玩家变量。
- 省略可选参数时只能从参数列表末尾开始省略。要跳过中间参数时传入 `null`。
- 时间单位以具体函数说明为准。药水持续时间使用 tick，冷却使用秒，弓蓄力时间使用毫秒。
- Bukkit 对象可以继续通过 Fluxon 的 `::` 扩展或 `.` JVM 互操作访问。
- `FnBow` 没有 `bow()` 或 `bow::` 入口，只为弓蓄力事件对象提供扩展函数。

## 命名空间索引

| 命名空间 | 函数数 | 用途 | 所在页 |
| --- | ---: | --- | --- |
| `block` | 2 | 计算方块掉落与连通同材质方块 | [世界与实体](./world-entity) |
| 弓蓄力事件扩展 | 4 类 | `Prepare`、`Released`、`Break`、`ChargeInfo` | [世界与实体](./world-entity) |
| `world` | 4 | 昼夜判断与圆形、螺旋粒子 | [世界与实体](./world-entity) |
| `entity` | 13 | 装备、伤害、药水效果和实体类型判断 | [世界与实体](./world-entity) |
| `guard` | 3 | 领地与保护插件的破坏、伤害、拾取检查 | [世界与实体](./world-entity) |
| `cooldown` | 4 | 检查、添加、删除和清空冷却 | [变量与运行时组合](./variables-combos) |
| `inventory` | 2 | 按 Lambda 条件检查与扣除背包物品 | [变量与运行时组合](./variables-combos) |
| `item` | 2 | 附魔目标 ID 与不可破坏属性 | [变量与运行时组合](./variables-combos) |
| `player` | 1 | 模拟 `BlockPlaceEvent` 判断能否放置 | [变量与运行时组合](./variables-combos) |
| `variables` | 4 | 读取和写入普通、等级、物品变量 | [变量与运行时组合](./variables-combos) |
| `common` | 1 | 输出到 Aiyatsbus 调试日志 | [变量与运行时组合](./variables-combos) |

`cooldown` 是宿主函数，但与触发器也有联系：Skill 触发器会按附魔 ID 自动检查并记录冷却。两者操作同一条记录，详见 [Skill 触发器](../skill-trigger)。
