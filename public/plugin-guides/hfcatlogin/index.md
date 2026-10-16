<!-- 来源页面: https://miragedge.top/plugin-guides/hfcatlogin -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/hfcatlogin/index.md -->

# HFcatLogin 使用文档

HFcatLogin 是锐界幻境基于 [LibreLoginNext](https://github.com/MiguVerse/LibreLoginNext) 定制的 Velocity 代理端登录插件（v1.0.0，原名 LibreLoginNext，沿用 LibreLogin 与 FastLogin 血统）。它在代理层完成注册、登录、会话、正版自动登录、邮箱找回与基岩版兼容，未认证的玩家会被拦在虚拟登录服（NanoLimbo）或 limbo 服务器里，登录成功后才被送进正式大厅。

## 功能总览

| 功能 | 说明 |
| :--- | :--- |
| 注册与登录 | `/register`、`/login`，含 `/reg`、`/l`、`/log` 别名 |
| 会话系统 | 同一 IP 在 `session-timeout` 内免登录续登 |
| 正版自动登录 | `/hfc premium` 系列，Mojang 正版账号免输密码 |
| 邮箱找回密码 | `/hfc setemail` 到 `verifyemail` 再到 `resetpassword` 全流程 |
| 虚拟登录服 | 内置 NanoLimbo 集成，未认证玩家进 limbo 而非主服 |
| 基岩版兼容 | Floodgate 集成，基岩版玩家跳过登录 |
| 权限上下文 | LuckPerms 集成，提供 `libreloginnext-authorized` 上下文 |
| 数据库 | MySQL、SQLite、PostgreSQL 三选一 |
| 管理命令 | `/hfc user ...` 全套用户管理 |

## 环境要求与安装

| 项目 | 要求 |
| :--- | :--- |
| 平台 | Velocity 代理端，仅此一个平台 |
| Java | 21+ |
| 可选依赖 | Floodgate（基岩版）、LuckPerms（权限上下文）、NanoLimboPlugin（虚拟登录服） |

1. 构建或获取 `HFcatLogin.jar`，构建产物位于 `Plugin/build/libs/HFcatLogin.jar`。
2. 放入代理端 `plugins/` 目录。
3. 启动代理，自动生成数据目录 `plugins/hfcatlogin/`。
4. 首次启动生成 `config.conf` 与 `messages.conf` 后会自动退出代理，编辑完成再启动。
5. 在 Velocity 配置中注册 limbo 与 lobby 服务器，并对应填写 `config.conf` 的 `limbo` 与 `lobby`。

检测到旧版目录（`librelogin`、`librepremium`、`LibrePremium`）时，插件会自动备份并迁移配置与消息，保留原有数据库。

### 数据目录结构

```text
plugins/hfcatlogin/
├── config.conf              # HOCON 主配置
├── messages.conf            # 全部消息模板（默认中文）
├── forbidden-passwords.txt  # 禁用密码黑名单（约 102 万条）
├── dumps/                   # /hfc dump 诊断导出目录
└── LICENSE.txt
```

## 相关文档

- [命令参考](https://miragedge.top/plugin-guides/hfcatlogin/commands)
- [权限节点](https://miragedge.top/plugin-guides/hfcatlogin/permissions)
- [配置参考](https://miragedge.top/plugin-guides/hfcatlogin/config)
- [注册与登录（玩家版）](https://miragedge.top/start/login)
- 上游原项目文档：[LibreLoginNext Wiki](https://github.com/MiguVerse/LibreLoginNext/wiki)
