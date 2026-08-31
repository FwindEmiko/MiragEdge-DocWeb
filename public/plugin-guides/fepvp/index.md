<!-- 来源页面: https://miragedge.top/plugin-guides/fepvp -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/fepvp/index.md -->

# FE_PVP 使用文档

FE_PVP 是锐界幻境的独立 PvP 竞技系统，提供**单挑 1v1、团队竞技、快速匹配、饥饿游戏、押注决斗、观战、装备组合、ELO 段位与排行榜**等功能。

这套文档按实际部署结构整理：普通玩家优先阅读[玩家指南](https://miragedge.top/plugin-guides/fepvp/guide)，服主和维护者可继续查看[竞技场管理](https://miragedge.top/plugin-guides/fepvp/arena)、[装备组合管理](https://miragedge.top/plugin-guides/fepvp/kit)、[命令参考](https://miragedge.top/plugin-guides/fepvp/commands)、[配置参考](https://miragedge.top/plugin-guides/fepvp/config)、[权限节点](https://miragedge.top/plugin-guides/fepvp/permissions)与[数据存储](https://miragedge.top/plugin-guides/fepvp/storage)页面。

## 功能总览

| 模式 | 说明 |
|------|------|
| ⚔ 单挑 1v1 | 创建/加入房间，选图 → 选装备 → 开打 |
| 👥 团队竞技 2v2/3v3/4v4 | 红蓝对抗，淘汰制 / 击杀数制两种规则 |
| 🥣 饥饿游戏 | 单人求生，抢补给箱活到最后（FFA） |
| 🎲 快速匹配 | 一键自动建房间，随机地图 |
| 押注决斗 | 单挑专属：双方对押，胜者通吃（支持灵叶/星痕石） |
| 排行榜 / ELO 段位 | 8 段位体系，分页排行榜 |
| 装备组合 | 管理员预设装备，赛前 GUI 选择 |
| 方块复原 | 比赛中可破坏/放置，赛后分批复原（tile 保真） |
| 背包归还 | 比赛结束 / 断线重连自动恢复背包 |
| 每日奖励 | 胜利/平局发放星痕石与灵叶，带每日上限 |
| 世界保护 | 非竞技状态禁止进入竞技场世界（可绕过） |

## 安装与部署

### 环境要求

| 项目 | 要求 |
|------|------|
| 服务端 | Paper 1.21.11+（Paper 26.2+） |
| Java | JDK 21+（推荐 Zulu 25） |
| 内存 | 无额外要求，插件本身 < 50MB |

#### 可选依赖

| 插件 | 用途 | 必需？ |
|------|------|--------|
| PlaceholderAPI | 占位符支持（30+ 个占位符） | 否 |
| Multiverse-Core | 多世界竞技场管理 | 否 |
| Vault | 押注局"灵叶"货币、每日奖励发放 | 否（用押注/奖励才需要） |
| PlayerPoints | 押注局"星痕石"货币、每日奖励发放 | 否（用押注/奖励才需要） |
| SkinsRestorer | 排行榜/玩家头颅皮肤 | 否 |

### 安装步骤

1. 下载 ```[F][竞技场]FE_PVP.jar``` 放入服务器 ```plugins/``` 目录
2. 启动服务器，插件自动生成配置文件
3. 按需编辑 ```plugins/FE_PVP/config.yml```
4. 执行 ```/fepvp admin reload``` 或重启服务器

### 目录结构

打开服务器后自动生成：

```
plugins/
└── FE_PVP/
    ├── config.yml        # 主配置
    ├── lang.yml          # 语言文件
    ├── arenas.yml        # 竞技场数据（自动生成）
    ├── kits.yml          # 装备组合数据（自动生成）
    ├── fepvp.db          # SQLite 数据库（默认）
    ├── daily-rewards.yml # 每日奖励领取量（自动生成）
    ├── pending-restore/  # 方块恢复 + 背包备份（崩溃恢复用，正常自动清理）
    └── data-loss-backup.yml  # MySQL 不可达时的数据兜底备份（异常时生成）
```

### 首次启动检查

启动后控制台应看到：

```
[FE_PVP] SQLite database initialized.
[FE_PVP] Loaded 0 arena(s).
[FE_PVP] Loaded 0 kit(s).
[FE_PVP] FE_PVP has been enabled!
```

如果看到 PlaceholderAPI expansion 注册成功则说明 PAPI 已对接；使用押注/奖励时还会看到 Vault / PlayerPoints 挂钩日志。

### 数据库选择

默认使用 SQLite（零配置，已内嵌驱动）。如需 MySQL，编辑 ```config.yml```：

```yaml
database:
  type: mysql
  mysql:
    host: localhost
    port: 3306
    database: fepvp
    user: root
    password: "your_password"
```

> **注意**：MySQL 需要额外放入 [mysql-connector-j](https://dev.mysql.com/downloads/connector/j/) 驱动 jar 到 ```plugins/FE_PVP/lib/```，重启后自动使用 MySQL。
> SQLite 与 MySQL 数据不互通，切换前需手动迁移。

## 快速上手（服主）

1. **创建竞技场**：```/fepvp arena create 森林竞技场 duel```，然后依次
   ```/fepvp arena setworld 森林竞技场```、```/fepvp arena setspawn 森林竞技场 1```、
   ```/fepvp arena setspawn 森林竞技场 2```
2. **创建装备组合**：穿好装备后 ```/fepvp kit create 经典PvP```
3. **开服测试**：```/fepvp``` 打开大厅 GUI

完整流程见[竞技场管理](https://miragedge.top/plugin-guides/fepvp/arena)与[装备组合管理](https://miragedge.top/plugin-guides/fepvp/kit)。

## 相关文档

- [安装配置](#安装与部署)（本页）
- [玩家指南](https://miragedge.top/plugin-guides/fepvp/guide)
- [竞技场管理](https://miragedge.top/plugin-guides/fepvp/arena)
- [装备组合管理](https://miragedge.top/plugin-guides/fepvp/kit)
- [饥饿游戏模式](https://miragedge.top/plugin-guides/fepvp/hunger-games)
- [押注局](https://miragedge.top/plugin-guides/fepvp/betting)
- [配置参考](https://miragedge.top/plugin-guides/fepvp/config)
- [权限节点](https://miragedge.top/plugin-guides/fepvp/permissions)
- [命令参考](https://miragedge.top/plugin-guides/fepvp/commands)
- [数据存储](https://miragedge.top/plugin-guides/fepvp/storage)
