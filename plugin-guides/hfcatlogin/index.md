---
title: HFcatLogin 使用文档
description: 锐界幻境 HFcatLogin 登录插件（Velocity 代理端）的部署、命令与权限说明；基于 LibreLoginNext 魔改定制，支持正版自动登录、会话续登、邮箱找回与基岩版兼容。
outline: deep
---

# HFcatLogin 使用文档

HFcatLogin 是锐界幻境（MiragEdge）基于 [LibreLoginNext](https://github.com/MiguVerse/LibreLoginNext) 魔改定制的 **Velocity 代理端登录插件**（v1.0.0「The MiragEdge Edition」，原名 LibreLoginNext，沿用 LibreLogin / FastLogin 血统）。它在代理层统一完成**注册 / 登录 / 会话 / 正版自动登录 / 邮箱找回 / 基岩版兼容**，未认证的玩家会被拦在虚拟登录服（NanoLimbo）或 limbo 服务器里，登录成功后才被送进正式大厅。

> 本页只讲**命令使用**与**权限控制**。技术实现、构建方式与配置项见下方对应章节。

## 功能总览

| 功能 | 说明 |
|------|------|
| 🔑 注册 / 登录 | `/register`、`/login`（含 `/reg`、`/l`、`/log` 别名） |
| 🛡️ 会话系统 | 同一 IP 在 `session-timeout` 内免登录续登 |
| ✅ 正版自动登录 | `/hfc premium` 系列，Mojang 正版账号免输密码 |
| 📧 邮箱找回密码 | `/hfc setemail` → `verifyemail` → `resetpassword` 全流程 |
| 🧱 虚拟登录服 | 内置 NanoLimbo 集成，未认证玩家进 limbo 而非主服 |
| 📱 基岩版兼容 | Floodgate 集成，基岩玩家跳过登录 |
| 🔑 权限上下文 | LuckPerms 集成，提供 `libreloginnext-authorized` 上下文 |
| 🗄️ 数据库 | MySQL / SQLite / PostgreSQL 三选一 |
| 🧑‍💼 管理命令 | `/hfc user ...` 全套用户管理 |

## 环境要求与安装

| 项目 | 要求 |
|------|------|
| 平台 | **Velocity**（代理端，仅此一个平台） |
| Java | 21+ |
| 可选依赖 | Floodgate（基岩版）、LuckPerms（权限上下文）、NanoLimboPlugin（虚拟登录服） |

安装步骤：

1. 构建或获取 `HFcatLogin.jar`（构建产物：`Plugin/build/libs/HFcatLogin.jar`）
2. 放入代理端 `plugins/` 目录
3. 启动代理，自动生成数据目录 `plugins/hfcatlogin/`
4. 首次启动生成 `config.conf` 与 `messages.conf` 后**自动退出代理**，编辑完成再启动
5. 在 Velocity 配置中注册 limbo / lobby 服务器，并对应填写 `config.conf` 的 `limbo` / `lobby`

> 若检测到旧版目录（`librelogin` / `librepremium` / `LibrePremium`），会自动备份并迁移配置与消息，保留原有数据库。

### 数据目录结构

```
plugins/hfcatlogin/
├── config.conf              # HOCON 主配置
├── messages.conf            # 全部消息模板（默认中文）
├── forbidden-passwords.txt  # 禁用密码黑名单（约 102 万条）
├── dumps/                   # /hfc dump 诊断导出目录
└── LICENSE.txt
```

## 快速上手（玩家视角）

1. 首次进入服务器：`/register <密码> <重复密码>`（例：`/register abc123 abc123`）
2. 之后再次进入：`/login <密码>`
3. 修改密码：`/hfc changepass <旧密码> <新密码>`
4. 绑定邮箱以便找回密码：`/hfc setemail <邮箱> <密码>` → 收邮件 → `/hfc verifyemail <验证码>`
5. 忘记密码：`/hfc resetpassword` → 收邮件 → `/hfc confirmpasswordreset <验证码> <新密码> <重复新密码>`

## 相关文档

- [命令参考](./commands)
- [权限节点](./permissions)
- [配置参考](./config)
- 上游原项目文档：[LibreLoginNext Wiki](https://github.com/MiguVerse/LibreLoginNext/wiki)
