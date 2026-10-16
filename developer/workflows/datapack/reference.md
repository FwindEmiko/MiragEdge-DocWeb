---
title: 数据包工作流 · 参考规则
description: 数据包的工具链与 Leaf 校验规则速查。涵盖在线工具与 VSCode 扩展、调试命令清单、Leaf 26.1.2 对 pack.mcmeta 的四条强制校验规则与死循环陷阱。
outline: [2, 3]
---

# 数据包工作流 · 参考规则

这页集中放置工具链速查与 Leaf 的 `pack.mcmeta` 强制校验规则。

## 工具链速查

### 在线工具

| 工具 | 网址 | 用途 |
| --- | --- | --- |
| Misode | [misode.github.io](https://misode.github.io) | 全功能数据包生成器，覆盖战利品表、进度、配方、世界生成、标签 |
| MCStacker | [mcstacker.net](https://mcstacker.net) | 命令生成器，覆盖 `/give`、`/summon`、`/loot`、`/bossbar` |
| Minecraft Wiki | [minecraft.wiki](https://minecraft.wiki) | 数据包格式的社区权威参考 |
| Pack Version 对照表 | [minecraft.wiki/w/Pack_version](https://minecraft.wiki/w/Pack_version) | pack_format 与游戏版本的对应关系 |
| CE 官方文档 | [ce-pre.gtemc.cn](https://ce-pre.gtemc.cn/) | CraftEngine 配置参考 |
| CE 集成说明 | [数据包与 CraftEngine 集成](./ce-integration) | 本站的数据包与 CE 边界说明 |

### VSCode 扩展

| 扩展 | ID | 功能 |
| --- | --- | --- |
| Spyglass（DHP） | `SPGoding.datapack-language-server` | JSON 与 mcfunction 的验证、补全、跳转 |
| language-mcfunction | `arcensoth.language-mcfunction` | mcfunction 语法高亮 |
| YAML | `redhat.vscode-yaml` | CE 配置编辑时的 YAML 语法支持 |

### 调试命令

```text
# 数据包管理
/datapack list                          列出所有数据包及加载顺序
/datapack list available <namespace>    列出某命名空间下的可用内容
/datapack disable <name>                禁用一个数据包，会自动重载
/datapack enable <name>                 启用一个数据包，会自动重载

# 重载
/reload                                 重载函数、战利品表、配方、进度、谓词、标签
/ce reload                              重载 CraftEngine 全部配置
/ce reload recipe                       仅重载 CE 配方

# 函数测试
/function <namespace:path>              手动执行一个函数
/schedule function <namespace:path> <time>  延迟执行函数

# 战利品表测试
/loot give @s loot <namespace:path>     模拟战利品表给予物品
/loot spawn ~ ~ ~ loot <namespace:path> 在地面生成战利品

# 结构测试
/place template <namespace:path> [pos]  放置结构模板
/locate structure <namespace:path>      查找最近的结构

# 标签调试
/data get storage <namespace:path>      读取 NBT 存储
```

日志错误查看 `latest.log`。

## Leaf 26.1.2 pack.mcmeta 严格校验规则

::: danger Leaf 比原版更严格
Leaf 26.1.2 对 `pack.mcmeta` 的校验比原版 Minecraft 严格。原版只警告不阻止的字段问题，在 Leaf 上会直接抛出 `JsonParseException` 并跳过整个数据包。

以下 4 条规则全部必须满足，否则数据包无法加载。
:::

### 规则速查表

| # | 规则 | 触发条件 | 错误信息 | 解决方案 |
| --- | --- | --- | --- | --- |
| 1 | `min_format` 与 `max_format` 必填 | `pack_format > 81` | `Pack declares support for version newer than 81, but is missing mandatory fields min_format and max_format` | 添加 `min_format` 和 `max_format` |
| 2 | `min_format` 落在 legacy 区间时 `supported_formats` 必填 | `min_format` 在 17–81 之间 | `Pack declares support for format 81, but game versions supporting formats 17 to 81 require a supported_formats field` | 把 `min_format` 改为不小于 82 |
| 3 | `supported_formats` 已弃用 | `pack_format` 不小于 82 且包含 `supported_formats` | `Pack key supported_formats is deprecated starting from pack format 82. Remove supported_formats from your pack.mcmeta` | 移除 `supported_formats` |
| 4 | `min_format` 与 `supported_formats` 必须一致 | 同时存在两个字段且值不匹配 | `Pack version declaration mismatch between supported_formats (from X) and min_format (Y)` | 让 `min_format` 等于 `supported_formats.min_inclusive` |

### 死循环陷阱

规则 2 和规则 3 互锁。把 `min_format` 设为 81 时：

- 规则 2 要求必须有 `supported_formats`，因为 81 在 legacy 区间。
- 规则 3 又要求必须移除 `supported_formats`，因为 pack_format 82 以上已弃用。

唯一解法是让 `min_format` 不小于 82。这样既不在 legacy 区间，又满足现代格式要求。

### 最小合法 pack.mcmeta

```json
{
  "pack": {
    "pack_format": 101,
    "min_format": 82,
    "max_format": 107,
    "description": "..."
  }
}
```

验证清单：

- `pack_format` 落在 `[min_format, max_format]` 范围内。
- `min_format` 不小于 82。
- 不包含 `supported_formats` 字段。
- 三个字段使用同一种格式，全整数或全数组。
- 文件无 UTF-8 BOM，用 `utf-8` 而非 `utf-8-sig` 写入。

### 调试技巧

Mojang 的错误信息通常直接包含解决方案提示。规则 2 的错误信息末尾会写 `Add "supported_formats": [81, 81] or require a version greater or equal to 82.0`，等于直接指出把 `min_format` 改成 82 以上。

遇到 `pack.mcmeta` 报错时：

1. 完整阅读错误信息，特别是末尾的 `at position XXX: ...<--[HERE]`。
2. 按错误提示的方向修改，不要凭直觉。
3. 改完一项就重启验证，不要批量改多项再测。
