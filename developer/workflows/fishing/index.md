---
title: 钓鱼系统工作流
description: EvenMoreFish 钓鱼内容维护的工作流入口。说明稀有度与鱼类与钓竿与鱼饵与比赛五层数据模型、插件目录结构、维度钓鱼的 CMD 对照，以及各页面职责。
outline: [2, 3]
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, EvenMoreFish, 钓鱼系统, 自定义鱼类, 钓竿配置, 鱼饵配置, 钓鱼比赛, DimensionFishing, AI Skills"
---

# 钓鱼系统工作流

钓鱼内容全部由 EvenMoreFish 的 YAML 定义。这页给出数据模型、目录归属与页面索引。

## 数据模型

```text
稀有度（Rarity）
  ├── 是一个容器，包含多个鱼种
  ├── 定义基础尺寸范围、基础权重、价格倍率
  └── 每个稀有度一个 yml 文件

鱼类（Fish）
  ├── 必须归属于某个稀有度
  ├── 可以带条件：生物群系、天气、时间、世界
  └── 可自定义物品显示：材质、名称、描述、发光、头颅

钓竿（Rod）
  ├── 限制玩家能钓到的稀有度与鱼种
  ├── 可配置合成配方
  └── CMD 值被 DimensionFishing 用于检测钓鱼类型

鱼饵（Bait）
  ├── 修改特定稀有度或鱼种的权重
  ├── 支持 +N、-N、*N、/N 四种运算
  └── 可设置购买价格

比赛（Competition）
  ├── 按配置的时间表自动触发
  ├── 支持 8 种比赛类型
  └── 排名奖励支持金钱、经验、物品、效果、消息、音效
```

鱼类绑定在稀有度文件内。每一条鱼都必须归属于某个稀有度。

## 目录结构

```text
EvenMoreFish/
├── config.yml               # 主配置
├── messages.yml             # 多语言消息
├── guis.yml                 # 界面配置
├── gui-fillers.yml          # 界面填充物
├── rarities/                # 稀有度与鱼种
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

每个文件夹内都有 `_example.yml` 提供完整字段参考，插件重载时会自动重置为最新格式。

## 维度钓鱼 CMD 对照

钓竿的 `custom-model-data` 被 DimensionFishing 用于检测钓鱼权限：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
| --- | --- | --- |
| 203 | 支持 | 不支持 |
| 204 | 不支持 | 支持 |
| 205 | 支持 | 支持 |
| 其他 | 不支持 | 不支持 |

## 页面索引

| 页面 | 内容 |
| --- | --- |
| [前置与环境](./prerequisites) | 数据模型、目录结构、CMD 对照表、控制台命令、测试环境 |
| [模块工作流](./modules) | 鱼类、钓竿、鱼饵、比赛、维度钓鱼联动五类配置 |
| [排错与交付](./troubleshooting) | 未覆盖问题的处理策略 |
| [AI 交付规范](../_shared/ai-delivery) | 所有工作流共用的输出格式要求 |

## 参考资源

### 官方文档

- [EvenMoreFish Wiki](https://evenmorefish.github.io/EvenMoreFish/docs/intro)
- [物品配置参考](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/items)
- [比赛类型参考](https://evenmorefish.github.io/EvenMoreFish/docs/play/competitions/types)
- [奖励类型参考](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/reward-types)
- [条件要求参考](https://evenmorefish.github.io/EvenMoreFish/docs/play/requirements)

### 代码仓库

- [EvenMoreFish GitHub](https://github.com/EvenMoreFish/EvenMoreFish)
- [DimensionFishing（自研）](https://github.com/FCelestial/DimensionFishing)

### 服内参考

- `plugins/EvenMoreFish/` 下的所有 yml 是生产环境实际配置。
- `plugins/EvenMoreFish/*/_example.yml` 是完整字段参考模板。

## 校验

```bash
# 重载配置
/emf admin reload

# 列出所有鱼与稀有度
/emf admin fish
/emf admin rarity

# 给予测试钓竿与鱼饵
/emf admin rod give <player> <rod_id>
/emf admin bait give <player> <bait_id>

# 手动触发比赛
/emf admin competition start <comp_id>

# 强制结束比赛
/emf admin competition end
```
