---
title: 数据包工作流 · 前置与环境
description: 面向锐界幻境开发维护的数据包工作流，按前置环境、模块实现、参考规则和排错拆分。
---

# 数据包工作流 · 前置与环境

## 前置知识

### 命名空间（Namespace）

命名空间是数据包中隔离内容的核心机制。所有数据包内容（物品、方块、函数、战利品表等）都由 `命名空间:路径` 格式的 ID 唯一标识。

```
miragedge:my_sword     # miragedge 命名空间下的 my_sword
minecraft:stick        # 原版命名空间下的 stick
```

**关键规则**：

- 命名空间仅允许小写字母、数字、下划线和连字符（`a-z`、`0-9`、`_`、`-`）
- 不同数据包可以定义相同命名空间；加载顺序决定优先级（先加载的包优先级低）
- 本项目的命名空间统一使用 **`miragedge`**
- CraftEngine 物品 ID 格式为 `namespace:id`，如 `miragedge:ruby_sword`

### pack_format

`pack_format` 是 `pack.mcmeta` 中的版本号，告知 Minecraft 该数据包兼容的游戏版本。**版本不匹配将导致警告，但不阻止加载**。

自 MC 1.21.9 起，Mojang 引入了 `min_format` / `max_format` 范围字段，逐步取代单一的 `pack_format`。**Leaf 26.1.2 服务端对这两个字段有强制要求**（详见[参考页的 Leaf pack.mcmeta 严格校验规则](./reference#leaf-26-1-2-pack-mcmeta-严格校验规则)）。

::: danger 不要混用整数和数组格式
`pack_format` / `min_format` / `max_format` 三个字段**必须使用同一种格式**：

- **整数格式**（Leaf 26.1.2 推荐用法）：`101`、`82`、`107`
- **数组格式**（X.Y 小数，对应 MC 26.1+ 的 `101.1` 等）：`[101, 1]`

错误示例（Leaf 会报错）：
```json
{
  "pack": {
    "pack_format": 101,
    "min_format": 101,
    "max_format": [101, 1]   // ❌ min 是整数、max 是数组，不一致
  }
}
```
:::

**Leaf 26.1.2（pack_format 101）推荐写法**：

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

> **为什么 min_format 是 82 而不是 101？**
> 因为 Leaf 规定：当 `min_format` 落在 17-81（legacy 区间）时，必须额外提供已弃用的 `supported_formats` 字段；而 `supported_formats` 在 pack_format 82+ 又必须移除——会陷入死循环。`min_format` 必须设成 **82** 或更大才能避开这个陷阱。详见[参考页的 Leaf pack.mcmeta 严格校验规则](./reference#leaf-26-1-2-pack-mcmeta-严格校验规则)。

> 速查链接：[Pack version - Minecraft Wiki](https://minecraft.wiki/w/Pack_version)

### JSON 基础

数据包中绝大多数配置文件使用 JSON 格式。AI 辅助开发时需注意：

- **严格语法**：不支持尾逗号（trailing comma）、不支持注释（`//` 或 `/* */`）
- **键名区分大小写**：`Name` 与 `name` 是不同的键
- **嵌套结构**：深度嵌套常见，建议使用 Misode 生成器减少手写错误

### mcfunction 语法

mcfunction 文件是 `.mcfunction` 扩展名的纯文本文件，每行一条 Minecraft 命令，以 `#` 开头表示注释。

```mcfunction
# 这是一个注释
say Hello, World!
give @a minecraft:diamond 1
execute as @a run say I am a player!
```

**关键语法元素**：

| 元素 | 说明 | 示例 |
|------|------|------|
| `@p` | 最近玩家 | `give @p diamond 1` |
| `@a` | 所有玩家 | `say @a Hello` |
| `@s` | 当前执行实体 | `execute as @p run say @s` |
| `@e` | 所有实体 | `kill @e[type=creeper]` |
| `@r` | 随机玩家 | `give @r emerald 1` |

> 速查链接：[Minecraft 命令参考](https://minecraft.wiki/w/Commands)

## 开发环境搭建

### 1. VSCode 扩展

推荐使用 **Spyglass**（前身为 Datapack Helper Plus，简称 DHP），这是目前最成熟的 MC 数据包开发扩展。

**安装方式**：

- 在 VSCode 扩展市场搜索 `SPGoding.datapack-language-server`
- 或按 `Ctrl+P` 输入 `ext install SPGoding.datapack-language-server`

**核心功能**：

- JSON 文件（进度/配方/战利品表/谓词/标签）的实时验证与自动补全
- mcfunction 文件（.mcfunction）的语法高亮、命令补全
- 跨文件的命名空间 ID 跳转（Ctrl+Click）
- 引用查找（Shift+F12）

**工作区配置**：将数据包根文件夹（包含 `pack.mcmeta` 和 `data/` 的目录）作为 VSCode 工作区根目录以获得最佳体验。

**版本覆盖**：如果需要为目标版本与实际不同的数据包提供智能提示，在工作区根目录创建 `spyglass.json`：

```json
{
  "env": {
    "gameVersion": "26.1.2"
  }
}
```

### 2. 在线工具

#### Misode Data Pack Generators

网址：[https://misode.github.io](https://misode.github.io)

Misode 是功能最全面的数据包在线生成器，支持：

- **战利品表**（Loot Table）：可视化编辑 pools/entries/functions/conditions
- **进度**（Advancement）
- **配方**（Recipe）
- **世界生成**（Worldgen）：生物群系/维度/结构/噪声设置
- **谓词**（Predicate）
- **物品修饰器**（Item Modifier）
- **标签**（Tag）
- **文本组件**（Text Component）

**核心优势**：提供结构化的表单编辑界面，实时预览，支持导出为完整数据包项目。推荐优先使用 Misode 生成初始 JSON，再手动调整细节。

#### MCStacker

网址：[https://mcstacker.net](https://mcstacker.net)

MCStacker 是命令生成器，特别适合生成复杂的 `/give`、`/summon`、`/loot` 等命令。支持 Minecraft 26.1+ 最新版本。

**典型用途**：

- 生成带 NBT 组件的 `/give` 命令测试 CE 物品
- 生成 `/loot` 命令测试战利品表
- 将旧版 1.20.4 命令转换为新格式

### 3. 测试世界配置

建议创建一个独立的**超平坦创造模式世界**用于开发测试：

```bash
# 在服务器控制台创建测试世界（若有 Multiverse 等插件）
# 或在单人客户端创建后上传至服务器 datapacks/ 目录
```

**测试世界要求**：

- 游戏模式：创造（Creative）
- 世界类型：超平坦（Superflat）
- 开启作弊（Cheats enabled）
- 将开发中的数据包放入该世界的 `datapacks/` 目录

## 项目结构规范

### 推荐目录树

```
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
|------|------|------|
| 文件/目录名 | 小写字母 + 下划线 | `loot_table/blocks/ruby_ore.json` |
| 函数名 | `namespace:path/to/function` | `miragedge:test_weapon_give` |
| 战利品表路径 | 反映来源类型 | `entities/zombie_king.json` |
| 标签路径 | 与原版对应 | `tag/item/weapons.json` |
| CE 物品 ID | `namespace:snake_case_name` | `miragedge:flame_sword` |

### pack.mcmeta 模板

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
在 Leaf 26.1.2 中，`supported_formats` 字段从 pack_format 82 起被弃用，**保留会导致启动报错**。请使用 `min_format` + `max_format` 替代。
:::
