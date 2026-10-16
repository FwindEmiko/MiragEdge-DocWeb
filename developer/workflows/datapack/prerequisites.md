---
title: 数据包工作流 · 前置与环境
description: 数据包开发的前置条件。涵盖命名空间、pack_format 与 Leaf 格式陷阱、JSON 与 mcfunction 语法、VSCode 与在线工具、测试世界配置、标准目录树与 pack.mcmeta 模板。
outline: [2, 3]
---

# 数据包工作流 · 前置与环境

这页给出开工前的全部前提。它包括版本号写法、语法硬规则、测试环境搭法和目录结构。

## 前置知识

### 命名空间

命名空间隔离数据包内容。所有内容用 `命名空间:路径` 格式的 ID 唯一标识。

```text
miragedge:my_sword     # miragedge 命名空间下的 my_sword
minecraft:stick        # 原版命名空间下的 stick
```

关键规则：

- 命名空间只允许小写字母、数字、下划线和连字符。
- 不同数据包可以定义同名命名空间，加载顺序决定优先级。
- 先加载的包优先级低。
- 本项目命名空间统一使用 `miragedge`。
- CraftEngine 物品 ID 格式为 `namespace:id`，如 `miragedge:ruby_sword`。

### pack_format

`pack_format` 写在 `pack.mcmeta` 中，声明数据包兼容的游戏版本。版本不匹配只告警，不阻止加载。

自 MC 1.21.9 起，Mojang 引入 `min_format` 与 `max_format` 范围字段，逐步取代单一的 `pack_format`。Leaf 26.1.2 对这两个字段有强制要求，详见[参考规则的 Leaf pack.mcmeta 严格校验规则](./reference#leaf-26-1-2-pack-mcmeta-严格校验规则)。

::: danger 三个字段必须用同一种格式
`pack_format` / `min_format` / `max_format` 要么全用整数，要么全用数组，混用会被 Leaf 拒绝。

整数格式：`101`、`82`、`107`。

数组格式：`[101, 1]`，对应 MC 的 `101.1` 小数版本。

下面这种混用会报错：

```json
{
  "pack": {
    "pack_format": 101,
    "min_format": 101,
    "max_format": [101, 1]
  }
}
```
:::

Leaf 26.1.2（pack_format 101）的推荐写法：

```json
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 101,
    "min_format": 82,
    "max_format": 107
  }
}
```

::: tip 为什么 min_format 是 82 而不是 101
Leaf 规定：`min_format` 落在 17–81 的 legacy 区间时，必须额外提供已弃用的 `supported_formats`。

而 `supported_formats` 在 pack_format 82 以上又必须移除。两条规则互锁，解法是把 `min_format` 设为 82 或更大。
:::

### JSON 基础

数据包中绝大多数配置文件是 JSON。AI 辅助开发时注意：

- 严格语法，不支持尾逗号，不支持 `//` 或 `/* */` 注释。
- 键名区分大小写，`Name` 与 `name` 是两个键。
- 嵌套结构常见，用 Misode 生成器可减少手写错误。

### mcfunction 语法

`.mcfunction` 是纯文本文件，每行一条命令。以 `#` 开头的行为注释。

```mcfunction
# 这是一个注释
say Hello, World!
give @a minecraft:diamond 1
execute as @a run say I am a player!
```

目标选择器：

| 元素 | 说明 | 示例 |
| --- | --- | --- |
| `@p` | 最近的玩家 | `give @p diamond 1` |
| `@a` | 所有玩家 | `say @a Hello` |
| `@s` | 当前执行实体 | `execute as @p run say @s` |
| `@e` | 所有实体 | `kill @e[type=creeper]` |
| `@r` | 随机玩家 | `give @r emerald 1` |

## 开发环境搭建

### 1. VSCode 扩展

安装 Spyglass，它是目前最成熟的 MC 数据包开发扩展。Spyglass 的前身是 Datapack Helper Plus（DHP）。

在扩展市场搜索 `SPGoding.datapack-language-server`。也可以按 `Ctrl+P` 后输入：

```text
ext install SPGoding.datapack-language-server
```

核心功能：

- 实时验证并补全 JSON 文件，覆盖进度、配方、战利品表、谓词、标签。
- 高亮 mcfunction 语法并补全命令。
- 跨文件跳转命名空间 ID，用 `Ctrl+Click`。
- 查找引用，用 `Shift+F12`。

把数据包根文件夹作为 VSCode 工作区根目录。根目录指包含 `pack.mcmeta` 和 `data/` 的那一层。

若目标版本与实际版本不同，在根目录创建 `spyglass.json` 覆盖：

```json
{
  "env": {
    "gameVersion": "26.1.2"
  }
}
```

### 2. 在线工具

| 工具 | 网址 | 用途 |
| --- | --- | --- |
| Misode | [misode.github.io](https://misode.github.io) | 战利品表、进度、配方、世界生成、谓词、物品修饰器、标签、文本组件的表单生成器 |
| MCStacker | [mcstacker.net](https://mcstacker.net) | 生成 `/give`、`/summon`、`/loot` 等复杂命令 |

Misode 提供结构化表单与实时预览，支持导出为完整数据包项目。优先用 Misode 生成初始 JSON，再手动调整细节。

MCStacker 的典型用途：

- 生成带 NBT 组件的 `/give` 命令测试 CE 物品。
- 生成 `/loot` 命令测试战利品表。
- 把旧版 1.20.4 命令转换为新格式。

### 3. 测试世界

准备一个独立的超平坦创造模式世界做开发测试。

测试世界要求：

- 游戏模式为创造（Creative）。
- 世界类型为超平坦（Superflat）。
- 开启作弊（Cheats enabled）。
- 把开发中的数据包放入该世界的 `datapacks/` 目录。

## 项目结构规范

### 推荐目录树

```text
miragedge-datapack/
├── pack.mcmeta                  # 数据包元数据（必需）
├── pack.png                     # 数据包图标（可选，256×256）
└── data/
    └── miragedge/               # 命名空间目录
        ├── function/            # mcfunction 函数文件
        │   ├── load.mcfunction  # 加载时执行
        │   ├── tick.mcfunction  # 每 tick 执行
        │   ├── test_<module>.mcfunction  # 测试函数
        │   └── <category>/      # 按功能分类的子目录
        ├── loot_table/          # 战利品表
        │   ├── blocks/          # 方块掉落
        │   ├── entities/        # 生物掉落
        │   └── chests/          # 箱子战利品
        ├── recipe/              # 原版合成配方
        ├── advancement/         # 进度
        ├── predicate/           # 谓词（条件判断）
        ├── item_modifier/       # 物品修饰器
        ├── tag/                 # 标签（合并机制）
        │   ├── item/            # 物品标签
        │   ├── block/           # 方块标签
        │   ├── entity_type/     # 实体类型标签
        │   ├── function/        # 函数标签（用于 tick/load 调度）
        │   └── damage_type/     # 伤害类型标签
        └── structure/           # 结构 NBT 模板
            └── *.nbt
```

### 命名规范

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 文件与目录名 | 小写字母加下划线 | `loot_table/blocks/ruby_ore.json` |
| 函数名 | `namespace:path/to/function` | `miragedge:test_weapon_give` |
| 战利品表路径 | 反映来源类型 | `entities/zombie_king.json` |
| 标签路径 | 与原版对应 | `tag/item/weapons.json` |
| CE 物品 ID | `namespace:snake_case_name` | `miragedge:flame_sword` |

### pack.mcmeta 模板

按目标 MC 版本选择模板。三个字段的格式必须统一。

::: code-group

```json [MC 26.1.2（Leaf 推荐：整数格式）]
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 101,
    "min_format": 82,
    "max_format": 107
  }
}
```

```json [MC 26.1.2（数组格式，对应 101.1 小数版本）]
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": [101, 1],
    "min_format": [82, 0],
    "max_format": [107, 0]
  }
}
```

```json [MC 1.21.1 - 1.21.8（仅旧格式）]
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 34
  }
}
```

:::

::: warning 不要使用 supported_formats 字段
在 Leaf 26.1.2 中，`supported_formats` 从 pack_format 82 起被弃用。保留它会导致启动报错。请改用 `min_format` 加 `max_format`。
:::
