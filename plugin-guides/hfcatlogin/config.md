---
title: 配置参考
outline: deep
---

# 配置参考

主配置为 HOCON 格式，位于 `plugins/hfcatlogin/config.conf`（首次启动自动生成，编辑后执行 `/hfc reload configuration` 或重启生效）。下表为常用配置项及默认值，完整注释见生成文件。

## 服务器路由

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `limbo` | `["nl"]` | 未认证玩家被送到的 limbo 服务器名，必须在代理配置中注册 |
| `lobby` | `{ root: "sc" }` | 认证后玩家进入的服务器名；支持按强制 host 分流，`root` 为默认入口 |
| `allow-same-limbo-lobby` | `false` | 是否允许 limbo 与 lobby 为同一服务器（开启有安全风险） |
| `limbo-port-range` | `30000-40000` | NanoLimbo 虚拟登录服可绑定的端口范围 |
| `ping-servers` | `true` | 是否 ping 后端检查在线状态与人数 |
| `fallback` | `true` | 服务器宕机时是否回退到 lobby（false 则踢出） |
| `remember-last-server` | `true` | 是否记住玩家上次所在的服务器（大网络不推荐） |

## 认证与安全

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `seconds-to-authorize` | `300` | 登录/注册时限（秒），负数关闭 |
| `max-login-attempts` | `3` | 密码错误次数达到即踢出，-1 关闭 |
| `milliseconds-to-refresh-login-attempts` | `10000` | 登录尝试计数刷新间隔（ms） |
| `session-timeout` | `3600` | 会话有效秒数，同 IP 且在时限内免登录，≤0 关闭会话 |
| `ip-limit` | `200` | 同一 IP 可注册的最大账号数，≤0 关闭（不推荐关闭） |
| `auto-register` | `false` | 是否自动注册正版昵称（离线玩家无法抢注正版名） |
| `allowed-nickname-characters` | `^[a-zA-Z0-9_]{3,16}$` | 玩家名正则校验 |
| `minimum-password-length` | `3` | 密码最短长度，负数关闭 |
| `minimum-username-length` | `-1` | 新玩家名最短长度，≤0 关闭 |
| `new-uuid-creator` | `CRACKED` | 新账号 UUID 生成方式：`RANDOM` / `CRACKED` / `MOJANG` |
| `profile-conflict-resolution-strategy` | `BLOCK` | 正版/离线重名冲突处理：`BLOCK`（踢出待管理员处理）/ `USE_OFFLINE`（用离线档）/ `OVERWRITE`（正版覆盖离线，有风险） |
| `default-crypto-provider` | `BCrypt-2A` | 密码哈希算法：SHA-256 / SHA-512 / BCrypt-2A / Argon-2ID |

## 提示 UI

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `use-titles` | `true` | 等待认证时使用 Title |
| `use-action-bar` | `true` | 等待认证时使用 ActionBar |
| `milliseconds-to-refresh-notification` | `10000` | 未认证提醒刷新间隔（ms），负数关闭 |
| `debug` | `false` | 调试日志 |

## 数据库

```hocon
database.type = "libreloginnext-mysql"   # 或 libreloginnext-sqlite / libreloginnext-postgresql
database.properties {
  mysql {
    jdbc-url = "jdbc:mysql://localhost:3306/miragedge"
    username = "root"
    password = ""
  }
  # sqlite / postgresql 类似
}
```

> provider id 沿用上游 `libreloginnext-*`，以便直接兼容已有 LibreLoginNext / LibreLogin 数据库。还支持从旧库一键迁移（`migration.on-next-startup`）。

## 邮箱（找回密码）

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `mail.enabled` | `true` | 是否启用邮箱找回 |
| `mail.host` / `mail.port` | `smtp.qq.com` / `587` | SMTP 服务器与端口 |
| `mail.username` / `mail.password` | 见生成文件 | SMTP 登录凭据（建议使用独立授权码） |
| `mail.sender` / `mail.email` | 见生成文件 | 发件人名称 / From 地址 |

## 命令白名单

未认证玩家可执行的命令（见[权限节点](./permissions)）：

```hocon
allowed-commands-while-unauthorized = ["login","register","l","log","reg","hfcatlogin","hfc"]
```
