---
title: MiragEdgeTitle 称号与入服消息插件
description: MiragEdgeTitle 锐界幻境自研称号与入服消息插件：自定义玩家称号与入服消息展示。
head:
  - - meta
    - name: keywords
      content: MiragEdgeTitle, 称号插件, 入服消息, Minecraft 称号, 自研插件
---

#  MiragEdgeTitle — 称号与入服消息

**项目状态：C**

---

## 插件概览

MiragEdgeTitle 提供两套独立运作的身份表达系统：

| 系统 | 说明 |
|------|------|
| 称号系统 | 称号商城 · 仓库管理 · 自定义称号 · 条件解锁 · 聊天前缀显示 |
| 入服消息系统 | 成就触发解锁 · 个性化进/退服广播 · 展示台管理 |

两套互不依赖，可单独运作。

---

## 技术架构

| 项目 | 说明 |
|------|------|
| 核心 | Paper API 1.21.1+ · JDK 25 · Maven |
| 结构 | `paper/` 子模块（服务器端）+ `proxy/` 子模块（Velocity 代理端，跨服同步） |
| 数据库 | SQLite（默认）/ MySQL 双模式 |
| 基岩版 | Floodgate Form 完整适配，含整合主菜单 |
| 跨服 | PluginMessage 通道 `miragedge:joinquit`，选项启用 |
| 开源 | MIT 协议 · [GitHub 仓库](https://github.com/fwindemiko/MiragEdgeTitle) |

### 前置依赖

| 插件 | 要求 | 用途 |
|------|:--:|------|
| Vault | 必须 | 称号商城经济交易 |
| PlaceholderAPI | 可选 | PAPI 变量扩展 · CUSTOM 条件解锁 · 兼容旧 `%playertitle_use%` |
| PlayerPoints | 可选 | 点券（星痕石）购买称号 |
| Floodgate | 可选 | 基岩版表单适配 |

---

## 配置说明

安装后在 `plugins/MiragEdgeTitle/` 下自动生成：

| 文件 | 用途 |
|------|------|
| `config.yml` | 数据库类型 · 经济开关 · 跨服桥接 · 自定义称号限制 |
| `titles.yml` | 系统称号定义（30+ 个预设称号，含旧数据迁移与新增） |
| `messages.yml` | 入服消息定义（11 种，含 8 个成就型 + 3 个基础型） |

`/mtadmin reload` 运行时热重载全部配置。

### 消息格式

模板同时支持 § 颜色码、MiniMessage 渐变（`<gradient:...>`）、十六进制颜色。首、退服消息分别配置，共用解锁条件。

---

## 称号系统

### 所有来源

| 来源 | 货币/条件 | 示例 |
|------|-----------|------|
| 商城购买（金币） | Vault · 灵叶 | 萌新(免费) / VIP(1000灵叶/30天) / 赞助者(1万/永久) |
| 商城购买（点券） | PlayerPoints · 星痕石 | 邮递员(80) / 初音未来的狗(520) / 肝帝传说(240) |
| 在线时长解锁 | ONLINETIME | 岛民证(50h) / 夜猫子(200h) / 元老玩家(500h) |
| 权限解锁 | 满足权限后自动获得 | 跑酷大师 / 下界征服者 / 终末英雄 |
| CUSTOM 条件 | PAPI 统计变量达标 | 万里征程(步行100km) / 合成狂魔(合成1万次) |
| 管理员发放 | 通过 `/mtadmin give` 直接给予 | 任何称号均可 |
| 玩家自创 | 每日上限 3 个，最多 32 字 | 自定义文字，带颜色需权限 |

### 自定义称号

`/mt custom <内容>` 创建专属称号。权限 `miragedge.title.custom.colored` 控制是否允许 MiniMessage 颜色标签。

---

## 入服消息系统

### 成就式解锁（全服广播）

击杀/完成特定目标时，自动解锁对应入服消息，伴随全服广播：

| 消息名称 | 解锁条件 | 监听机制 |
|---------|---------|---------|
| 牢玩家 | 累计在线 10,000 分钟 | 周期性在线检查 |
| 探险家 | 步行满 1,000 万厘米 | PAPI 条件检查 |
| 尊贵会员 | 拥有 `miragedge.premium` 权限 | 权限检查 |
| **屠龙者** | **击杀末影龙** | EnderDragonKillListener · 全服广播 |
| **凋零猎手** | **击杀凋零** | WitherKillListener · 全服广播 |
| **冒险家** | **完成「探索的时光」进度** | AdventuringTimeListener · 全服广播 |
| **怪物猎人** | **完成「赶尽杀绝」进度** | MonsterHunterListener · 全服广播 |
| **村庄英雄** | **完成「光辉岁月」进度** | HeroOfTheVillageListener · 全服广播 |
| **行商巨贾** | **完成「繁荣贸易」进度** | TradeVillagerListener · 全服广播 |
| **幻境食神** | **食用七彩蛋羹** | 由 FwindEmiCore 检测 |
| **龙之胃** | **食用煎龙蛋** | 由 FwindEmiCore 检测 |

所有成就监听器设兜底权限节点（PERMISSION 型），管理员可手动授予，适用于插件安装前已满足条件的玩家。

### 展示台管理

`/mtmessage` 打开成就展示台，查看已解锁/未解锁消息，支持装备、卸下、预览。

---

## 命令参考

### 玩家命令

| 命令 | 功能 |
|------|------|
| `/mt` | 无参数：JE 开仓库 / BE 开主菜单 |
| `/mt help` | 帮助 |
| `/mt shop` | 称号商城 |
| `/mt storage` | 称号仓库 |
| `/mt custom <内容>` | 自定义称号 |
| `/mt equip <ID>` | 装备称号 |
| `/mt unequip` | 卸下称号 |
| `/mt buy <ID>` | 购买称号 |
| `/mtmessage` | 入服消息展示台 |
| `/mtmessage equip <ID>` | 装备入服消息 |
| `/mtmessage unequip` | 恢复默认 |

### 管理员命令

| 命令 | 功能 |
|------|------|
| `/mtadmin list` | 列出所有称号 |
| `/mtadmin create ...` | 创建称号 |
| `/mtadmin delete <ID>` | 删除称号 |
| `/mtadmin give <玩家> <ID> [天数]` | 发放称号 |
| `/mtadmin coupon <玩家> <称号ID>` | 发放类兑换券（CouponService） |
| `/mtadmin reload` | 热重载配置 |

---

## 权限节点

| 权限 | 默认 | 说明 |
|------|:--:|------|
| `miragedge.admin` | OP | 管理员权限 |
| `miragedge.title.custom.colored` | 无 | 允许在自定义称号中使用颜色与 MiniMessage 标签 |

---

## PAPI 变量（两组）

| 变量 | 值类型 | 说明 |
|------|:------:|------|
| `%miragedgetitle_title%` | String | 当前装备的称号内容 |
| `%miragedgetitle_title_name%` | String | 当前装备的称号名称 |
| `%miragedgetitle_title_with_brackets%` | String | `[内容]` 格式 |
| `%miragedgetitle_title_count%` | int | 拥有称号数量 |
| `%miragedgetitle_has_title_<id>%` | boolean | 是否拥有指定称号 |
| `%miragedgetitle_equipped_message%` | String | 当前入服消息名称 |
| `%miragedgetitle_unlocked_messages%` | int | 已解锁消息数 |
| `%miragedgetitle_has_message_<id>%` | boolean | 是否解锁指定消息 |
| `%playertitle_use%` | String | 兼容旧版：当前称号（同 title_with_brackets） |

PAPI 扩展包含 `PlaceholderCache` 短期缓存层，避免高频请求阻塞，数据变更后自动失效。
