---
title: 数据包工作流 · 参考规则
description: 面向锐界幻境开发维护的数据包工作流，按前置环境、模块实现、参考规则和排错拆分。
---

# 数据包工作流 · 参考规则

## 工具链速查

### 在线工具

| 工具 | 网址 | 用途 |
|------|------|------|
| **Misode** | [misode.github.io](https://misode.github.io) | 全功能数据包生成器（战利品表/进度/配方/世界生成/标签） |
| **MCStacker** | [mcstacker.net](https://mcstacker.net) | 命令生成器（/give /summon /loot /bossbar 等） |
| **Minecraft Wiki** | [minecraft.wiki](https://minecraft.wiki) | 官方社区 Wiki，数据包格式权威参考 |
| **Pack Version** | [minecraft.wiki/w/Pack_version](https://minecraft.wiki/w/Pack_version) | pack_format 对照表 |
| **CE 官方文档** | [ce-pre.gtemc.cn](https://ce-pre.gtemc.cn/) | CraftEngine 配置参考 |
| **CE Datapack 集成** | [ce-pre.gtemc.cn](https://ce-pre.gtemc.cn/) | CE 与数据包互操作文档（按站内导航查找） |

### VSCode 扩展

| 扩展 | ID | 功能 |
|------|-----|------|
| Spyglass（DHP） | `SPGoding.datapack-language-server` | JSON/mcfunction 验证/补全/跳转 |
| language-mcfunction | `arcensoth.language-mcfunction` | mcfunction 语法高亮 |
| YAML | `redhat.vscode-yaml` | YAML 语法支持（CE 配置编辑） |

### 调试命令

```bash
# 数据包管理
/datapack list                          # 列出所有数据包及加载顺序
/datapack list available <namespace>   # 列出某命名空间下的可用内容
/datapack disable <name>               # 禁用一个数据包（会自动重载）
/datapack enable <name>                # 启用一个数据包（会自动重载）

# 重载
/reload                                 # 重载数据包（functions/loot_tables/recipes/advancements/predicates/tags 等）
/ce reload                              # 重载 CraftEngine 全部配置
/ce reload recipe                       # 仅重载 CE 配方

# 函数测试
/function <namespace:path>              # 手动执行一个函数
/schedule function <namespace:path> <time>  # 延迟执行函数

# 战利品表测试
/loot give @s loot <namespace:path>     # 模拟战利品表给予物品
/loot spawn ~ ~ ~ loot <namespace:path> # 在地面生成战利品

# 结构测试
/place template <namespace:path> [pos]  # 放置结构模板
/locate structure <namespace:path>      # 查找最近的结构

# 标签调试
/data get storage <namespace:path>      # 读取 NBT 存储

# 日志查看
# 检查服务端 latest.log 中的错误信息
```

## Leaf 26.1.2 pack.mcmeta 严格校验规则

::: danger Leaf 比 Vanilla 更严格
Leaf 26.1.2 服务端对 `pack.mcmeta` 的校验比原版 Minecraft **严格得多**。原版只警告不阻止的字段问题，在 Leaf 上会直接抛出 `JsonParseException` 并跳过整个数据包（fallback type）。

以下 4 条规则是经过实测总结的，**全部必须满足**，否则数据包无法加载。
:::

### 规则速查表

| # | 规则 | 触发条件 | 错误信息 | 解决方案 |
|---|------|----------|----------|----------|
| 1 | `min_format` / `max_format` 必填 | `pack_format > 81` | `Pack declares support for version newer than 81, but is missing mandatory fields min_format and max_format` | 添加 `min_format` 和 `max_format` |
| 2 | `min_format` 落在 legacy 区间时 `supported_formats` 必填 | `min_format` ∈ [17, 81] | `Pack declares support for format 81, but game versions supporting formats 17 to 81 require a supported_formats field` | 把 `min_format` 改为 ≥ 82 |
| 3 | `supported_formats` 已弃用 | `pack_format` ≥ 82 且包含 `supported_formats` | `Pack key supported_formats is deprecated starting from pack format 82. Remove supported_formats from your pack.mcmeta` | 移除 `supported_formats` |
| 4 | `min_format` 与 `supported_formats` 必须一致 | 同时存在两个字段且值不匹配 | `Pack version declaration mismatch between supported_formats (from X) and min_format (Y)` | 让 `min_format` = `supported_formats.min_inclusive` |

### 死循环陷阱

规则 2 和规则 3 会形成"死循环"——如果你把 `min_format` 设成 81：

- 规则 2 要求你必须有 `supported_formats`（因为 81 在 legacy 区间）
- 规则 3 又要求你必须移除 `supported_formats`（因为 pack_format 82+ 已弃用）

**唯一解法**：`min_format` 必须 ≥ **82**。这样既不在 legacy 区间（不需要 `supported_formats`），又满足现代格式要求。

### Leaf 26.1.2 最小合法 pack.mcmeta

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

**验证清单**：
- [ ] `pack_format` 落在 `[min_format, max_format]` 范围内
- [ ] `min_format` ≥ 82（避开 legacy 区间）
- [ ] 不包含 `supported_formats` 字段
- [ ] 三个字段使用同种格式（全整数或全数组，不混用）
- [ ] 文件无 UTF-8 BOM（用 `utf-8` 而非 `utf-8-sig` 写入）

### 调试技巧

Mojang 的错误信息通常**直接包含解决方案提示**。例如规则 2 的错误信息末尾会说 `Add "supported_formats": [81, 81] or require a version greater or equal to 82.0`——这等于直接告诉你"把 min_format 改成 82+"。遇到 pack.mcmeta 报错时：

1. **完整阅读错误信息**（特别是末尾的 `at position XXX: ...<--[HERE]`）
2. 按错误提示的方向修改，不要凭直觉
3. 改完一项就重启验证，不要批量改多项再测
