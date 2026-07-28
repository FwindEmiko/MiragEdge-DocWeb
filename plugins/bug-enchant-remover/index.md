---
title: BugEnchantRemover 异常附魔清理
outline: deep
---

# BugEnchantRemover — 异常附魔自动清理

> 自动检测并清除数据包/插件带来的异常附魔，支持 UberEnchant PDC 附魔兼容。

## 简介

**BugEnchantRemover** 是锐界幻境服务器自研的 Paper 插件，用于解决以下痛点：

- **数据包异常附魔**：部分数据包在移除附魔定义后，已生成的附魔书会变成"无附魔的空书"或残留无效附魔 ID
- **UberEnchant PDC 附魔**：UberEnchant 8.12.10+ 不再走 Bukkit 注册表，改用 PDC 存储附魔，传统插件完全读不到
- **GUI 道具误删**：很多 GUI 道具用"附魔书 + CustomModelData"实现，简单清理逻辑会误删这些道具

本插件通过**关键词匹配 + PDC 直读 + 自定义物品保护**三重机制，安全地清理异常附魔。

## 环境要求

| 项目 | 要求 |
|------|------|
| 服务端 | Paper 1.18.2+（兼容 Folia） |
| Java | JDK 21+ |
| 内存 | 无额外要求 |
| 可选依赖 | UberEnchant 8.12.10+（仅在需要清理 UberEnchant 附魔时） |

::: tip 兼容性说明
插件以 paper-api 1.18.2 编译，运行时自动适配高版本服务端。
UberEnchant 1.20.5+ 专有的 `setEnchantmentGlintOverride` API 通过反射调用，旧版本服务端会静默跳过发光清理逻辑（不影响 PDC 数据清理）。
:::

## 安装步骤

1. 从 [GitHub 仓库](https://github.com/fwindemiko/FE_BugEnchantRemover) 下载最新版 jar
2. 将 `[B][附魔清道夫]BugEnchantRemover.jar` 放入服务器 `plugins/` 目录
3. 启动服务器，插件自动生成 `plugins/BugEnchantRemover/config.yml`
4. 按需编辑 `config.yml`（参考 [配置参考](./config)）
5. 执行 `/bugenchantreload` 或重启服务器生效

## 目录结构

```
plugins/
└── BugEnchantRemover/
    └── config.yml        # 唯一配置文件
```

::: info 无数据库
本插件不持久化任何数据，所有清理都是即时的。配置文件仅用于存储关键词与开关。
:::

## 首次启动检查

启动后控制台应看到：

```
[BugEnchantRemover] BugEnchantRemover 插件已启用
[BugEnchantRemover] 已加载 1 个附魔ID关键词
[BugEnchantRemover] 已加载 1 个翻译键关键词
[BugEnchantRemover] 检查间隔: 21 tick
[BugEnchantRemover] 全异常附魔时移除整本附魔书: 开启
[BugEnchantRemover] 移除空附魔书: 开启
[BugEnchantRemover] 保护自定义物品(GUI道具): 开启
[BugEnchantRemover] 清理 UberEnchant 发光残留: 开启
[BugEnchantRemover] 检测到服务端类型: Paper | 调度模式: 异步
```

如看到 `Folia | 调度模式: 同步`，说明插件已自动适配 Folia 服务端。

## 快速开始（3 分钟）

### 步骤 1：识别异常附魔

手持可疑物品（附魔书/装备），执行：

```
/bugenchanttest
```

插件会输出该物品的完整附魔信息，包括：

- 标准附魔列表（ID、命名空间、键名、翻译键、等级、是否检测为 Bug）
- UberEnchant PDC 附魔列表（如有）
- 识别为自定义物品（GUI 道具）的判定结果
- 预测处理结果（不会真的清理，仅显示）

### 步骤 2：添加关键词

编辑 `config.yml`，将异常附魔的特征关键词加入：

```yaml
enchant-id-keywords:
  - "nova_structures"      # 数据包命名空间
  - "uberenchant:"         # 清理所有 UberEnchant 药水效果附魔

translation-key-keywords:
  - "enchantment.dnt"      # 数据包翻译键前缀
```

### 步骤 3：重载并验证

```
/bugenchantreload
```

重载后会显示加载摘要，确认关键词数量无误后，再次手持物品执行 `/bugenchanttest` 查看预测结果。

### 步骤 4：观察自动清理

插件每 21 tick（约 1 秒）自动扫描所有在线玩家的背包、副手、打开的容器，自动清理匹配的异常附魔。也可以手动触发：

```
/bugenchantscan
```

## 命令一览

| 命令 | 权限 | 说明 |
|------|------|------|
| `/bugenchantreload` | `bugenchantremover.reload` | 重载配置并显示加载摘要 |
| `/bugenchantscan` | `bugenchantremover.scan` | 手动扫描背包并清理（含统计反馈） |
| `/bugenchanttest` | `bugenchantremover.test` | 检测手持物品的附魔详情与预测处理结果 |

详细命令说明见 [命令参考](./commands)。

## 工作原理

### 检测流程

```
玩家背包物品
  │
  ├─ 1. 读取标准 Bukkit 附魔（meta.getEnchants / meta.getStoredEnchants）
  │      └─ 与关键词列表比对（id / namespace / key / translationKey 四路匹配）
  │
  ├─ 2. 读取 UberEnchant PDC 附魔（meta.getPersistentDataContainer）
  │      ├─ uberenchant:uberenchantment（普通物品）
  │      └─ uberenchant:storeduberenchantment（附魔书）
  │      └─ 兼容两种结构：直接 INTEGER / 嵌套 TAG_CONTAINER.level
  │
  └─ 3. 自定义物品保护检查
         ├─ 有 displayName / CustomModelData / RepairCost / AttributeModifiers → 保护
         ├─ PDC 中有非 UberEnchant 数据 → 保护
         └─ 纯 UberEnchant 物品 → 跳过 Lore/ItemFlags 检查（UberEnchant 自动维护的）
```

### 处理策略

| 物品类型 | 异常附魔情况 | 处理方式 |
|----------|--------------|----------|
| 附魔书 | 无异常附魔，且为空书 | 删除整本（可配置） |
| 附魔书 | 全部为异常附魔 | 删除整本（可配置） |
| 附魔书 | 部分为异常附魔 | 仅移除异常附魔，保留正常 |
| 普通物品 | 有异常附魔 | 移除异常附魔 |
| 任何 | 识别为自定义物品（GUI 道具） | **完全跳过，不修改 meta** |

## 接下来

- [命令参考](./commands) — 三条命令的完整说明
- [配置参考](./config) — 所有配置项的详细解释
- [实战场景](./scenarios) — 常见数据包异常的配置示例
- [UberEnchant 兼容](./uber_enchant) — v1.3 新特性详解
