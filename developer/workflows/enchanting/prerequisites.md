---
title: Aiyatsbus 附魔配置工作流 · 前置与版本
description: 开始修改附魔前，确认插件、配置目录、数据包归属和可用命令。
---

# 前置与版本

## 先确认实际运行版本

文档和本地源码不能替代服务端正在加载的 JAR。修改前记录以下信息：

| 项目 | 要确认的内容 |
| --- | --- |
| Aiyatsbus | JAR 文件名、版本、启动日志中的加载信息 |
| 服务端 | Paper/Leaf 版本与 Minecraft 版本 |
| Fluxon | 是否随当前 Aiyatsbus JAR 打包，以及实际版本 |
| 配置 | `plugins/Aiyatsbus/enchants/` 下实际加载的文件和分包目录 |
| 数据包 | 对应附魔是否仍在 datapack 中注册或生效 |

本工作区的 `Stellarity` 和 `Funpack` 是待部署配置集；不要把工作区路径当成服务端唯一加载路径。部署前确认文件已经进入目标服务端的 `enchants` 目录，并在测试服先 reload。

## 目录与归属

一个 YAML 文件描述一个附魔。分包目录可以用于组织来源，但机制归属必须清晰：

```text
plugins/Aiyatsbus/enchants/
  Stellarity/
    example.yml
  Funpack/
    example.yml
```

同一个效果不要同时由数据包和 Aiyatsbus 实现。附魔 ID、展示名相同也不代表效果可互换，迁移前请先阅读 [数据包边界](./datapack-boundaries)。

## 最小可维护骨架

以下是当前上游默认附魔使用的节点结构。字段风格以同一配置包内已经可加载的文件为准，不要在一次迁移中顺手混用连字符和下划线风格。

```yaml
basic:
  enable: true
  disable_worlds: []
  id: example_enchant
  name: "示例附魔"
  max_level: 1

rarity: 普通
targets:
  - 剑
limitations: []

display:
  description:
    general: "用于验证加载和显示的最小附魔"

mechanisms:
  listeners:
    on-damage:
      listen: entity-damage-other
      handle: |-
        damage = &event::damage()
        &event::setDamage(&damage)
```

这个样例只验证 YAML、监听器和 Fluxon 调用链，不引入额外数值变化。把它加载成功后，再逐步添加变量、冷却、目标筛选或副作用。

### `basic`

| 字段 | 作用 |
| --- | --- |
| `enable` | 是否启用该附魔 |
| `disable_worlds` | 禁用世界列表 |
| `id` | 内部 ID，用于命令、冲突和配置引用 |
| `name` | 展示名称 |
| `max_level` | 最大等级 |

### `alternative` 是可选节点

当前源码的 `AlternativeData` 接受空节点并提供默认值。因此普通自定义附魔可以不写 `alternative`。只有要替代原版已注册附魔时，才明确添加：

```yaml
alternative:
  is-vanilla: true
```

`is-vanilla` 只表示原版附魔替代元数据，不会自动把数据包机制、原版内部机制或其他插件逻辑变成 Aiyatsbus 脚本。不要为了“字段齐全”而给所有自定义附魔补这个节点。

## 当前可核实的命令

当前源码注册了 `book`、`enchant`、`menu`、`mode`、`random`、`reload` 等子命令。日常验证优先使用下面三项：

| 目的 | 命令 |
| --- | --- |
| 生成附魔书 | `/aiyatsbus book <enchant> [level] [player]` |
| 给主手物品附魔 | `/aiyatsbus enchant <enchant> [level] [player]` |
| 重载配置 | `/aiyatsbus reload` |

旧工作流中的 `/aiyatsbus give`、`/aiyatsbus list`、`/aiyatsbus debug` 不在当前源码注册的正常命令列表内，不能作为验证步骤。其余命令的参数以服务器 Tab 补全和当前 JAR 为准。

`/aiyatsbus reload` 成功只证明重载流程完成；它不能证明触发槽位、事件条件、变量持久化、数据包互斥或玩家端表现正确。

## 修改前检查

1. 备份要改的 YAML 和当前可运行的对照配置。
2. 确认 `basic.id` 没有与现有 Aiyatsbus 或数据包附魔重复。
3. 确认 `targets`、`rarity` 和 `limitations` 使用的是当前服务器已注册的名称。
4. 对脚本中的每个 `::` 调用，在 [Fluxon 参考](./reference) 或当前依赖源码中核实。
5. 先准备测试物品和最小触发场景，再开始修改数值。
