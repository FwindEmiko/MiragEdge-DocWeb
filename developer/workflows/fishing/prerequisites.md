---
title: 钓鱼系统工作流 · 前置与环境
description: 面向锐界幻境钓鱼内容维护的配置工作流，拆分为前置环境、模块实现、排错和参考资料。
---

# 钓鱼系统工作流 · 前置与环境

## 前置知识

### EvenMoreFish 数据模型

```
稀有度（Rarity）
  ├── 是一个容器，包含多个鱼种
  ├── 定义基础尺寸范围、基础权重、价格倍率
  └── 每个稀有度一个 yml 文件
鱼类（Fish）
  ├── 必须归属于某个稀有度
  ├── 可以带条件（生物群系、天气、时间、世界）
  └── 可自定义物品显示（材质、名称、描述、发光、头颅）
钓竿（Rod）
  ├── 限制玩家能钓到的稀有度/鱼种
  ├── 可配置合成配方
  └── CMD 值被 DimensionFishing 用于检测钓鱼类型
鱼饵（Bait）
  ├── 修改特定稀有度/鱼种的权重
  ├── 支持 +N, -N, *N, /N 四种运算
  └── 可设置购买价格
比赛（Competition）
  ├── 按配置的时间表自动触发
  ├── 支持 8 种比赛类型
  └── 排名奖励（支持金钱、经验、物品、效果、消息、音效）
```

### 目录结构

```
EvenMoreFish/
├── config.yml               # 主配置
├── messages.yml             # 多语言消息
├── guis.yml                 # 界面配置
├── gui-fillers.yml          # 界面填充物
├── rarities/                # 稀有度 + 鱼种
│   ├── common.yml
│   ├── rare.yml
│   ├── epic.yml
│   ├── legendary.yml
│   └── junk.yml
├── rods/                    # 自定义鱼竿
│   └── *.yml
├── baits/                   # 鱼饵配置
│   └── *.yml
└── competitions/            # 比赛定义
    └── *.yml
```

> 每个文件夹内都有 `_example.yml` 提供完整字段参考，插件重载时会自动重置为最新格式。

### 维度钓鱼 CMD 对照

钓竿的 `custom-model-data` 被 DimensionFishing 用于检测钓鱼权限：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
|:------|:--------|:--------|
| 203 | ✅ | ❌ |
| 204 | ❌ | ✅ |
| 205 | ✅ | ✅ |
| 其他 | ❌ | ❌ |

## 开发环境搭建

### 推荐工具

- **VSCode + Red Hat YAML**：语法验证和自动补全
- **EvenMoreFish Wiki**：配置字段速查 [https://evenmorefish.github.io/EvenMoreFish/docs/intro](https://evenmorefish.github.io/EvenMoreFish/docs/intro)

### 控制台命令速查

```bash
# 重载配置
/emf admin reload

# 列出所有鱼
/emf admin fish

# 列出所有稀有度
/emf admin rarity

# 测试给予钓竿
/emf admin rod give <player> <rod_id>

# 测试给予鱼饵
/emf admin bait give <player> <bait_id>

# 手动触发比赛
/emf admin competition start <comp_id>

# 强制结束比赛
/emf admin competition end
```

### 测试世界配置

- 创建超平坦创造世界
- 获得所有稀有度的测试鱼竿
- 站在水边测试钓鱼
