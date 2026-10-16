---
title: 数据包工作流
description: 数据包工作流总览。覆盖命名空间约定、函数与战利品表等六类内容、Leaf 的版本校验规则、CraftEngine 集成边界，以及从编写到回滚的完整链路。
outline: [2, 3]
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, 数据包, datapack, CraftEngine, AI Skills, mcfunction, loot table, recipe"
---

# 数据包工作流

数据包负责逻辑：函数、战利品表、配方、生物掉落、结构。资源和视觉呈现交给 CraftEngine。

## 什么时候用数据包

| 需求 | 归属 |
| --- | --- |
| 定时逻辑、状态检测、条件分支 | 数据包函数 |
| 方块掉落、生物掉落、箱子内容 | 战利品表 |
| 合成、烧炼、切石 | 配方 |
| 世界生成结构、结构池 | 结构 |
| 物品外观、模型、贴图 | CraftEngine |
| 方块注册、方块状态 | CraftEngine |

数据包在 Leaf 26.1.2 后端加载，命名空间统一为 `miragedge`。

## 阅读顺序

先读前置与环境，确认版本、目录与测试条件。再按需求进入对应的内容类型页。遇到加载失败或校验报错时，查参考规则与排错页。

<SmartImage src="/images/developer/workflows/datapack/stage-flow.svg"
  alt="数据包工作流四阶段循环图：编写、校验、部署、回滚" caption="图 1：数据包的四个阶段——编写（函数 / 战利品表 / 配方 / 生物 / 结构）→ 校验（/reload、/function、日志）→ 部署（datapacks/ 与版本锁定）→ 回滚（保留上一版可加载包）" width="880" />

## 页面索引

| 页面 | 内容 |
| --- | --- |
| [前置与环境](./prerequisites) | 命名空间、pack_format、JSON 与 mcfunction 语法、开发工具、目录树 |
| [函数](./modules/functions) | mcfunction 写法、load/tick 标签、组件测试语法 |
| [战利品表](./modules/loot-tables) | pools/entries 结构、方块与生物掉落、CE 物品入口 |
| [配方](./modules/recipes) | 原版 JSON 配方与 CE YAML 配方的选择与写法 |
| [生物掉落](./modules/mob-drops) | 覆盖原版掉落、谓词条件、CE 实体掉落 |
| [CE 物品](./modules/ce-items) | CE 物品与装备的 YAML 结构、数据组件速查 |
| [结构](./modules/structures) | .nbt 模板、结构池、结构集、世界生成中的 CE 方块 |
| [CraftEngine 集成](./ce-integration) | 数据包与 CE 的职责边界、物品 ID 引用规则、CE 命令 |
| [参考规则](./reference) | 工具链、调试命令、Leaf 的 pack.mcmeta 严格校验规则 |
| [排错与适配](./troubleshooting) | pack_format 对照、/reload 生效边界、第三方包适配 |
| [AI 交付规范](./ai-guide) | 能力边界、执行流程、命名规范 |
| [通用交付标准](../_shared/ai-delivery) | 所有工作流共用的输出格式要求 |

## 校验

每写完一个模块就验证一次，不要最后批量验证。

1. 执行 `/reload` 重载数据包。
2. 执行 `/function miragedge:<函数路径>` 手动触发。
3. 执行 `/datapack list` 确认包已启用。
4. 检查 `latest.log` 无 `Failed to load function` 或 `Couldn't load tag`。

::: warning 三类内容不随 /reload 生效
世界生成、附魔定义、盔甲纹饰必须重启服务器。详见[排错页的 /reload 生效边界](./troubleshooting#reload-的生效边界)。
:::

## 排错

| 现象 | 优先检查 |
| --- | --- |
| 数据包未出现在 `/datapack list` | `pack.mcmeta` 字段与 UTF-8 BOM |
| 函数未执行 | 标签文件路径与 `replace` 字段 |
| JSON 无报错但不生效 | 文件路径层级、命名空间拼写 |
| 修改后无变化 | 命中的是缓存还是热重载边界 |
| CE 物品在战利品表中不产出 | 入口类型是否为 `craftengine:item` |
