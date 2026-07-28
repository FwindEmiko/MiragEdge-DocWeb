---
title: 附魔配置工作流 · 前置与环境
description: 面向锐界幻境自定义附魔维护的工作流，拆分为前置环境、模块实现、参考资料和排错。
---

# 附魔配置工作流 · 前置与环境

## 二、前置知识

### Aiyatsbus 架构总览

```
附魔 yml（Packet-Default/xxx.yml）
  ├── basic → ID、名称、最大等级
  ├── rarity → 品质（控制颜色和权重）
  ├── targets → 适用装备（剑、斧、靴子等）
  ├── limitations → 冲突/依赖规则
  ├── display → 显示格式和描述
  ├── variables → 3 种变量（等级变量/常量/持久变量）
  ├── mechanisms → 行为逻辑（事件监听 + 周期任务）
  └── alternative → 原版附魔覆盖（可选）
```

### 目录结构

```
Aiyatsbus
└── enchants ······················· 附魔根目录
    ├── Packet-Default/ ············ 自定义附魔包（按附魔一个 yml）
    │   ├── wings.yml
    │   ├── aiming.yml
    │   └── ...
    ├── Packet-Vanilla/ ············ 原版附魔包（覆盖原版行为）
    │   ├── sharpness.yml
    │   └── ...
    ├── Stellarity/ ················ Stellarity 扩展附魔包
    ├── Funpack/ ··················· Funpack 整蛊附魔包
    ├── display.yml ················ 显示与排版（lore、合并、等级贴图）
    ├── rarity.yml ················· 品质定义（颜色、权重、头颅）
    ├── target.yml ················· 装备类型定义（物品白名单、槽位）
    ├── group.yml ·················· 附魔分组（用于冲突/依赖）
    ├── skill.yml ·················· 技能型附魔全局配置（冷却、触发器）
    └── artifact.yml ··············· 幻化粒子附魔配置
```

- 每个附魔是一个独立的 yml 文件，放在 `Packet-Default/` 或 `Packet-Vanilla/` 下。
- `Packet-Vanilla/` 下的附魔会覆盖原版同名附魔的行为，需在 `alternative.is-vanilla: true`。
- 5 个根配置文件控制全局行为，一般不需要改动。
- 可以创建任意名称的附魔包目录（如 `Stellarity/`、`Funpack/`），用于按来源分类管理附魔。Aiyatsbus 会递归加载 `enchants/` 下所有子目录中的 yml 文件。

### 核心配置文件简述

#### rarity.yml · 品质

定义所有品质及其展示属性。每个品质包含 `name`（中文名）、`color`（显示颜色，使用 MiniMessage 格式 `[{text}](c=#hex)`）、`weight`（战利品/附魔台权重，越大越常见）、`skull`（GUI 头颅纹理 Base64）。

```yaml
common:
  name: 普通
  color: '[{text}](c=#f8f4ed)'
  weight: 1000
  skull: eyJ0ZXh0dXJl...
uncommon:
  name: 优良
  color: '[{text}](c=#66c18c)'
  weight: 500
# ... 稀有 / 史诗 / 传说 / 至宝 / 诅咒 / 幻化
```

服务器实际品质：`common` 普通 · `uncommon` 优良 · `rare` 稀有 · `epic` 史诗 · `legendary` 传说 · `splendid` 至宝 · `curse` 诅咒 · `artifact` 幻化。附魔 yml 中 `rarity` 字段填**中文名**（如 `传说`）。

#### target.yml · 装备类型

定义附魔可应用的装备分类。每类包含 `max`（该类物品最大附魔词条数）、`name`（中文名）、`active-slots`（生效槽位，如 `HAND` / `OFF_HAND` / `HEAD` / `CHEST` / `LEGS` / `FEET`）、`types`（允许的 Bukkit Material 列表）。部分类别带 `dependencies.supports` 表示最低 Minecraft 版本。

```yaml
swords:
  max: 12
  name: 剑
  active-slots:
    - HAND
  types:
    - DIAMOND_SWORD
    - NETHERITE_SWORD
    # ...
```

附魔 yml 中 `targets` 字段填**中文名**（如 `剑`、`靴子`）。可用类别：剑 / 斧 / 矛 / 重锤 / 刷子 / 镐 / 铲 / 锄 / 弓 / 弩 / 三叉戟 / 头盔 / 胸甲 / 护腿 / 靴子 / 鞘翅 / 剪刀 / 盾牌 / 钓鱼竿 / 打火石 / 萝卜钓竿 / 头饰 / 可损坏物品 / 所有物品。

#### group.yml · 附魔分组

用于 `limitations` 中的 `CONFLICT_GROUP` / `DEPENDENCE_GROUP`。每个分组通过 `enchants`（附魔中文名列表）或 `rarities`（品质中文名列表）定义成员。

```yaml
原版增伤类附魔:
  enchants:
    - 锋利
    - 致密
    - 穿刺
    - 破甲
    - 亡灵杀手
    - 节肢杀手
可交易附魔:
  enchants: [ ... ]
  rarities:
    - 普通
    - 优良
    - 稀有
```

#### display.yml · 显示系统

控制附魔在物品 lore 上的展示方式。关键配置：

- `format.default_previous` / `default_subsequent`：全局默认的前部（名称+等级）与后部（描述）格式。
- `combine`：当物品附魔数量超过 `min` 时合并显示，`separate_special` 控制特殊显示的附魔是否独立成行。
- `sort.level` / `sort.rarity`：按等级或品质排序。
- `display-tags`：等级贴图，支持按品质或全局配置 1~10 的中文数字贴图。

等级显示有三种类型，通过 `default_previous` 中的占位符判定：

- `{enchant_display_roman}` — 罗马数字（默认）
- `{enchant_display_number}` — 阿拉伯数字
- `{enchant_display_tag}` — 自定义贴图

#### skill.yml · 技能型附魔

技能型附魔（如右击触发的主动技能）的全局配置：

```yaml
cooldown:
  enable: true
  name: "冷却"           # 附魔 variables 里定义的冷却变量名

trigger:
  action: RIGHT_CLICK    # RIGHT_CLICK / LEFT_CLICK / SWAP
  shift-needed: false    # 是否需要下蹲才能触发
  shift-ignored: true    # 下蹲时是否不触发

privilege:               # 冷却减免权限
  - "aiyatsbus.privilege.skill.cdrate.90:{cooldown}*0.9"
  - "aiyatsbus.privilege.skill.cdrate.80:{cooldown}*0.8"
```

#### artifact.yml · 幻化粒子

定义"幻化"品质附魔的粒子效果形态。支持 `CIRCLE`（环形）、`RNA`（双螺旋）、`SIMPLE`（简单）三种粒子形状，按装备槽位独立配置，并定义在破坏特定矿物时触发粒子。

## 三、开发环境搭建

### 配置目录结构

Aiyatsbus 附魔配置在 `plugins/Aiyatsbus/enchants/` 下。每个附魔一个独立 yml 文件。

```
plugins/Aiyatsbus/
└── enchants/
    └── Packet-Default/
        ├── wings.yml        # 反重力附魔
        ├── propulsion.yml   # 弹射附魔
        └── ...              # 一个附魔一个文件
```

### 控制台命令速查

```bash
# 重载附魔配置
/aiyatsbus reload

# 为玩家给予附魔书：/aiyatsbus give <玩家> <附魔ID> [等级]
/aiyatsbus give @p propulsion 1

# 为物品添加附魔（手持物品）
/aiyatsbus enchant propulsion 1

# 列出所有已加载附魔
/aiyatsbus list

# 调试模式
/aiyatsbus debug
```

### 验证与调试方法

1. **配置验证**：重载无红字报错即为基本 OK。常见错误：
   - `IndexOutOfBoundsException at Variables.kt:100` → leveled 变量缺少 `:` 分隔符
   - `FunctionNotFoundException: 函数名` → 使用了未注册的属性或函数（检查是否用了 `getXxx()` 形式或 `math::xxx` 命名空间）
2. **行为验证**：`/aiyatsbus give` 获取附魔书 → 在铁砧/附魔台测试
3. **脚本调试**：在脚本中加调试消息（暂不支持 fluxon 断点，建议用 `&event::setCancelled(false)` 隔离测试）
4. **日志查看**：`/plugins/Aiyatsbus/logs/` 或服务端 `logs/latest.log`
5. **属性验证**：遇到 `FunctionNotFoundException` 时，优先用 `grep` 搜索服务器上已工作的 yml 文件，确认正确的属性 key 名和函数语法
