---
title: "🌾 自定义作物工作流 · AI Skills 文档"
description: "面向 AI 编码助手的 CustomCrops + CraftEngine 自定义作物完整开发指南，覆盖作物基础配置、生长条件、阶段材质绑定、收获战利品、联动食物道具 5 大模块的五步闭环工作流。"
icon: 🌾
outline: deep
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, CustomCrops, CraftEngine, 自定义作物, AI Skills, 作物配置, 种植系统, RealisticSeasons"
---

# 🌾 自定义作物工作流 · AI Skills 文档

## 概述

### 文档定位

本文档是一份**面向 AI 编码助手**（如 Claude Code、Trae、WorkBuddy、GitHub Copilot 等）的 Minecraft CustomCrops 自定义作物开发技能指南。其目的是将作物开发的隐式经验固化为可移植、可复用的显性知识文档。

> 当然，给人类用于学习研究与参考也是可以的啦

任何不熟悉 CustomCrops 的 AI 在阅读本文档后，应能**独立完成以下任务**：

- 创建符合规范的作物配置文件
- 配置生长条件（光照、含水量、季节、温度）
- 为每个生长阶段绑定 CraftEngine 材质贴图
- 配置收获动作与战利品表
- 将作物与 CraftEngine 食物/道具系统联动

### 适用场景

- 为 MiragEdge 锐界幻境服务器（Leaf + CustomCrops + CraftEngine + RealisticSeasons）开发自定义作物
- 在 CraftEngine 混合架构下创建作物→收获物→食物/道具的完整生产链
- 将服务器作物开发流程标准化、文档化
- 基于本模板批量复制生产新作物配置

### 设计哲学

> **服主注**：这东西非常蛋疼，我自己写 42 个作物得写 2 个月不止（
> 在进行慢慢更新服内作物的同时，我会同步更新作物的开发文档，教你如何制作新的作物。
>
> 我买了很多现成的配置进行学习，发现它们几乎都十分古老且不负责，有的只写了表面的贴图材质，有的甚至破坏刚种下的种子能掉落两个种子。网上几十块钱的商店配置也存在严重的平衡性问题。这太抽象了，难道没人能做出优秀的配置吗？
>
> 我选择一个一个地打磨作物，慢慢更新，给每一个作物及其种子添加独特的模板 Lora、种植环境条件（季节、光照、含水量等）、成熟阶段、不同阶段的点击动作（破坏、收获）产生的结果（掉落、消失等）。
>
> 添加新作物的同时加入相关联的新食物、新道具、新武器装备。
>
> 总之这是一个庞大的项目，需要很多人加入进来用时间细细打磨。

基于以上理念，本文档遵循以下设计原则：

- **每作物单文件**：一个作物一个 yml，放在 `plugins/CustomCrops/crops/` 下，避免配置互相污染
- **阶段驱动**：生长阶段决定贴图、碰撞箱、交互行为，每个阶段独立配置
- **条件控生长**：生长速度受光照、含水量、季节（RealisticSeasons）共同影响，追求真实感
- **材质分离**：作物贴图用 CraftEngine 注册，收获物用 CE 自定义物品，不耦合
- **手动打磨**：第一个作物手工调试参数，后续复制模板批量生产，质量优先于数量
- **平衡优先**：每个作物的掉落物、生长周期、环境条件必须经过实际测试，拒绝「种子破坏掉落两倍种子」类设计缺陷

### 技术栈总览

| 层级 | 技术 | 用途 |
|------|------|------|
| 服务端 | Leaf（Paper 分支）26.1.2 | Minecraft 服务端核心 |
| 插件 | CustomCrops（最新版） | 自定义作物生命周期管理 |
| 插件 | CraftEngine v26.7（社区版） | 作物材质贴图、收获物自定义物品 |
| 插件 | RealisticSeasons | 季节系统（影响作物生长条件） |
| 数据包 | MC Data Pack | 可选：作物种子战利品表注入 |
| 在线工具 | CustomCrops Wiki / CE Wiki | 配置参考与验证 |

### 服务器环境约束

本文档所有内容基于以下真实服务器环境：

| 项目 | 值 |
|------|-----|
| 服务器核心 | Leaf（Paper 分支）26.1.2 |
| CustomCrops 版本 | 最新（开箱即用，社区活跃维护） |
| CraftEngine | 社区版 v26.7 |
| 季节插件 | RealisticSeasons |
| 命名空间 | `miragedge` |
| 作物配置目录 | `plugins/CustomCrops/crops/` |
| CE 材质路径 | `miragedge:items_crops/...` |
| CE 配置目录 | `plugins/CraftEngine/resources/` |
| 种子映射方式 | CE MaterialSnapshot → 原版种子占位符 |

## 前置知识

### CustomCrops 作物生命周期

```
种子（原版种子占位符，如 wheat_seeds）
  │  CE MaterialSnapshot 替换为自定义种子外观
  ↓  右键放置在耕地上
生长阶段 0（幼苗）
  │  持续时间 / 材质贴图 / 碰撞箱高度
  ↓
生长阶段 1（生长中）
  │  每个阶段独立配置
  ↓
...更多阶段...
  ↓
生长阶段 N（成熟）
  │  可配置收获动作（右键/破坏）
  ↓  玩家交互
收获物（CE 自定义物品掉落） + 可能的种子返还
```

### 核心配置文件结构

```
plugins/CustomCrops/
├── config.yml                  # 插件主配置（全局设置）
├── crops/                      # 作物定义（本文档核心关注）
│   ├── tomato.yml              # 番茄
│   ├── corn.yml                # 玉米
│   ├── cabbage.yml             # 卷心菜
│   └── ...
├── loot-tables/                # 可选：钩子战利品表
└── ...
```

### 作物配置文件关键概念

| 概念 | 说明 | 示例 |
|------|------|------|
| `crop` | 作物唯一 ID（英文小写蛇形） | `tomato`、`sweet_corn` |
| `name` | 作物显示名称（中文） | `"番茄"` |
| `stages` | 生长阶段列表（数组，至少 2 个阶段） | 3~7 阶段 |
| `stage.duration` | 当前阶段持续时间（tick，20 tick = 1 秒） | `3000`（约 2.5 分钟） |
| `stage.height` | 当前阶段碰撞箱高度（像素） | `2` ~ `12` |
| `stage.harvest` | 可收获配置块（仅成熟阶段） | type / drops / reset-stage |
| `stage.texture` | 当前阶段 CE 贴图 ID | `miragedge:items_crops/tomato_stage_0` |
| `conditions` | 全局生长条件块 | light-level / water-level / seasons / temperature / soil |

### 种子物品映射机制

CustomCrops 本身不创建新的物品类型。种子使用**原版物品作为占位符**（如 `wheat_seeds`、`beetroot_seeds`），通过 CraftEngine 的 MaterialSnapshot 机制在运行时替换为自定义物品外观。

数据流：
```
原版占位符（wheat_seeds）
    │
    ├─→ CustomCrops：识别为 tomato 作物的种子物品
    │
    └─→ CraftEngine MaterialSnapshot：将 wheat_seeds 的材质替换为 miragedge:tomato_seeds
        └─→ 玩家看到：带有番茄种子贴图的物品
```

> 映射在 CE 物品配置中定义，通过 `custom-model-data` + `material` 字段识别。具体映射关系见[附录：种子→原版占位符映射表](#附录种子原版占位符映射表)。

## 开发环境搭建

### VSCode 推荐扩展

| 扩展 | ID | 功能 |
|------|-----|------|
| YAML | `redhat.vscode-yaml` | YAML 语法高亮与校验（CustomCrops 配置） |
| Spyglass (DHP) | `SPGoding.datapack-language-server` | 可选：数据包 JSON 验证/补全 |

### 在线工具

| 工具 | 网址 | 用途 |
|------|------|------|
| **CustomCrops 官方 Wiki** | [momi.gtemc.cn/customcrops](https://momi.gtemc.cn/customcrops) | CustomCrops 完整配置参考 |
| **CraftEngine Wiki** | [ce.gtemc.cn/zh-Hans](https://ce.gtemc.cn/zh-Hans/) | CE 材质注册与物品配置 |
| **CustomCrops GitHub** | [github.com/IntellectualSites/CustomCrops](https://github.com/IntellectualSites/CustomCrops) | 插件源码与 Issue 追踪 |

### CustomCrops 测试命令速查

```bash
# ===== 核心命令 =====

# 重载 CustomCrops 全部配置
/cc reload

# 开启调试模式（输出详细日志）
/cc debug

# 给予指定作物种子
/cc give <player> <crop_id>

# 查询作物当前状态
/cc info <crop_id>

# ===== 联调命令 =====

# 重载 CraftEngine（材质/物品变更后）
/ce reload

# 获取 CE 自定义收获物
/ce item get <namespace:id> [amount]

# 查询当前位置的生物群系与温度
# （用于验证作物生长条件）
```

## 核心工作流

> **核心方法论**：每个功能模块均遵循「**概念 → 设计 → 编写 → 验证 → 部署**」五步闭环。AI 应按此流程逐模块推进。

---

### 模块 1：作物基础配置

#### 概念

每个作物是一个独立的 YAML 文件，定义作物的生命周期：从种子种下，经历若干生长阶段，到最终成熟可收获。这是作物配置的骨架，后续模块在此基础上叠加。

#### 设计

在开始编写前，确定以下参数：

| 参数 | 说明 | 示例（番茄） |
|------|------|-------------|
| 作物 ID | 英文小写蛇形，唯一标识 | `tomato` |
| 显示名称 | 中文名称 | `"番茄"` |
| 生长阶段数 | 建议 3~7 阶段，阶段越多越精细 | 4 阶段（0→1→2→3 成熟） |
| 每阶段持续时间 | 单位 tick，可随阶段递增 | 3000 / 4000 / 5000 / 6000 |
| 碰撞箱高度 | 每阶段像素高度，随生长递增 | 2 / 4 / 8 / 12 |
| 成熟阶段索引 | 最后一个阶段为成熟阶段 | stage 3（数组索引 3） |

**设计原则**：
- 阶段数过少（2 阶段）缺乏视觉过渡；过多（8+ 阶段）增加贴图工作量，4~5 阶段为甜点
- 每阶段持续时间递增，模拟「幼苗期短→成熟期长」的自然规律
- 碰撞箱高度随阶段递增，成熟作物突出于耕地方块之上

#### 编写

以 **番茄（tomato）** 为贯穿全文的完整示例：

```yaml
# plugins/CustomCrops/crops/tomato.yml
# ==========================================
# MiragEdge 自定义作物 - 番茄
# 4 阶段生长，阶段 3 成熟可右键收获
# ==========================================

crop: tomato
name: "番茄"

stages:
  # 阶段 0：幼苗（刚种下）
  - duration: 3000          # 3000 tick ≈ 2.5 分钟
    height: 2               # 碰撞箱高度 2 像素（贴地）

  # 阶段 1：生长中
  - duration: 4000          # 4000 tick ≈ 3.3 分钟
    height: 4               # 碰撞箱高度 4 像素

  # 阶段 2：半成熟
  - duration: 5000          # 5000 tick ≈ 4.2 分钟
    height: 8               # 碰撞箱高度 8 像素

  # 阶段 3：成熟（可收获）
  - duration: 6000          # 6000 tick ≈ 5 分钟
    height: 12              # 碰撞箱高度 12 像素
    harvest:                # 此阶段可收获
      type: RIGHT_CLICK     # 右键收获（保留植株，可多次收获）
      drops:
        - item: miragedge:tomato
          amount: 1
          chance: 1.0       # 100% 掉落 1 个番茄
        - item: miragedge:tomato_seeds
          amount: 1
          chance: 0.3       # 30% 返还种子
```

**关键字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `crop` | string | 作物唯一 ID，文件名建议与此一致 |
| `name` | string | 中文显示名称 |
| `stages` | list | 生长阶段数组，索引从 0 开始 |
| `stages[n].duration` | int | 第 n→n+1 阶段的持续时间（tick） |
| `stages[n].height` | float | 第 n 阶段的碰撞箱高度（像素） |
| `stages[n].harvest.type` | enum | `RIGHT_CLICK`（右键）/ `BREAK`（破坏） |
| `stages[n].harvest.drops` | list | 收获掉落物列表 |

#### 验证

```bash
# 1. 部署配置文件后重载
/cc reload

# 2. 获取番茄种子
/cc give @p tomato

# 3. 种植种子（右键放在耕地上）
#   → 观察生长过程：每个阶段是否正确切换

# 4. 查询作物当前状态
/cc info tomato
#   → 输出：当前阶段 / 已过时间 / 剩余时间 / 环境条件状态

# 5. 右键成熟作物测试收获
#   → 观察掉落物数量和种类
```

#### 部署

1. yml 文件放入 `plugins/CustomCrops/crops/`
2. 文件名与 `crop` ID 保持一致
3. 执行 `/cc reload`
4. 检查服务端日志无 `[CustomCrops]` 报错信息

---

### 模块 2：生长条件配置

#### 概念

作物生长速度受多种环境条件影响。CustomCrops 支持逐维度、逐生物群系精细控制生长条件。不满足条件的作物将**停止生长**，满足条件越多则**生长越快**。

#### 设计

配置作物所需的五大环境维度：

| 条件维度 | 配置项 | 说明 |
|----------|--------|------|
| **光照** | `light-level` | 最低/最高光照要求（0~15） |
| **含水量** | `water-level` | 附近水源供给的含水量（0~3） |
| **季节** | `seasons` | 适配的季节列表（RealisticSeasons） |
| **温度** | `temperature` | 生物群系温度范围 |
| **土壤** | `soil` | 允许种植的方块类型 |

**设计原则**：
- 大多数作物要求光照 ≥ 8（与小麦一致），特殊作物（如蘑菇）可设低光照
- 含水量通常设为 1~3，干燥区域（如沙漠）需要灌溉
- 季节适配需与 RealisticSeasons 的四季节奏对齐：`SPRING` / `SUMMER` / `AUTUMN` / `WINTER`
- 温度范围基于生物群系基础温度值，`0.5~2.0` 覆盖大部分温带/热带生物群系
- 土壤类型默认为 `FARMLAND`，特殊作物可扩至 `SOUL_SAND`（下界）或 `SAND`（沙漠）

#### 编写

```yaml
# 在 tomato.yml 中补充生长条件块
# （与 stages 平级）

crop: tomato
name: "番茄"

# 生长条件配置
conditions:
  light-level:
    min: 8                  # 最低光照 8 级（与小麦一致）
    max: 15                 # 最高光照 15 级（满光照也可生长）

  water-level:
    min: 1                  # 最近水源距离 ≤ 4 格时含水量 ≥ 1
    max: 3                  # 最大含水量 3（紧邻水源）

  seasons:                  # RealisticSeasons 季节适配
    - SPRING                # 春季：生长加速（番茄是春夏作物）
    - SUMMER                # 夏季：正常生长
    # 番茄在秋季/冬季不生长

  temperature:
    min: 0.5                # 最低生物群系温度（温带）
    max: 2.0                # 最高生物群系温度（热带）

  soil:
    - FARMLAND              # 只能种植在耕地上

stages:
  # ...阶段配置不变...
```

**各条件维度的常用值参考**：

| 条件 | 常用范围 | 适用场景 |
|------|---------|---------|
| `light-level.min` | 0~15 | 8=普通作物，0=蘑菇/下界作物 |
| `light-level.max` | 0~15 | 15=满光照，7=避光作物 |
| `water-level.min` | 0~3 | 1=需灌溉，0=沙漠作物 |
| `water-level.max` | 0~3 | 3=湿润，0=耐旱 |
| `seasons` | 组合 | 春夏秋冬季配比 |
| `temperature.min` | -1.0~2.0 | 0.5=温带起点 |
| `temperature.max` | 0~2.0 | 2.0=允许热带种植 |
| `soil` | 方块类型列表 | `FARMLAND` / `SOUL_SAND` / `SAND` / `DIRT` |

#### 验证

```bash
# 1. 部署配置后重载
/cc reload

# 2. 在不同环境种植测试
#  场景 A：平原（光照 15 / 温暖/温带生物群系）
#    → 预期：正常生长
#  场景 B：地下洞穴（光照 < 8）
#    → 预期：停止生长
#  场景 C：沙漠（高温 / 低含水量）
#    → 预期：若含水量不足则停止生长
#  场景 D：雪原（低温 / 冬季）
#    → 预期：番茄在冬季不生长

# 3. 实时监控作物状态
/cc info tomato
#   → 输出中查看环境条件是否标记为 ✅ / ❌

# 4. 用调试模式查看详细日志
/cc debug
#   → 观察生长事件触发情况
```

#### 部署

编辑 yml 文件中的 `conditions` 块 → 执行 `/cc reload`。

> 条件变更仅影响**新种植的作物**。已存在的作物继承种植时的条件判定，修改后建议重新种植测试。

---

### 模块 3：阶段材质与贴图绑定

#### 概念

每个生长阶段可绑定独立的 CraftEngine 材质贴图，使作物外观随生长变化——从幼苗到成熟植株的视觉过渡由 CE 材质驱动。

#### 设计

材质绑定涉及两个系统：

```
CustomCrops 作物配置                   CraftEngine 材质注册
┌─────────────────────┐              ┌──────────────────────────┐
│ stages:             │              │ miragedge:tomato_stage_0 │
│   - texture: ───────┼──引用 ID ──→│   texture: items_crops/  │
│     miragedge:       │              │     tomato/stage_0      │
│     items_crops/     │              │   register-only: true   │
│     tomato_stage_0   │              └──────────────────────────┘
└─────────────────────┘                        │
                                               ↓
                              ┌──────────────────────────┐
                              │ 实际 PNG 贴图文件          │
                              │ textures/items_crops/    │
                              │   tomato/stage_0.png     │
                              └──────────────────────────┘
```

**设计要点**：
- 每个阶段至少需要一个贴图（`texture` 字段）
- CE 中阶段贴图使用 `register-only: true`，**不创建为物品**——仅供 CustomCrops 引用
- 种子物品（背包中显示的图标）也需在 CE 中注册为独立物品
- 贴图 PNG 尺寸建议 16×16 或 32×32，风格需与 Minecraft 原版保持一致

#### 编写

**Step 1：CustomCrops 作物配置中绑定贴图**

```yaml
# plugins/CustomCrops/crops/tomato.yml
# （在 stages 中添加 texture 字段）

crop: tomato
name: "番茄"

stages:
  - duration: 3000
    height: 2
    texture: miragedge:items_crops/tomato_stage_0  # CE 注册的贴图 ID

  - duration: 4000
    height: 4
    texture: miragedge:items_crops/tomato_stage_1

  - duration: 5000
    height: 8
    texture: miragedge:items_crops/tomato_stage_2

  - duration: 6000
    height: 12
    texture: miragedge:items_crops/tomato_stage_3
    harvest:
      type: RIGHT_CLICK
      drops:
        - item: miragedge:tomato
          amount: 1
          chance: 1.0
        - item: miragedge:tomato_seeds
          amount: 1
          chance: 0.3
```

**Step 2：CraftEngine 中注册阶段贴图**

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/crops/tomato_textures.yml
# 注册为 register-only 贴图 —— 不创建物品，仅供 CustomCrops 引用

items:
  miragedge:tomato_stage_0:
    material: wheat_seeds
    data:
      custom-model-data: 2001
    settings:
      register-only: true                     # 关键：不创建为物品
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/stage_0"

  miragedge:tomato_stage_1:
    material: wheat_seeds
    data:
      custom-model-data: 2002
    settings:
      register-only: true
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/stage_1"

  miragedge:tomato_stage_2:
    material: wheat_seeds
    data:
      custom-model-data: 2003
    settings:
      register-only: true
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/stage_2"

  miragedge:tomato_stage_3:
    material: wheat_seeds
    data:
      custom-model-data: 2004
    settings:
      register-only: true
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/stage_3"
```

**Step 3：准备 PNG 贴图文件**

```
plugins/CraftEngine/resources/miragedge/resourcepack/assets/
└── miragedge/
    └── textures/
        └── items_crops/
            └── tomato/
                ├── stage_0.png     # 幼苗贴图
                ├── stage_1.png     # 生长中贴图
                ├── stage_2.png     # 半成熟贴图
                └── stage_3.png     # 成熟贴图
```

> PNG 贴图文件需自行绘制或使用 AI 材质生成器生成，保持与原版作物风格一致。

#### 验证

```bash
# 1. 重载 CE 材质（先）
/ce reload

# 2. 重载 CustomCrops（后）
/cc reload

# 3. 获取种子并种植
/cc give @p tomato
#   → 右键放在耕地上，逐阶段观察材质是否正确切换

# 4. 检查阶段切换
/cc info tomato
#   → 确认当前阶段索引和材质 ID 是否匹配

# 5. 破坏未成熟植株
#   → 确认掉落物是否为种子
#   → 确认破坏动画显示为正确的阶段贴图
```

#### 部署

1. PNG 贴图放入 `resources/miragedge/resourcepack/assets/miragedge/textures/items_crops/<作物>/`
2. CE 材质 YAML 放入 `resources/miragedge/configuration/crops/`（或 items 目录）
3. CustomCrops 作物 YAML 中 `stages[n].texture` 指向 CE 注册 ID
4. 执行 `/ce reload` → `/cc reload`（顺序不能颠倒）
5. 客户端重新加入服务器以更新资源包

---

### 模块 4：收获与战利品

#### 概念

作物成熟后，玩家可通过右键或破坏收获。不同阶段可配置不同的动作和掉落物。这是决定作物「产出」和「经济价值」的关键模块。

#### 设计

确定以下维度：

| 设计维度 | 选项 | 说明 |
|----------|------|------|
| **收获方式** | `RIGHT_CLICK` / `BREAK` | 右键=保留植株可多次收获；破坏=植株消失 |
| **多次收获** | `reset-stage` | 收获后回退到指定阶段，实现「番茄一直长，定期摘」 |
| **主产物** | CE 物品 ID + 数量 + 概率 | 100% 掉落的核心收获物 |
| **种子返还** | CE 种子 ID + 概率 | 模拟植物自然繁殖，通常 30%~50% |
| **稀有掉落** | CE 物品 ID + 低概率 | 增加惊喜感，如 5% 掉落特殊材料 |
| **时运加成** | `min`/`max` 数量范围 | 配合时运附魔增加掉落物数量 |

**设计原则**：
- 主产物概率 = 1.0（100%），保证种植有正收益
- 种子返还概率 0.3~0.5，维持种子供应但不溢出
- 稀有掉落概率 0.01~0.1，过高则失去稀有性
- `RIGHT_CLICK` + `reset-stage` 组合用于「可持续收获」型作物（番茄、辣椒等）
- `BREAK` 模式用于「一次性收获」型作物（小麦、胡萝卜等根茎类）

#### 编写

```yaml
# plugins/CustomCrops/crops/tomato.yml
# （成熟阶段的 harvest 配置）

stages:
  # ...前三个阶段...

  - duration: 6000
    height: 12
    texture: miragedge:items_crops/tomato_stage_3
    harvest:
      type: RIGHT_CLICK         # 右键收获（保留植株）
      reset-stage: 2            # 收获后回退到阶段 2（视觉上变小，可再次生长）

      drops:
        # 主产物：番茄果实（100% 掉落 1~3 个，时运加成）
        - item: miragedge:tomato
          amount:
            min: 1
            max: 3
          chance: 1.0

        # 种子返还（50% 概率）
        - item: miragedge:tomato_seeds
          amount: 1
          chance: 0.5

        # 稀有掉落：灵叶（5% 概率）
        - item: miragedge:spirit_leaf
          amount: 1
          chance: 0.05
```

**收获方式对比示例**：

```yaml
# 方式 A：可持续收获（番茄 - RIGHT_CLICK + reset-stage）
harvest:
  type: RIGHT_CLICK
  reset-stage: 2               # 回到半成熟，重新生长到成熟

# 方式 B：一次性收获（卷心菜 - BREAK）
harvest:
  type: BREAK                  # 破坏后植株消失
  # 不设置 reset-stage，意味着植株完全消失
  drops:
    - item: miragedge:cabbage
      amount: 1
      chance: 1.0
    - item: miragedge:cabbage_seeds
      amount: 1
      chance: 0.3
```

#### 验证

```bash
# 1. 部署配置后重载
/cc reload

# 2. 种植并等待成熟
/cc give @p tomato
#   → 等待作物进入成熟阶段（阶段 3）

# 3. 右键收获测试
#   → 观察掉落物数量和种类
#   → 确认 reset-stage 后阶段是否正确回退

# 4. 多次收获测试
#   → 连续右键成熟作物 5+ 次
#   → 确认阶段循环正确（3→2→3→2→...）

# 5. 时运附魔测试
#   → 手持时运 III 工具右键收获
#   → 观察掉落数量是否增加（min/max 范围）

# 6. 检查掉落日志
/cc info tomato
#   → 查看收获事件是否正确触发
```

#### 部署

编辑 yml → `/cc reload`。

> 如果使用 `reset-stage`，确保回退的目标阶段不是成熟阶段（否则形成无限收获循环）。回退目标通常设为倒数第二个阶段。

---

### 模块 5：联动食物/道具

#### 概念

作物收获物不仅仅是物品——它们可以作为 CraftEngine 自定义食物被食用，作为合成材料制作新食物/道具，甚至通过数据包 loot table 投放到世界结构中。这是作物体系与服务器整体内容生态的连接枢纽。

#### 设计

收获物的「出口」路径：

```
作物收获物（如 miragedge:tomato）
    │
    ├─→ CE 食物物品：直接食用，有饥饿值/饱和度/药水效果
    │
    ├─→ CE 合成配方：烤番茄、番茄汤、沙拉等
    │
    ├─→ 数据包 loot table：种子投放到村庄箱子/地牢/结构
    │
    └─→ 商人/村民交易（未来扩展）
```

**设计原则**：
- 每个收获物必须是完整的 CE 物品（有显示名称、贴图、Lore 描述）
- 食物类收获物需配置 `food` 属性（饥饿值 + 饱和度）
- 饥饿值和饱和度需与原版食物体系对齐，避免数值膨胀
- 可食用后附加药水效果（如番茄→饱和效果）
- 种子应通过数据包 loot table 自然投放到世界中（而非只能通过管理员命令获取）

#### 编写

**Step 1：定义收获物为 CE 食物物品**

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/foods/tomato.yml
# ==========================================
# 番茄 - CE 食物物品
# 可作为 CustomCrops 收获物的掉落目标
# ==========================================

items:
  miragedge:tomato:
    material: APPLE                           # 底层材质（原版苹果的行为）
    data:
      item-name: "<!i><red>番茄"
      lore:
        - "<!i><gray>新鲜采摘的番茄"
        - "<!i><gray>多汁可口，可生食或烹饪"
      custom-model-data: 301                  # 自定义模型数据值
    settings:
      food:
        nutrition: 2                          # 饥饿值（半格为单位）
        saturation: 3.6                       # 饱和度
        can-always-eat: false                 # 非满饱食度可食用
      tags:
        - "miragedge:crops"                   # 自定义标签：分类为作物产品
        - "miragedge:vegetables"               # 自定义标签：分类为蔬菜
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/fruit"
```

**Step 2：定义种子为 CE 物品（MaterialSnapshot 替换原版种子）**

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/seeds/tomato_seeds.yml

items:
  miragedge:tomato_seeds:
    material: wheat_seeds                     # 基于原版小麦种子
    data:
      item-name: "<!i><green>番茄种子"
      lore:
        - "<!i><gray>可以种植出新鲜的番茄"
        - "<!i><dark_gray>春夏种植最佳"
      custom-model-data: 2000
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "miragedge:items_crops/tomato/seeds"
```

**Step 3：配置合成配方（加工收获物）**

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/recipes/tomato_recipes.yml

recipes:
  # 烤番茄（熔炉）
  miragedge:roasted_tomato:
    type: smelting
    category: food
    ingredient: "miragedge:tomato"            # CE 收获物作为原料
    time: 200                                 # 200 tick = 10 秒
    experience: 0.35
    result:
      id: miragedge:roasted_tomato
      count: 1

  # 番茄汤（工作台）
  miragedge:tomato_soup:
    type: shaped
    category: food
    pattern:
      - " T "
      - " B "
      - "   "
    ingredients:
      T: "miragedge:tomato"                   # 番茄
      B: "minecraft:bowl"                     # 碗（原版物品）
    result:
      id: miragedge:tomato_soup
      count: 1
```

**Step 4：数据包 loot table（可选，种子自然投放）**

```json
// data/miragedge/loot_table/chests/village_farming_tomato.json
// 将番茄种子注入村庄箱子战利品
{
  "type": "minecraft:chest",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "craftengine:item",
          "name": "miragedge:tomato_seeds",
          "weight": 3,
          "functions": [
            {
              "function": "minecraft:set_count",
              "count": { "type": "minecraft:uniform", "min": 1, "max": 3 }
            }
          ]
        },
        {
          "type": "minecraft:empty",
          "weight": 7
        }
      ]
    }
  ]
}
```

#### 验证

```bash
# 1. 重载 CE 物品和配方
/ce reload

# 2. 获取收获物测试
/ce item get miragedge:tomato
#   → 检查物品名称、Lore、贴图是否正确显示
#   → 右键食用：检查饥饿值/饱和度回复

# 3. 获取种子测试
/ce item get miragedge:tomato_seeds
#   → 检查种子贴图是否正确
#   → 右键放在耕地上确认能种植

# 4. 测试合成配方
#   → 获取原料：/ce item get miragedge:tomato 64
#   → 熔炉测试烤番茄
#   → 工作台测试番茄汤

# 5. 测试 loot table（如果配置了）
/reload
/loot give @s loot miragedge:chests/village_farming_tomato
#   → 观察战利品结果

# 6. 端到端测试（完整流程）
/cc give @p tomato
#   → 种植 → 等待成熟 → 收获 → 获取 miragedge:tomato
#   → 食用验证食物属性
#   → 烹饪验证配方
```

#### 部署

1. CE 食物物品 YAML 放入 `resources/miragedge/configuration/items/foods/`
2. CE 种子物品 YAML 放入 `resources/miragedge/configuration/items/seeds/`
3. CE 配方 YAML 放入 `resources/miragedge/configuration/recipes/`
4. PNG 贴图放入 `resources/miragedge/resourcepack/assets/miragedge/textures/items_crops/<作物>/`
5. 数据包 loot table JSON 放入 `data/miragedge/loot_table/chests/`（可选）
6. 执行 `/ce reload` → `/reload`（如有数据包变更）

---

## 命名/路径/命令规范

AI 生成的所有代码和配置必须遵循以下规范：

### 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 作物 ID | 英文小写蛇形 | `tomato`、`sweet_corn`、`purple_cabbage` |
| 作物 yml 文件名 | 与 `crop` ID 一致 | `tomato.yml` |
| CE 阶段贴图 ID | `miragedge:items_crops/<作物>_stage_<n>` | `miragedge:items_crops/tomato_stage_0` |
| CE 收获物 ID | `miragedge:<作物>` | `miragedge:tomato` |
| CE 种子 ID | `miragedge:<作物>_seeds` | `miragedge:tomato_seeds` |
| CE 加工品 ID | `miragedge:<形容词>_<作物>` | `miragedge:roasted_tomato` |
| CE 配方 ID | `miragedge:<产物>_recipe` 或 `miragedge:<描述>` | `miragedge:roasted_tomato` |
| CE 贴图 PNG 路径 | `textures/items_crops/<作物>/<阶段>.png` | `textures/items_crops/tomato/stage_0.png` |
| CE custom-model-data | 建议范围 2000~2999（作物相关） | `2000`=种子，`2001`=stage_0，`2002`=stage_1... |

### 路径规范

```
项目根目录
├── plugins/
│   ├── CustomCrops/
│   │   └── crops/
│   │       ├── tomato.yml           ← 作物配置文件
│   │       ├── corn.yml
│   │       └── ...
│   └── CraftEngine/
│       └── resources/
│           └── miragedge/
│               ├── configuration/
│               │   ├── items/
│               │   │   ├── foods/      ← CE 食物物品
│               │   │   └── seeds/      ← CE 种子物品
│               │   └── recipes/        ← CE 配方
│               └── resourcepack/
│                   └── assets/
│                       └── miragedge/
│                           └── textures/
│                               └── items_crops/
│                                   └── tomato/     ← PNG 贴图
│                                       ├── stage_0.png
│                                       ├── stage_1.png
│                                       ├── stage_2.png
│                                       ├── stage_3.png
│                                       ├── fruit.png
│                                       └── seeds.png
└── world/
    └── datapacks/
        └── miragedge-datapack/
            └── data/
                └── miragedge/
                    └── loot_table/
                        └── chests/                ← 种子 loot table
```

### 命令规范

| 操作 | 命令 |
|------|------|
| 重载作物配置 | `/cc reload` |
| 获取种子 | `/cc give @p <crop_id>` |
| 查询作物状态 | `/cc info <crop_id>` |
| 开启调试 | `/cc debug` |
| 重载 CE 全部 | `/ce reload` |
| 获取 CE 物品 | `/ce item get <namespace:id> [amount]` |
| 重载数据包 | `/reload` |
| 测试 loot table | `/loot give @s loot <namespace:path>` |
| 加速时间（测试用） | `/time add <ticks>` |

## AI 使用指南

### 本文档覆盖范围声明

| 能力 | 覆盖 | 不覆盖 |
|------|------|--------|
| 作物 YAML 配置 | ✅ 完整 5 模块 | — |
| 生长条件调参 | ✅ 光照/水/季节/温度/土壤 | 自定义维度条件 |
| 阶段贴图绑定 | ✅ CE register-only 材质 | CE 高级动画/Lora |
| 收获战利品 | ✅ drops / reset-stage / 时运 | 自定义掉落事件 |
| CE 食物物品 | ✅ 基础属性/效果/配方 | 高级 food behavior |
| CE 种子物品 | ✅ MaterialSnapshot 映射 | 高级种子 NBT 标签 |
| 数据包 loot table | ✅ 种子箱子投放 | 复杂 predicate 条件 |
| RealisticSeasons 联动 | ✅ seasons 白名单 | 季节自定义事件 |

### 使用流程

当用户提出 CustomCrops 作物开发请求时，AI 应按以下流程执行：

```
第 1 步：阅读概述与前置知识
  → 确认命名空间、环境版本、约束条件

第 2 步：匹配功能模块
  → 从 5 大模块中定位相关章节
  → 新增作物：按模块 1→2→3→4→5 顺序执行
  → 修改作物：定位到对应模块

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制的 YAML 配置文件
  → 附带验证命令
  → 标注需要手动操作的步骤（如准备 PNG 贴图）
  → 附录中检查种子映射表
```

### 新增作物的标准流程

以新增「玉米」（`corn`）为例：

```
1. 确定设计参数（模块 1）
   crop: corn / name: "玉米" / 5 阶段 / 总生长时间约 20 分钟

2. 配置生长条件（模块 2）
   光照 8~15 / 含水量 1~3 / 春夏季 / 温度 0.8~2.0 / FARMLAND

3. 绑定阶段贴图（模块 3）
   准备 5 张阶段贴图 + CE register-only 注册

4. 配置收获战利品（模块 4）
   BREAK 一次性收获 / 玉米 1~3 个 / 种子 40% 返还

5. 联动食物道具（模块 5）
   CE 食物：烤玉米 / 种子 MaterialSnapshot 映射 / 村庄箱子 loot table
```

### 未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方文档**：优先访问 [CustomCrops Wiki](https://momi.gtemc.cn/customcrops) 和 [CraftEngine Wiki](https://ce.gtemc.cn/zh-Hans/)
2. **参考现有配置**：服内 `plugins/CustomCrops/crops/` 目录下已有作物配置是最佳参考
3. **增量验证**：每完成一个模块配置后即用 `/cc reload` + `/cc give` 测试，不要等全部写完再测试
4. **保守提示**：对于文档未明确覆盖的功能（如 CustomCrops 高级事件、自定义生长算法），向用户说明不确定性，并建议查阅官方 Wiki 或 GitHub Issue
5. **数值对齐**：新作物数值应与已有作物保持同一梯队，避免某个作物产出过高破坏经济平衡

### 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个 YAML 代码块可直接复制使用，占位符需明确标注（如 `<crop_id>`）
2. **完整**：包含文件路径注释（如 `# plugins/CustomCrops/crops/tomato.yml`）
3. **可验证**：每个模块附带 `/cc` 验证命令
4. **有上下文**：说明文件之间的依赖关系（如「本文件依赖 CE 中已注册 `miragedge:tomato` 食物物品」）
5. **区分 CC/CE**：明确标注 CustomCrops 配置（`/cc reload`）还是 CraftEngine 配置（`/ce reload`）

---

## 附录：种子→原版占位符映射表

> 以下映射关系反映服内当前已规划的作物种子。新增作物时请参考此表，避免多个作物抢占同一原版占位符。

| 作物 | 作物 ID | 占位符种子 | CE 最终物品 | 说明 |
|------|---------|-----------|-------------|------|
| 番茄 | `tomato` | `wheat_seeds` | `miragedge:tomato_seeds` | 春夏作物，RIGHT_CLICK 多次收获 |
| 玉米 | `corn` | `wheat_seeds` | `miragedge:corn_seeds` | 需使用不同 custom-model-data 区分 |
| 卷心菜 | `cabbage` | `beetroot_seeds` | `miragedge:cabbage_seeds` | 秋冬作物，BREAK 一次性收获 |
| 辣椒 | `chili` | `pumpkin_seeds` | `miragedge:chili_seeds` | 夏季作物 |
| 草莓 | `strawberry` | `melon_seeds` | `miragedge:strawberry_seeds` | 春季作物 |
| 葡萄 | `grape` | `wheat_seeds` | `miragedge:grape_seeds` | 需爬架，秋季收获 |

**占位符分配原则**：

- 每个占位符原版种子（`wheat_seeds`、`beetroot_seeds` 等）**最多可承载多个作物**，但需要不同的 `custom-model-data` 值来区分
- 建议按**季节**分配占位符，避免同一占位符的作物在同一季节都处于生长状态（视觉冲突）
- 若同一占位符冲突不可避免，优先通过 custom-model-data 区分；同一占位符下的不同 CMD 值对应不同种子外观
- 新增作物前请检查此表，确保不与已有作物的 CMD 值冲突

**CMD 值分配范围建议**：

| 范围 | 用途 |
|------|------|
| 2000~2099 | 种子物品 |
| 2100~2199 | 阶段贴图（register-only） |
| 2200~2299 | 收获物/果实 |
| 2300~2399 | 加工品/合成产物 |
| 2400~2999 | 保留（未来扩展） |

---

## 参考资源

### CustomCrops

- [CustomCrops 官方 Wiki](https://momi.gtemc.cn/customcrops) - 完整配置参考
- [CustomCrops GitHub](https://github.com/IntellectualSites/CustomCrops) - 插件源码与 Issue

### CraftEngine

- [CraftEngine Wiki（材质注册）](https://ce.gtemc.cn/zh-Hans/) - 材质贴图与物品注册
- [CraftEngine Wiki（物品配置）](https://xiao-momi.github.io/craft-engine-wiki/) - 自定义物品完整配置
- [CraftEngine GitHub](https://github.com/Xiao-MoMi/craft-engine) - 项目仓库

### 服内参考

- 现有作物配置：`plugins/CustomCrops/crops/`（实际部署的作物 YAML 文件）
- 现有 CE 食物配置：`plugins/CraftEngine/resources/items/foods/food_new.yml`（57 个已有食物参考）
- 现有 CE 物品配置：`plugins/CraftEngine/resources/miragedge/configuration/items/`

### RealisticSeasons

- RealisticSeasons Wiki（季节机制与作物适配参考）

### VSCode 扩展

- [Red Hat YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) - YAML 语法支持
- [Spyglass (DHP)](https://marketplace.visualstudio.com/items?itemName=SPGoding.datapack-language-server) - 数据包 JSON 验证

---

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 CustomCrops、CraftEngine 版本更新。如有疑问或建议，请联系开发团队。
