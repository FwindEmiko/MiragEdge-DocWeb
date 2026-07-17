---
title: "CE 材质引擎工作流 · AI Skills 文档"
description: "面向 AI 编码助手的 CraftEngine 材质贴图开发完整指南，覆盖贴图制作、材质绑定物品、字符码注册管理、命名空间管理 4 大模块的五步闭环工作流。"
icon:
  icon: 🎨
outline: deep
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, CraftEngine, 材质贴图, 资源包, AI Skills, texture, resource pack, font, 字符映射"
---

# CE 材质引擎工作流 · AI Skills 文档

## 概述

### 文档定位

本文档是一份**面向 AI 编码助手**（如 Claude Code、Trae、WorkBuddy、GitHub Copilot 等）的 CraftEngine 材质贴图开发技能指南。其目的是将隐性的开发经验固化为可移植、可复用的显性知识文档。

> 当然，给人类用于学习研究与参考也是可以的啦

任何不熟悉 CE 材质的 AI 在阅读本文档后，应能**独立完成以下任务**：

- 创建自定义物品纹理 PNG 文件（16×16 / 32×32）
- 通过 CraftEngine 配置注册纹理并绑定到 CE 自定义物品
- 管理字体字符映射文件（`font/default.json`）
- 按命名空间组织贴图文件层级
- 调试纹理渲染问题

### 适用场景

- 为 Minecraft 服务器（Paper/Leaf 及其分支）开发 CE 自定义物品贴图
- 通过 CraftEngine 插件（社区版 v26.7）管理材质纹理与字体映射
- 资源包（Resource Pack）与 CE 物品配置的协同开发
- 将服务器贴图开发流程标准化、文档化

### 技术栈总览

| 层级 | 技术 | 用途 |
|------|------|------|
| 服务端 | Leaf（Paper 分支） | Minecraft 服务端核心 |
| 插件 | CraftEngine v26.7（社区版） | 自定义物品 / 材质绑定 / 字体映射 |
| 资源包 | MC Resource Pack（pack_format 84） | 纹理 PNG + 字体 JSON |
| 图像工具 | Paint.NET / GIMP / Aseprite | 16×16 像素贴图编辑 |
| 在线工具 | Minecraft 纹理生成器 / CE Wiki | 参考与验证 |

### 服务器环境约束

本文档所有内容基于以下真实服务器环境：

| 项目 | 值 |
|------|-----|
| 服务端 | Leaf（Paper 分支） |
| MC 版本 | 26.1.2（Java Edition） |
| pack_format（资源包） | **84** |
| CraftEngine | 社区版 v26.7 |
| CE 资源包目录 | `plugins/CraftEngine/resources/` |
| 字体映射文件 | `assets/minecraft/font/default.json` |
| 贴图分辨率 | 16×16（推荐）/ 32×32 |
| 字符编码范围 | Unicode Private Use Area（U+E000–U+F8FF） |
| 命名空间前缀 | `miragedge:items_skin/...` |

::: warning pack_format 以实际为准
pack_format 随游戏版本变化。本文编写时 MC 26.1.2 对应资源包 **pack_format 84**。
若服务器版本不同，请查阅 [pack_format 对照表](https://misode.github.io/versions) 获取最新值。
:::

### 与数据包工作流的关系

CE 材质引擎工作流与数据包工作流的边界：

- **CE 材质引擎**负责：纹理 PNG 制作 → 字符映射 → 材质绑定到 CE 物品
- **数据包工作流**负责：mcfunction、loot table、recipe、结构
- **衔接点**：CE 物品创建后，可在数据包的 loot table 中以 `craftengine:item` 类型引用

## 前置知识

### CraftEngine 材质系统架构

CraftEngine 的材质渲染链路：

```
物品定义 (yml)
  └── texture 字段指定命名空间路径
        └── 资源包中对应的 PNG 文件
              └── font/default.json 中的字符映射
                    └── 游戏内渲染显示
```

整个链路的核心流程：YAML 中声明 `texture` → CE 自动匹配资源包 PNG → CE 自动生成字体字符映射 → 客户端渲染。

### 命名空间规则

CE 贴图存放于 `plugins/CraftEngine/resources/resourcepack/` 下的命名空间目录中，按用途分类：

```
plugins/CraftEngine/resources/resourcepack/
├── assets/
│   └── miragedge/
│       └── textures/
│           ├── items_skin/          # 物品皮肤贴图
│           │   ├── weapons/         # 武器
│           │   ├── tools/           # 工具
│           │   ├── armor/           # 盔甲
│           │   ├── food/            # 食物
│           │   ├── items/           # 杂项物品
│           │   └── icons/           # 图标
│           ├── gui/                 # GUI 界面贴图
│           │   └── rank_tab/        # 身份标牌
│           ├── effects/             # 粒子/效果
│           └── blocks/              # 方块贴图
└── ... (原版资源包文件)
```

**关键规则**：

- 命名空间仅允许小写字母、数字、下划线和连字符（`a-z`、`0-9`、`_`、`-`）
- CE 中的 `texture` 字段格式：`miragedge:items_skin/weapons/flame_sword`
- 此路径映射到实际文件系统中的 `assets/miragedge/textures/items_skin/weapons/flame_sword.png`
- CE 内部的 `texture` 值**不含** `assets/` 和 `textures/` 前缀——这是 CE 自动拼接的

### 字符映射原理

Minecraft 使用 `font/default.json` 中的 `providers` 数组，通过 bitmap 类型将 Unicode 字符映射到纹理 PNG 的指定区域。一个典型的条目如下：

```json
{
  "type": "bitmap",
  "file": "miragedge:items_skin/icons/money.png",
  "chars": ["\uE028"],
  "height": 8,
  "ascent": 8
}
```

CraftEngine **自动生成并管理**此映射。AI 开发者通常只需要：

- 在 CE 物品 YAML 中声明 `texture` 字段
- CE 自动注册字符码到字体文件
- 少数高级场景（自定义 GUI 图标、Rank 标牌）才需手动干预字符码

### 纹理格式要求

| 属性 | 要求 |
|------|------|
| 格式 | PNG（支持透明背景） |
| 推荐分辨率 | 16×16 像素 |
| 最大分辨率 | 32×32 像素（超过会增大资源包体积，不推荐） |
| 色彩模式 | RGB 或索引色 |
| 背景 | **必须为透明**（物品贴图） |

## 开发环境搭建

### 1. VSCode 扩展

| 扩展 | ID | 功能 |
|------|-----|------|
| YAML | `redhat.vscode-yaml` | YAML 语法验证与自动补全 |
| PNG Preview | 内置 / `msjsdiag.vscode-png` | 贴图预览 |
| Spyglass（DHP） | `SPGoding.datapack-language-server` | 可选，资源包 JSON 验证 |

### 2. 在线工具

#### CE 官方 Wiki

- **中文 Wiki**：[https://ce.gtemc.cn/zh-Hans/](https://ce.gtemc.cn/zh-Hans/) — 材质配置中文参考
- **英文 Wiki**：[https://xiao-momi.github.io/craft-engine-wiki/](https://xiao-momi.github.io/craft-engine-wiki/) — 完整配置参考，更新更及时
- **纹理配置详解**：[https://xiao-momi.github.io/craft-engine-wiki/configuration/item/texture](https://xiao-momi.github.io/craft-engine-wiki/configuration/item/texture) — texture 字段全部选项

#### 像素画工具

- [Paint.NET](https://www.getpaint.net/) — 免费 Windows 像素编辑
- [GIMP](https://www.gimp.org/) — 跨平台图像编辑
- [Aseprite](https://www.aseprite.org/) — 专业像素动画编辑器（付费）
- [Piskel](https://www.piskelapp.com/) — 在线像素画编辑器（免费）

#### Minecraft 纹理参考

- [Minecraft Wiki - 资源包](https://minecraft.wiki/w/Resource_pack) — 资源包格式官方参考
- [Minecraft Wiki - Font](https://minecraft.wiki/w/Font) — 字体映射格式

### 3. 测试世界配置

建议创建一个独立的**超平坦创造模式世界**用于贴图测试：

**测试世界要求**：

- 游戏模式：创造（Creative）
- 世界类型：超平坦（Superflat）
- 开启作弊（Cheats enabled）
- 确保服务器资源包已启用（`server.properties` 中 `require-resource-pack=false` 便于调试）

**核心验证命令**：

```bash
# 重载 CE 全部配置（会重新生成资源包）
/ce reload

# 获取 CE 物品测试材质
/ce item get miragedge:xxx

# 检查资源包加载状态
/resourcepack reload

# 列出所有 CE 物品
/ce list
```

## 核心工作流

> **核心方法论**：每个功能模块均遵循「**概念 → 设计 → 编写 → 验证 → 部署**」五步闭环。AI 应按此流程逐模块推进。

### 模块 1：物品贴图制作

#### 概念

每个 CE 自定义物品需要一个独立的 PNG 贴图文件，存放在资源包的正确路径下。贴图是物品视觉呈现的基础，CE 通过 `texture` 字段将其与物品定义关联。

#### 设计

在创建贴图前，确定以下要素：

- **尺寸**：16×16（推荐），如需更高精度可用 32×32
- **存储路径**：按物品类型选择 `items_skin/` 下的子目录（`weapons/`、`tools/`、`food/` 等）
- **文件名**：使用 snake_case，如 `flame_sword.png`、`carrot_pickaxe.png`
- **视觉风格**：与服务器整体美术风格一致

参考项目贴图目录树示例：

```
items_skin/
├── weapons/                   # 武器
│   ├── flame_sword.png
│   ├── ice_blade.png
│   └── thunder_axe.png
├── tools/                     # 工具
│   ├── carrot_pickaxe.png
│   └── magic_hoe.png
├── armor/                     # 盔甲
│   └── phantom_chestplate.png
├── food/                      # 食物
│   ├── golden_apple_pie.png
│   └── sushi.png
├── items/                     # 杂项
│   ├── spirit_leaf.png
│   ├── starscar_gem.png
│   └── dust.png
├── icons/                     # 图标
│   ├── money.png
│   ├── info.png
│   ├── chat.png
│   └── time.png
└── gui/                       # GUI
    └── rank_tab/
        ├── vip.png
        ├── mvp.png
        └── npc.png
```

#### 编写

使用图像编辑工具创建 PNG 文件：

1. 新建 16×16 像素画布，背景设为透明
2. 绘制物品图形，保持与原版 MC 风格协调
3. 导出为 PNG 格式，确保透明通道正确

CE 物品 YAML 中引用贴图的声明方式：

```yaml
# CE 物品配置中的纹理声明
texture: miragedge:items_skin/weapons/flame_sword
```

此路径对应的实际文件位置：

```
plugins/CraftEngine/resources/resourcepack/assets/miragedge/textures/items_skin/weapons/flame_sword.png
```

> **路径对应规则**：CE 的 `texture: namespace:path` 映射为 `assets/namespace/textures/path.png`。即在 YAML 中省略 `assets/` 和 `textures/` 前缀以及 `.png` 扩展名。

#### 验证

```bash
# 1. 确认 PNG 文件已放入正确路径
ls plugins/CraftEngine/resources/resourcepack/assets/miragedge/textures/items_skin/weapons/

# 2. 重载 CE（自动重新生成资源包）
/ce reload

# 3. 获取对应物品进行视觉检查
/ce item get miragedge:flame_sword

# 4. 手持物品，观察材质是否正确渲染
# 5. 若材质未显示（显示为紫黑方块）：
#    - 检查 PNG 文件路径是否与 texture 字段一致
#    - 检查 PNG 分辨率是否为 16×16 或合法值
#    - 检查服务端日志中是否有 ResourcePack 相关错误
```

#### 部署

1. 将 PNG 文件放入 `plugins/CraftEngine/resources/resourcepack/assets/miragedge/textures/` 对应子目录
2. 在 CE 物品 YAML 中声明 `texture` 字段指向该 PNG
3. 执行 `/ce reload`（自动重新生成资源包）
4. 客户端重新加入服务器以获取更新后的资源包

### 模块 2：材质绑定到 CE 物品

#### 概念

CE 物品通过 YAML 配置文件中的 `texture` 字段指定贴图。CE 支持单纹理（最常见）和分层纹理（base + overlay）两种模式。材质绑定是将"画好的 PNG"和"游戏内的物品"关联起来的关键步骤。

#### 设计

在绑定前确定物品的：

- **命名空间 ID**：如 `miragedge:flame_sword`
- **物品类型（material）**：SWORD、PICKAXE、DIAMOND 等（决定底层行为）
- **texture 路径**：指向已存在的 PNG 文件
- **custom-model-data**：自定义模型数据值，用于区分同一基础物品的不同变体
- **是否需要多层纹理**：大多数物品仅需单层，特殊效果（发光、渐变）可能需要 base + overlay

#### 编写

完整的 CE 物品配置示例：

```yaml
# plugins/CraftEngine/resources/items/weapons/flame_sword.yml
miragedge:flame_sword:
  display:
    name: "<gradient:#FF6B6B:#FFE66D>焰之剑"
  components:
    - type: component
      data:
        item:
          material: DIAMOND_SWORD          # 基础材质（决定底层行为）
          custom-model-data: 1001           # CMD 值，用于材质映射
  texture: miragedge:items_skin/weapons/flame_sword  # 贴图绑定
  attributes:
    - type: attribute
      data:
        attribute: attack_damage
        amount: 8
        operation: ADD_NUMBER
```

**texture 字段的高级用法**（多层纹理）：

```yaml
# 分层纹理示例——底部为 base，上部为 overlay
texture:
  path: miragedge:items_skin/weapons/enchanted_blade
  layers:
    - miragedge:items_skin/weapons/enchanted_blade_base
    - miragedge:items_skin/effects/glow_overlay
```

**texture 字段的字符码控制**（高级场景）：

```yaml
# 手动控制字符码（通常由 CE 自动处理，仅在 GUI 图标等场景需要）
texture:
  path: miragedge:items_skin/icons/money
  ascent: 8       # 字符上升高度
  height: 8       # 字符显示高度
```

#### 验证

```bash
# 1. 重载 CE 配置
/ce reload

# 2. 获取物品
/ce item get miragedge:flame_sword

# 3. 手持观察材质显示
# 若显示为紫黑方块 → 贴图路径错误或 PNG 缺失
# 若显示为原版物品贴图 → texture 字段未生效，检查 YAML 缩进

# 4. 确认 custom-model-data 正确
/data get entity @s SelectedItem
# 检查输出中的 custom_model_data 组件值是否匹配配置

# 5. 多层纹理验证
# 分别检查 base 和 overlay 是否都正确渲染
```

#### 部署

1. 物品 YAML 放入 `plugins/CraftEngine/resources/items/` 下对应子目录
2. 贴图 PNG 放入对应的资源包纹理路径
3. 执行 `/ce reload`
4. 客户端重新加入服务器以获取更新后的资源包

### 模块 3：字体字符码注册与管理

#### 概念

CraftEngine **自动**将物品的 `texture` 字段映射为 Unicode Private Use Area（U+E000–U+F8FF）的字符码，写入 `font/default.json`。

大多数情况下 AI 无需手动管理字符码——只需在 YAML 中声明 `texture`，CE 自动完成注册。少数需要手动管理的场景包括：

- 自定义 GUI 图标（如计分板上的货币图标）
- Rank 身份标牌（聊天栏中的前缀图标）
- 需要在聊天/书签/告示牌中直接渲染的贴图字符

#### 设计

- 确定需要**手动注册字符码**的贴图数量
- 确保新字符码不与已有字符冲突（参考 [附录：贴图字符码速查表](#附录贴图字符码速查表)）
- 字符码范围应保持在 **U+E000–U+F8FF**（Unicode Private Use Area）
- CE 自动分配的字符码按注册顺序递增，一般从 `\uE000` 开始

#### 编写

CE 自动管理模式下，无需手动编写 `font/default.json`——CE 在 `/ce reload` 时自动生成：

```json
// CE 自动生成的 font/default.json 片段（无需手写）
{
  "providers": [
    {
      "type": "bitmap",
      "file": "miragedge:items_skin/icons/money.png",
      "chars": ["\uE028"],
      "height": 8,
      "ascent": 8
    }
  ]
}
```

对于需要手动控制的场景（如 Rank 标牌），可在 CE 物品配置中附带字符码设置：

```yaml
# CE 物品配置中控制字符码渲染参数
texture:
  path: miragedge:gui/rank_tab/vip
  ascent: 8
  height: 9
```

#### 验证

```bash
# 1. 重载 CE
/ce reload

# 2. 获取带有字符码的物品
/ce item get miragedge:xxx

# 3. 在聊天框中测试字符渲染
# 发送包含 Unicode 字符的消息，检查是否显示为预期贴图

# 4. 检查 font/default.json 是否包含正确的字符映射
# 路径：plugins/CraftEngine/resources/resourcepack/assets/minecraft/font/default.json
# 确认 providers 数组中包含对应条目的 "chars" 和 "file" 字段

# 5. 验证字符码不冲突
# 检查 font/default.json 中无重复的 chars 值
```

#### 部署

1. CE 自动管理字符码注册，无需手动部署 `font/default.json`
2. 重载 CE 后，客户端自动下载更新后的资源包
3. 若手动修改了 `font/default.json`，需确保与服务端 `/ce reload` 生成的文件一致

### 模块 4：物品皮肤命名空间管理

#### 概念

贴图文件按类型组织在 `items_skin/` 下的子目录中，保持结构清晰可维护。命名空间管理关注的是"目录结构怎么放"和"YAML 中的路径怎么写"之间的一致性。

#### 设计

项目贴图目录规划原则：

| 子目录 | 用途 | 示例文件 |
|--------|------|----------|
| `weapons/` | 武器 | `flame_sword.png`、`ice_blade.png` |
| `tools/` | 工具 | `carrot_pickaxe.png`、`magic_hoe.png` |
| `armor/` | 盔甲 | `phantom_chestplate.png` |
| `food/` | 食物 | `golden_apple_pie.png` |
| `items/` | 杂项物品/材料 | `spirit_leaf.png`、`dust.png` |
| `icons/` | 小图标（GUI/计分板） | `money.png`、`info.png` |
| `gui/rank_tab/` | Rank 标牌 | `vip.png`、`mvp.png` |

**新增贴图时的决策流程**：

```
这张贴图是什么？
  ├── 武器 → items_skin/weapons/
  ├── 工具 → items_skin/tools/
  ├── 盔甲 → items_skin/armor/
  ├── 食物 → items_skin/food/
  ├── 材料/杂项 → items_skin/items/
  ├── GUI 小图标 → items_skin/icons/
  └── 身份标牌 → gui/rank_tab/
```

#### 编写

命名空间管理不需要特殊的配置语法——目录结构由资源包中 PNG 文件的位置决定，CE 通过 `texture: 命名空间:路径` 关联。核心规则：

```yaml
# texture 值 = 命名空间:子目录/文件名（不含扩展名）
texture: miragedge:items_skin/weapons/flame_sword
#           ──┬──  ────┬────  ──┬───  ───┬────
#             │        │        │         └─ 文件名（对应 flame_sword.png）
#             │        │        └─────────── 子类型分类
#             │        └──────────────────── 顶层分类
#             └───────────────────────────── 命名空间（固定 miragedge）
```

实际文件位置：
```
assets/miragedge/textures/items_skin/weapons/flame_sword.png
```

#### 验证

```bash
# 1. 列出所有 CE 物品
/ce list

# 2. 随机抽取几个物品进行材质检查
/ce item get miragedge:flame_sword
/ce item get miragedge:carrot_pickaxe

# 3. 检查材质缺失
# 查看服务器日志中是否有 ResourcePack 相关错误或警告
# 关键词：Missing texture、FileNotFoundException

# 4. 确认目录结构一致性
ls plugins/CraftEngine/resources/resourcepack/assets/miragedge/textures/items_skin/
# 对比 YAML 中 texture 值，确认每个引用的 PNG 都存在
```

#### 部署

新增贴图的部署流程：

```
1. 将 PNG 放入对应分类目录
       ↓
2. 在 CE 物品 YAML 中声明 texture 字段
       ↓
3. /ce reload
       ↓
4. 客户端重新加入，资源包自动更新
```

## 使用流程

### 本文档覆盖范围声明

本文档覆盖以下能力边界内的任务：

| 能力 | 覆盖 | 不覆盖 |
|------|------|--------|
| 贴图 PNG 制作 | ✅ 16×16/32×32 规范 | 复杂像素画技法 |
| CE 物品材质绑定 | ✅ texture 字段全部用法 | 家具（Furniture）材质 |
| 字体字符码注册 | ✅ CE 自动管理 + 手动场景 | 自定义字体字形 |
| 命名空间管理 | ✅ 完整目录规范 | 多命名空间混合部署 |
| 资源包结构 | ✅ CE 自动生成 + 手动补充 | 手写完整资源包 |
| 多层纹理 | ✅ base + overlay | 三层及以上的复杂分层 |
| 调试与验证 | ✅ 完整验证命令集 | 客户端渲染管线调试 |

### AI 执行流程

当用户提出 CE 材质或贴图开发请求时，AI 应按以下流程执行：

```
第 1 步：阅读概述与前置知识
  → 确认命名空间（miragedge）、pack_format（84）、环境约束

第 2 步：匹配功能模块
  → 从 4 大模块中定位相关章节：
     - 画贴图 → 模块 1
     - 绑定物品 → 模块 2
     - 字符码问题 → 模块 3
     - 目录组织 → 模块 4

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制使用的代码/YAML 配置
  → 附带验证命令
  → 标注需要手动操作的步骤（如 PNG 绘制）
```

## 命名/路径/命令规范

### 命名规范

| 类型 | 规范 | 正确示例 | 错误示例 |
|------|------|----------|----------|
| PNG 文件名 | snake_case | `flame_sword.png` | `FlameSword.png` |
| 贴图命名空间路径 | `miragedge:类别/文件名` | `miragedge:items_skin/weapons/flame_sword` | `miragedge:Flame_Sword` |
| CE 物品 ID | `miragedge:snake_case_name` | `miragedge:flame_sword` | `miragedge:FlameSword` |
| texture 字段 | 完整路径（不含 assets/ 和 textures/ 前缀，不含 .png 扩展名） | `miragedge:items_skin/weapons/flame_sword` | `miragedge:textures/items_skin/weapons/flame_sword.png` |

### 路径对应规则

| YAML 中的值 | 实际文件系统路径 |
|-------------|-----------------|
| `texture: miragedge:items_skin/weapons/flame_sword` | `assets/miragedge/textures/items_skin/weapons/flame_sword.png` |
| `texture: miragedge:gui/rank_tab/vip` | `assets/miragedge/textures/gui/rank_tab/vip.png` |
| `texture: miragedge:items_skin/icons/money` | `assets/miragedge/textures/items_skin/icons/money.png` |

> **记忆口诀**：YAML 里写 `namespace:类别/子类别/文件名`，系统自动拼成 `assets/namespace/textures/类别/子类别/文件名.png`。

### 核心命令速查

```bash
# CraftEngine
/ce reload                          # 重载 CE 全部配置（自动重新生成资源包）
/ce item get <namespace:id> [数量]   # 获取 CE 物品
/ce list                            # 列出所有 CE 注册物品

# 资源包
/resourcepack reload                # 客户端重新加载资源包

# 调试
/data get entity @s SelectedItem    # 查看手持物品的完整 NBT 数据
```

## 未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅 CE 官方文档**：优先访问 [CE Wiki（英文）](https://xiao-momi.github.io/craft-engine-wiki/) 或 [CE Wiki（中文）](https://ce.gtemc.cn/zh-Hans/)，搜索与问题相关的配置项
2. **检查服务端日志**：CE 在加载配置时会输出详细日志，路径为 `logs/latest.log`，搜索关键词 `CraftEngine` 或 `ResourcePack`
3. **增量验证**：每完成一个步骤（PNG 放入 → YAML 编写 → 重载）后用验证命令立即测试，不要等所有步骤完成后再验证
4. **紫黑方块诊断**：若物品显示为紫黑方块（Missing Texture），排查顺序为：
   - PNG 文件是否存在于正确路径
   - YAML 中 `texture` 字段的命名空间路径是否与文件路径一致
   - 资源包是否已被客户端下载（客户端重进服务器）
5. **保守提示**：对于文档未明确覆盖的功能（如自定义家具材质、三维模型贴图），向用户说明此处已超出本文档范围，并建议查阅 CE 官方 Wiki 对应章节

## 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个代码块可直接复制使用，占位符需明确标注
2. **完整**：YAML 配置包含所有必要字段和注释，PNG 文件路径标注清楚
3. **可验证**：每个模块附带验证命令
4. **有上下文**：说明文件之间的依赖关系（如 PNG 与 YAML 的路径对应关系）
5. **区分自动/手动**：明确标注哪些操作由 CE 自动处理（如字符码注册），哪些需要手动操作（如 PNG 绘制）
6. **路径注释**：YAML 配置中标注对应的文件系统路径

## 参考资源

### 官方文档与 Wiki

- [CraftEngine 官方 Wiki（中文）](https://ce.gtemc.cn/zh-Hans/) — 中文配置参考
- [CraftEngine Wiki（英文）](https://xiao-momi.github.io/craft-engine-wiki/) — 完整英文文档
- [CE 纹理配置详解](https://xiao-momi.github.io/craft-engine-wiki/configuration/item/texture) — texture 字段全部选项
- [CE 资源包配置](https://xiao-momi.github.io/craft-engine-wiki/configuration/resourcepack) — 资源包自动生成机制
- [Minecraft Wiki - 资源包](https://minecraft.wiki/w/Resource_pack) — 资源包格式权威参考
- [Minecraft Wiki - Font](https://minecraft.wiki/w/Font) — 字体映射格式
- [Minecraft Wiki - 模型](https://minecraft.wiki/w/Model) — 物品模型 JSON 格式

### 在线工具

| 工具 | 网址 | 用途 |
|------|------|------|
| Piskel | [piskelapp.com](https://www.piskelapp.com/) | 在线像素画编辑器 |
| Lospec Pixel Editor | [lospec.com/pixel-editor](https://lospec.com/pixel-editor/) | 在线像素画编辑器 |
| Misode Version Explorer | [misode.github.io/versions](https://misode.github.io/versions) | pack_format 对照表查询 |
| Minecraft Resource Pack Creator | — | 在线资源包结构生成器 |

### 图像编辑工具

| 工具 | 平台 | 特点 |
|------|------|------|
| Paint.NET | Windows | 免费，轻量，易上手 |
| GIMP | 跨平台 | 免费，功能全面 |
| Aseprite | 跨平台 | 专业像素动画（付费） |
| Photoshop | Windows/macOS | 专业图像编辑（付费） |

### VSCode 扩展

| 扩展 | ID | 功能 |
|------|-----|------|
| YAML | `redhat.vscode-yaml` | YAML 语法支持（CE 配置编辑） |
| Spyglass（DHP） | `SPGoding.datapack-language-server` | 资源包 JSON 验证 |

### 项目内参考

- **数据包工作流**：`develop/workflows/datapack-workflow.md` — CE 物品在数据包 loot table 中的引用方式
- **贴图字符码速查**：见下方 [附录](#附录贴图字符码速查表)

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 MC 版本和 CraftEngine 版本更新。如有疑问或建议，请联系开发团队。

---

## 附录：贴图字符码速查表

> 以下字符码由 CraftEngine 自动注册，可直接在配置中引用。本表格汇总常用贴图字符编码，避免频繁翻找原配置文件。

### Icon 小图标类

| 贴图名称（英文标识） | 字符编码 | 预览图 |
|----------------------|----------|--------|
| 灵叶（Spirit_Leaf） | `\uE028` | ![灵叶](/images/resourcepack/icon/money.png) |
| 星痕石（Starscar_Gem） | `\uE02C` | ![星痕石](/images/resourcepack/icon/points.png) |
| 红色感叹号提示（info） | `\uE037` | ![红色感叹号提示](/images/resourcepack/icon/info.png) |
| 聊天（chat） | `\uE02E` | ![聊天](/images/resourcepack/icon/chat.png) |
| 日期（time） | `\uE02B` | ![日期](/images/resourcepack/icon/time.png) |

### Rank 身份标牌

| 贴图名称（英文标识） | 字符编码 | 预览图 |
|----------------------|----------|--------|
| NPC（npc） | `\uE031` | ![NPC](/images/resourcepack/rank_tab/npc.png) |
| 商店（shop） | `\uE032` | ![商店](/images/resourcepack/rank_tab/shop.png) |
| 玩家（小）（player） | `\uE036` | ![玩家（小）](/images/resourcepack/rank_tab/min/player.png) |
| 玩家（大）（player） | `\u0152` | ![玩家（大）](/images/resourcepack/rank_tab/player.png) |
| 会员（小）（vip） | `\uE033` | ![会员（小）](/images/resourcepack/rank_tab/min/vip.png) |
| 会员（大）（vip） | `\u0126` | ![会员（大）](/images/resourcepack/rank_tab/vip.png) |
| 大会员（小）（vip_plus） | `\u2AD4` | ![大会员（小）](/images/resourcepack/rank_tab/min/vip_plus.png) |
| 大会员（大）（vip_plus） | `\uE034` | ![大会员（大）](/images/resourcepack/rank_tab/vip_plus.png) |
| MVP 会员（小）（mvp） | `\uE02F` | ![MVP会员（小）](/images/resourcepack/rank_tab/min/mvp.png) |
| MVP 会员（大）（mvp） | `\u012E` | ![MVP会员（大）](/images/resourcepack/rank_tab/mvp.png) |
| 大 MVP 会员（小）（mvp_plus） | `\u2E9E` | ![大MVP会员（小）](/images/resourcepack/rank_tab/min/mvp_plus.png) |
| 大 MVP 会员（大）（mvp_plus） | `\uE030` | ![大MVP会员（大）](/images/resourcepack/rank_tab/mvp_plus.png) |

### 物品材质贴图

| 贴图名称（英文标识） | 命名空间 | 预览图 |
|----------------------|----------|--------|
| 胡萝卜镐（carrot_pickaxe） | `items_skin` | ![胡萝卜镐](/images/resourcepack/items_skin/weapons/pickaxe/carrot_pickaxe.png) |

### 使用提示

1. 字符编码可直接复制到功能配置文件中，兼容 CraftEngine 的字符渲染规则
2. 预览图路径为服务器资源包实际存储路径，如需调整贴图可参考该路径
3. 字符码值为十六进制 Unicode，在 JSON 中使用 `\uXXXX` 格式，在 YAML 中直接写原字符
4. 后续新增常用贴图字符码会同步更新至本附录
