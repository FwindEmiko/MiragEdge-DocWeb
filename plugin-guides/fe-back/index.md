---
title: FE_Back 使用文档
description: 锐界幻境 FE_Back 死亡回程插件的部署、配置与维护说明；死亡点记录、/back 返回、每日阶梯死亡惩罚与灵叶金粒拾取结算。
outline: deep
---

# FE_Back 使用文档

FE_Back（死亡回程 / 死亡轮回）是锐界幻境的原创 Paper 插件：记录玩家死亡点并提供 `/back` 返回，同时按**当日累计死亡次数**执行阶梯式灵叶惩罚——进入惩罚档位的死亡会在死亡点掉落一颗发光的「遗失的灵叶」金粒，金粒可被他人拾取结算、本人走回自拾全额归还，而使用 `/back` 返回后则无法再拾取自己的金粒（防套利）。

Java 与基岩（Geyser + Floodgate）双端支持：Java 版死亡提示可点击返回，基岩版重生后自动弹出返回表单。

这套文档按实际部署结构整理：玩家先看[玩家指南](./guide)，服主和维护者可继续查阅[命令参考](./commands)、[配置参考](./config)、[权限节点](./permissions)与[数据存储](./storage)。

## 功能总览

| 功能 | 说明 |
|------|------|
| 💀 死亡点记录 | 每次死亡自动记录最新死亡点，供 `/back` 返回 |
| ⏪ `/back` 返回 | 返回死亡点，默认冷却 5 秒，带饥饿/失明/缓慢等副作用 |
| 📈 每日阶梯惩罚 | 当日累计死亡次数决定惩罚档位，服务器零点清零重置 |
| 🪙 灵叶金粒 | 惩罚档位死亡掉落一颗发光金粒，代表本次损失额度，支持拾取结算 |
| 💰 双货币 | Vault（灵叶）与 PlayerPoints（星痕石）均可作为惩罚/返程货币 |
| 📱 基岩版支持 | 表单返回、`/febtoggle` 开关、§ 颜色码消息兼容 |
| 📋 纯 SQLite 存储 | HikariCP + SQLite（WAL），零配置，无需外部数据库 |
| 🌍 世界排除 | PVP 等指定世界完全禁用（不记录、不惩罚、不能返回） |

## 安装与部署

### 环境要求

| 项目 | 要求 |
|------|------|
| 服务端 | Paper 1.21.11+（`api-version: '1.21.11'`，POSTWORLD 加载） |
| Java | JDK 21+ |
| 构建 | 源码仓库自带 Maven `pom.xml`，`mvn clean package` 即可 |
| 产物 | `[F][死亡惩罚]FE_Back-2.0.jar` |

### 依赖

`plugin.yml` 以 `softdepend` 声明以下插件，**缺装不影响插件启动**，只会禁用对应能力：

| 插件 | 用途 | 必需？ |
|------|------|--------|
| Vault | 灵叶经济：死亡扣罚、返程扣费、金粒拾取入账 | 否（不装则经济结算禁用，死亡记录与返回仍可用） |
| PlayerPoints | 星痕石点券（同上） | 否 |
| Floodgate | 基岩版玩家检测与死亡返回表单 | 否 |
| ProtocolLib | 协议层扩展点（当前仅占位，`use-virtual-packet` 建议保持 false） | 否 |
| Multiverse-Core | 世界显示名使用 MV alias（兼容 4.x / 5.x） | 否 |

运行时依赖 `HikariCP` 与 `sqlite-jdbc` **不打进插件 jar**，由 Paper 根据 `plugin.yml` 的 `libraries` 字段在服务器启动时自动从 Maven Central 下载到 `libraries/` 目录。

### 安装步骤

1. 编译或获取 `[F][死亡惩罚]FE_Back-2.0.jar`
2. 放入服务器 `plugins/` 目录
3. 启动服务器（首次启动 Paper 自动下载 HikariCP / sqlite-jdbc）
4. 按需编辑 `plugins/FE_Back/config.yml` 与 `messages.yml`
5. 执行 `/feb reload` 重载（无需重启服务器）

### 目录结构

启动后自动生成：

```
plugins/
└── FE_Back/
    ├── config.yml        # 主配置（死亡惩罚、返程费用、金粒外观等）
    ├── messages.yml      # 全部消息模板（MiniMessage 语法）
    └── data/
        └── database.db   # SQLite 数据库（WAL 模式）
```

### 首次启动检查

启动日志应包含：

```
[FE_Back] === FE_Back 启动中 ===
[FE_Back] HikariCP + SQLiteDataSource 初始化: plugins/FE_Back/data/database.db ...
[FE_Back] 数据库 schema 初始化完成。
[FE_Back] Vault Economy 已挂载: <经济插件>
[FE_Back] Floodgate API 已挂载。
[FE_Back] Multiverse-Core 检测成功 ...
[FE_Back] === FE_Back 启动完成 ===
```

没有 Vault / Floodgate 时对应行会变成「未安装，跳过 xxx 桥接」，属正常现象。

### 快速上手（服主）

1. 确认已挂载经济插件（Vault 或 PlayerPoints）；未安装经济插件时请把 `return-cost.enabled` 设为 `false`，否则 `/back` 会因「余额不足」无法使用
2. 按需调整 `penalty-tiers` 与 `return-cost.tiers` 阶梯
3. 在 `settings.excluded-worlds` 排除 PVP 等世界
4. `/feb reload` 让配置生效
5. 用 `/feb status 玩家` 核对记录、`/feb tiers` 查看当前惩罚阶梯

## 相关文档

- [玩家指南](./guide)
- [命令参考](./commands)
- [配置参考](./config)
- [权限节点](./permissions)
- [数据存储](./storage)
- 玩家向说明页：[死亡回程](/plugins/custom/death-return)
- [经济系统](/play/systems/economy)
