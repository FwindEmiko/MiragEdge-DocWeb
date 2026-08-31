---
title: 权限节点
outline: deep
---

# 权限节点

所有管理命令的权限统一使用 `hfcatlogin.*` 前缀。玩家日常命令（`/login`、`/register`、`/hfc changepass`、premium 系列、邮箱系列）**不需要任何权限**，人人可用。

## 权限总表

| 权限 | 对应命令 | 说明 |
|------|---------|------|
| `hfcatlogin.email.test` | `/hfc email test` | 测试邮件发送 |
| `hfcatlogin.dump` | `/hfc dump` | 导出诊断信息（`dumps/dump-日期.json`） |
| `hfcatlogin.reload.configuration` | `/hfc reload configuration` | 重载主配置 |
| `hfcatlogin.reload.messages` | `/hfc reload messages` | 重载消息模板 |
| `hfcatlogin.user.info` | `/hfc user info` | 查看用户信息 |
| `hfcatlogin.user.migrate` | `/hfc user migrate` | 迁移用户数据到新用户名 |
| `hfcatlogin.user.unregister` | `/hfc user unregister` | 取消注册（清密码） |
| `hfcatlogin.user.delete` | `/hfc user delete` | 删除用户 |
| `hfcatlogin.user.premium` | `/hfc user premium` | 为玩家启用正版自动登录 |
| `hfcatlogin.user.cracked` | `/hfc user cracked` | 为玩家关闭正版自动登录 |
| `hfcatlogin.user.register` | `/hfc user register` | 以管理员身份注册账号 |
| `hfcatlogin.user.login` | `/hfc user login` | 强制让在线未认证玩家登录 |
| `hfcatlogin.user.emailoff` | `/hfc user emailoff` | 清除玩家邮箱 |
| `hfcatlogin.user.setemail` | `/hfc user setemail` | 直接设置玩家邮箱 |
| `hfcatlogin.user.pass-change` | `/hfc user pass-change` | 直接重置玩家密码 |
| `hfcatlogin.user.alts` | `/hfc user alts` | 查询同 IP 关联账号 |

> 插件**没有**为这些节点声明默认值：不授予任何权限时，管理命令均不可用。`hfcatlogin.user.*` 可整体授权（LuckPerms 通配符），但「一键全部管理权限」这样的节点（如 `hfcatlogin.admin`）并不存在，需逐项或按通配符授予。

## 未认证状态下的命令白名单

未登录/未注册的玩家被拦在 limbo 中，此时**只能执行白名单命令**，其余命令一律被拦截（聊天也被静默屏蔽）。白名单由配置 `allowed-commands-while-unauthorized` 控制，默认值：

```hocon
allowed-commands-while-unauthorized = [
  "login", "register", "l", "log", "reg",   # 登录 / 注册及别名
  "hfcatlogin", "hfc"                        # 主命令（含其子命令）
]
```

因此未认证玩家可以执行 `/hfc` 及其玩家子命令（改密 / premium / 邮箱），但无法使用任何其他插件的命令——这是登录前最基础的权限控制。

## LuckPerms 集成（权限上下文）

装 `LuckPerms` 后，HFcatLogin 会注册一个上下文计算器，提供上下文键：

```
libreloginnext-authorized = true | false
```

（上下文键名沿用上游的 `libreloginnext-authorized`，未随插件改名而修改。）

用途示例——给「已认证玩家」单独放行某个命令、或给「未认证玩家」特殊处理：

```bash
# 只允许已登录玩家使用某命令
/lp group default permission set some.plugin.cmd true "server=* libreloginnext-authorized=true"

# 或反过来，给未登录玩家单独一套权限
/lp group default permission set some.plugin.cmd false "libreloginnext-authorized=true"
/lp group default permission set some.plugin.cmd true "libreloginnext-authorized=false"
```

这样权限系统就能感知「玩家此刻是否已通过 HFcatLogin 认证」，实现更细粒度的登录前/后权限差异。

## 权限授予示例（LuckPerms）

```bash
# 管理员：授予全部用户管理 + 维护命令（通配符）
/lp group admin permission set hfcatlogin.user.* true
/lp group admin permission set hfcatlogin.reload.* true
/lp group admin permission set hfcatlogin.dump true
/lp group admin permission set hfcatlogin.email.test true

# 客服：只给查看信息 + 小号排查
/lp group staff permission set hfcatlogin.user.info true
/lp group staff permission set hfcatlogin.user.alts true
```
