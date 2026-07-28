---
title: 数据包工作流 · 排错与适配
description: 面向锐界幻境开发维护的数据包工作流，按前置环境、模块实现、参考规则和排错拆分。
---

# 数据包工作流 · 排错与适配

## 常见问题与踩坑

### pack_format 对照表

| MC 版本 | pack_format（数据包） | 资源包格式 | 备注 |
|---------|----------------------|------------|------|
| 1.21 | 48 | 34 | Bundles of Bravery |
| 1.21.1 | 48 | 34 | — |
| 1.21.2 - 1.21.3 | 57 | 42 | 试炼刷怪笼更新 |
| 1.21.4 | 61 | 46 | 冬季小更新 |
| 1.21.5 | 71 | 55 | Spring to Life |
| 1.21.6 | 80 | 63 | 对话框系统 |
| 1.21.7 - 1.21.8 | 81 | 64 | — |
| 1.21.9 - 1.21.10 | 88.0 | 69 | min/max_format 引入 |
| 1.21.11 | 94.1 | 75 | 物品组件扩展 |
| **26.1 - 26.1.2** | **101.1** | **84** | **Tiny Takeover（本服版本）** |
| 26.2 | 107.1 | — | 最新版（截至 2026.07） |

::: info pack_format 的小数点是怎么回事？
自 MC 26.1 开发周期起，Mojang 引入了 **`X.Y` 小数格式** 的 pack_format（如 `101.1`、`94.1`、`107.1`）。

- **整数部分（`X`）**：主版本号，破坏性变更时递增（如 26.1 从 1.21.11 的 94 跳到 101）
- **小数部分（`Y`）**：次版本号，同一主版本内非破坏性微调时递增（如 26.1-pre-2 的 `101.0` → 26.1-pre-3 的 `101.1`）

在 `pack.mcmeta` 中可以用两种格式表示：

**整数格式**（Leaf 26.1.2 推荐，简单不易错）：
```json
{
  "pack": {
    "pack_format": 101,
    "min_format": 82,
    "max_format": 107,
    "description": "MiragEdge Data Pack"
  }
}
```

**数组格式**（精确到小数版本，对应 `101.1`）：
```json
{
  "pack": {
    "pack_format": [101, 1],
    "min_format": [82, 0],
    "max_format": [107, 0],
    "description": "MiragEdge Data Pack"
  }
}
```

::: warning 三字段格式必须一致
`pack_format` / `min_format` / `max_format` 三个字段**必须同时用整数或同时用数组**，混用会导致 Leaf 26.1.2 报错。详见[参考页的 Leaf pack.mcmeta 严格校验规则](./reference#leaf-26-1-2-pack-mcmeta-严格校验规则)。
:::
:::

> 更新到新版本时务必修改 `pack.mcmeta` 中的 `pack_format` / `min_format` 值！

### /reload 的生效边界

`/reload` **可以**热重载的内容：

- Functions（.mcfunction）
- Loot Tables（战利品表）
- Recipes（原版 JSON 配方）
- Advancements（进度）
- Predicates（谓词）
- Item Modifiers（物品修饰器）
- Tags（标签）
- Structure Templates（结构模板）

`/reload` **不能**热重载的内容（需重新进入世界或重启服务器）：

- Worldgen（世界生成配置：biome/dimension/structure_set/noise_settings 等）
- Enchantments（附魔定义）
- 盔甲纹饰（Trim Materials / Trim Patterns）
- 唱片机曲目（Jukebox Songs）
- 伤害类型（Damage Types）
- 维度（Dimensions）

> **经验法则**：修改 `data/<namespace>/worldgen/` 下的内容后，必须退出并重新进入世界，或重启服务器。

### 数据包加载顺序与 tag 合并机制

**加载顺序**：

- 数据包的加载顺序由 `/datapack list` 显示（或在创建世界界面中调整）
- 先加载的优先级**低**，后加载的优先级**高**
- 高优先级数据包的同名文件会**完全覆盖**低优先级的文件

**Tag 合并机制**：

- 标签（Tag）文件默认**合并**：多个数据包定义同名标签时，内容会被合并
- 如果希望完全覆盖（而非合并），在标签 JSON 中设置 `"replace": true`：

```json
{
  "replace": true,
  "values": [
    "miragedge:ruby_sword",
    "miragedge:flame_sword"
  ]
}
```

### CE 配方重载注意事项

- CE 配方重载命令：`/ce reload recipe`
- **Folia 服务端**：仅支持 `/ce reload recipe`，不支持 `/ce reload all`
- **配方重载有风险**：Folia 上配方管理器非线程安全，运行时重载可能导致崩溃。在 Paper/Leaf 上通常安全。
- CE 配方重载后，同时需要 `/reload` 数据包中原版配方，防止引用失效

### 其他常见坑

1. **JSON 语法错误导致静默失败**：JSON 文件有语法错误时，该文件不会加载，但游戏不会崩溃。始终使用 Misode 或 Spyglass 验证 JSON 格式。
2. **命名空间冲突**：不同数据包中同名文件会被高优先级包覆盖，注意命名空间隔离。
3. **CE 物品在结构 .nbt 中**：保存 .nbt 时确保 CE 已重载并方块状态正确。跨环境迁移时需 CE 配置完全一致。
4. **资源包未更新**：修改 CE 物品配置或贴图后，客户端可能需要重新加入服务器才能看到变化。
5. **原版 recipe 引用 CE 物品 ID**：不可行。原版 `minecraft:item` 入口只能识别 `minecraft:` 命名空间下的物品 ID。
6. **Stonecutter 配方使用 CE 物品做原料**：CE 官方不建议，可能导致客户端视觉问题。

## 下载与适配第三方数据包

### 场景说明

从 Modrinth、CurseForge、PlanetMinecraft 等平台下载的第三方数据包通常针对特定 MC 版本编写。部署到 Leaf 26.1.2 服务器前，**必须进行兼容性适配**，否则会触发 `pack.mcmeta` 校验失败、`mcfunction` 语法错误等问题。

### 适配工作流

```
1. 下载原始 zip
       ↓
2. 备份原始 zip（_original/ 子目录）
       ↓
3. 解压到工作目录
       ↓
4. 检查并修复 pack.mcmeta（见下方清单）
       ↓
5. 检查 mcfunction 语法（特别是组件测试）
       ↓
6. 重新打包 zip（UTF-8 无 BOM）
       ↓
7. 复制到 download-fixed/ 并部署到 world/datapacks/
       ↓
8. 重启服务器，检查 latest.log 无 ERROR/WARN
```

### pack.mcmeta 适配清单

| 检查项 | 旧包常见问题 | 适配方法 |
|--------|--------------|----------|
| UTF-8 BOM | Windows 编辑器保存的 JSON 带 BOM | 用 `utf-8` 编码重写（非 `utf-8-sig`） |
| `pack_format` | 旧版本号（如 48、71、81） | 改为 `101`（Leaf 26.1.2 目标版本） |
| `min_format` / `max_format` | 旧包通常没有 | 新增 `min_format: 82`, `max_format: 107` |
| `supported_formats` | 旧包可能包含 | **移除**（Leaf 26.1.2 已弃用，保留会报错） |
| `min_format` 值 | 适配者常误设为 81 | **必须 ≥ 82**（否则触发 legacy 死循环） |
| 字段格式一致性 | min/max 混用整数和数组 | 三个字段统一用整数或统一用数组 |

### mcfunction 语法检查清单

第三方包的 mcfunction 文件常见兼容性问题：

| 问题 | 现象 | 解决方案 |
|------|------|----------|
| 旧版 `/give` NBT 语法 | `give @s diamond{display:{Name:...}}` | 转换为 1.20.5+ 组件格式 |
| 旧版附魔检测 | `execute if data entity @s Items[0].tag.Enchantments...` | 用 `execute if items ... *[minecraft:enchantments~[...]]` |
| 旧版选择器参数 | `@e[type=minecraft:pig,nbt={...}]` | 改用 `execute if data` 或 predicate |
| 组件测试语法错误 | `*[minecraft:enchantments~{levels:...}]`（对象） | 改为列表 `*[minecraft:enchantments~[{...}]]` |

::: warning 不要随意改写 mcfunction 语法
**重要教训**：如果原作者的 mcfunction 语法看起来"奇怪"但能正常加载，**不要凭直觉修改**。例如 `*[minecraft:enchantments~[{silk_touch:1}]]` 看起来像是缺了 `minecraft:` 前缀，但实际上这是合法的简写形式。

修改前先在测试世界验证，或查阅 [Minecraft Wiki - Item predicate](https://minecraft.wiki/w/Item_predicate) 确认语法。错误修改可能导致 `Malformed predicate` 错误。
:::

### loot table 适配

第三方包的 loot table 常见问题：

| 问题 | 现象 | 解决方案 |
|------|------|----------|
| `alternatives` 入口全部带 weight 但无 condition | `Unreachable entry!` 警告 | 改为 `minecraft:group`（无条件的加权选择不应使用 alternatives） |
| 入口放在 `functions` 数组而非 `pools` | `set_loot_table` 解析失败 | 把入口移到 `pools` 数组中 |
| 旧版 `entry` 字段名 | 1.20+ 已改名为 `entries` | 批量替换 |

### 部署验证清单

部署适配后的数据包后，检查 `latest.log`：

- [ ] 无 `Error reading pack metadata, attempting fallback type` 警告
- [ ] 无 `Failed to load function` 错误
- [ ] 无 `Couldn't load tag` 错误
- [ ] 无 `Unreachable entry!` 警告
- [ ] 数据包出现在 `/datapack list` 输出中
- [ ] 服务器正常启动无 ERROR

### 推荐目录结构

```
F:\FCelestial\datapacks\
├── new-fun\                          # 新下载包的工作目录
│   ├── <Pack>.zip                    # 适配后的 zip
│   ├── _original\                   # 原始 zip 备份（重要！）
│   └── _extracted\                  # 解压后的工作副本
└── download-fixed\                   # 适配完成、待部署的 zip
    ├── <Pack>.zip
    └── ...
```

::: tip 一定要备份原始 zip
适配过程可能需要多次迭代（Leaf 的报错往往一项触发一项）。保留原始 zip 备份可以让你随时从干净的起点重新开始，避免在已修改的版本上叠加错误。
:::

## AI 使用指南

### 本文档覆盖范围声明

本文档覆盖以下能力边界内的任务：

| 能力 | 覆盖 | 不覆盖 |
|------|------|--------|
| 数据包项目搭建 | ✅ 完整结构 | — |
| mcfunction 编写 | ✅ 通用逻辑、CE 物品检测 | 复杂红石/命令方块逻辑 |
| 原版配方 | ✅ 所有类型 | — |
| CE 配方 | ✅ 基础/烧炼/附魔结果 | 高级 post-processor、自定义 event |
| 战利品表 | ✅ 方块/生物/箱子 | 高级 predicate 条件组合 |
| CE 物品 | ✅ 属性/附魔/食物/装备 | 高级 behavior、家具、client-bound-data |
| CE 方块 | ✅ 基础方块/战利品表 | 多状态复杂方块、方块 behavior |
| 结构 | ✅ 单模板结构 | 拼图结构（Jigsaw）大型拼接 |
| 世界生成 | ✅ CE 方块 provider | 复杂的自定义维度/噪声 |

### 使用流程

当用户提出 MC 数据包或 CraftEngine 开发请求时，AI 应按以下流程执行：

```
第 1 步：阅读概述与前知知识
  → 确认命名空间、版本、环境约束

第 2 步：匹配功能模块
  → 从 6 大模块中定位相关章节

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制的代码文件
  → 附带验证命令
  → 标注需要手动操作的步骤
```

### 命名/路径/命令规范

AI 生成的所有代码必须遵循以下规范：

- **命名空间**：`miragedge`（除非用户另有指定）
- **pack_format**：`101`（MC 26.1.2，以实际环境为准）
- **文件路径**：使用 `data/miragedge/<type>/<path>.json` 格式
- **CE 物品 ID**：`miragedge:<snake_case_name>`
- **函数路径**：`miragedge:<category>/<function_name>`
- **命令中的 ID**：始终使用完整命名空间（不要省略 `miragedge:`）

### 未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方文档**：优先访问 [Minecraft Wiki](https://minecraft.wiki) 或 [CE 官方文档](https://ce-pre.gtemc.cn/)
2. **参考原版数据包**：Minecraft 内置原版数据包是最佳参考，路径：`<server.jar>/data/minecraft/`
3. **使用 Misode 辅助**：不确定 JSON 格式时，用 Misode 生成器可视化编辑，然后导出
4. **增量验证**：每完成一个模块配置后即用验证命令测试，不要等全部写完再测试
5. **保守提示**：对于文档未明确覆盖的功能，向用户说明不确定性，并给出最佳实践建议

### 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个代码块可直接复制使用，占位符需明确标注
2. **完整**：包含文件路径注释（如 `// data/miragedge/loot_table/blocks/xxx.json`）
3. **可验证**：每个模块附带验证命令
4. **有上下文**：说明文件之间的依赖关系
5. **区分 CE/原版**：明确标注使用 CE YAML 还是数据包 JSON

## 参考资源

### 官方文档与 Wiki

- [Minecraft Wiki - 数据包](https://minecraft.wiki/w/Data_pack)
- [Minecraft Wiki - Pack Version（pack_format 对照表）](https://minecraft.wiki/w/Pack_version)
- [Minecraft Wiki - 教程：创建数据包](https://minecraft.wiki/w/Tutorials/Creating_a_data_pack)
- [Minecraft Wiki - 教程：自定义结构生成](https://minecraft.wiki/w/Tutorials/Custom_structures)
- [Minecraft Wiki - 命令参考](https://minecraft.wiki/w/Commands)
- [Minecraft Wiki - 战利品表](https://minecraft.wiki/w/Loot_table)

### CraftEngine

- [CraftEngine 官方文档](https://ce-pre.gtemc.cn/) - 配置参考
- [CraftEngine Datapack 集成](https://ce-pre.gtemc.cn/) - 按站内导航查找互操作章节
- [CraftEngine 源码仓库](https://github.com/Xiao-MoMi/craft-engine) - 实现与版本核对
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine) - 辅助阅读
- [CraftEngine GitHub](https://github.com/Xiao-MoMi/craft-engine) - 项目仓库
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine) - 社区维护详细文档

### 在线工具

- [Misode Data Pack Generators](https://misode.github.io) - 数据包可视化生成器
- [Misode Version Explorer](https://misode.github.io/versions) - 版本/pack_format 查询
- [MCStacker](https://mcstacker.net) - 命令生成器

### VSCode 扩展

- [Spyglass（Datapack Helper Plus）](https://marketplace.visualstudio.com/items?itemName=SPGoding.datapack-language-server) - MC 数据包开发扩展
- [language-mcfunction](https://marketplace.visualstudio.com/items?itemName=arcensoth.language-mcfunction) - mcfunction 语法高亮

### 原版数据包参考

- Minecraft 内置原版数据包位于 `<server.jar>/data/minecraft/`，可用解压工具提取作为参考
- [misode/mcmeta](https://github.com/misode/mcmeta) - Minecraft 数据生成 JSON 元数据

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 MC 版本和 CraftEngine 版本更新。如有疑问或建议，请联系开发团队。
