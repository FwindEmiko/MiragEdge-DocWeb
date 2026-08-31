---
title: 命令参考
outline: deep
---

# 命令参考

HFcatLogin 将全部功能收归**主命令 + 子命令**结构：主命令 `/hfcatlogin`（别名 `/hfc`），仅保留 `/login`、`/register` 两个独立快捷命令。所有命令支持 Tab 补全。

> 管理类子命令标注了对应权限节点，**未授权会提示「您没有权限使用此命令！」**。玩家命令（登录 / 注册 / 改密 / premium / 邮箱）不需要额外权限，但**未认证状态下只能执行白名单命令**，详见[权限节点](./permissions)。

## 登录 / 注册（独立命令）

| 命令 | 语法 | 说明 |
|------|------|------|
| `/login` | `/login <密码>` | 登录已有账号；别名 `/l`、`/log` |
| `/register` | `/register <密码> <重复密码>` | 首次进入注册新账号；别名 `/reg` |

行为细节：

- 仅玩家可用，控制台无法执行
- 密码错误会触发 `max-login-attempts`（默认 3 次）踢出；登录成功即授权并发送到大厅
- 注册要求两次密码一致，且密码不得在禁用名单中、不得短于 `minimum-password-length`

## 主命令 /hfc（玩家功能）

| 子命令 | 语法 | 说明 |
|--------|------|------|
| （无） | `/hfc` | 显示关于信息（版本 / 作者 / 源码 / 许可证） |
| `changepass` | `/hfc changepass <旧密码> <新密码>` | 修改自己的密码，需验证旧密码 |
| `premium enable` | `/hfc premium enable <密码>` | 申请启用正版自动登录（需验证密码，随后确认） |
| `premium confirm` | `/hfc premium confirm` | 确认启用正版自动登录（**5 分钟内**有效） |
| `premium disable` | `/hfc premium disable` | 关闭正版自动登录 |
| `setemail` | `/hfc setemail <邮箱> <密码>` | 设置找回邮箱，发送验证邮件（每玩家每分钟 1 次） |
| `verifyemail` | `/hfc verifyemail <验证码>` | 验证邮箱（**10 分钟**内有效） |
| `resetpassword` | `/hfc resetpassword` | 向已绑定邮箱发送重置邮件（每玩家每分钟 1 次） |
| `confirmpasswordreset` | `/hfc confirmpasswordreset <验证码> <新密码> <重复新密码>` | 确认重置密码（10 分钟内有效） |

### 正版自动登录流程（premium）

1. 玩家执行 `/hfc premium enable <密码>`，插件向 Mojang API 校验账号真实性
2. 执行 `/hfc premium confirm` 确认（5 分钟有效）
3. 确认后玩家会被**踢出并重新登录**，此后以正版身份进入自动登录
4. 想关闭时执行 `/hfc premium disable`，同样会踢出重连

> 启用后该账号将**无法再以离线（cracked）客户端加入**。账号不存在于 Mojang 数据库时会提示「此帐户不存在于 Mojang 数据库中！」。

## 主命令 /hfc（管理员功能）

管理子命令面向 `Audience`（控制台与玩家均可执行）。

| 子命令 | 语法 | 权限 |
|--------|------|------|
| `email test` | `/hfc email test <邮箱>` | `hfcatlogin.email.test` |
| `dump` | `/hfc dump` | `hfcatlogin.dump` |
| `reload configuration` | `/hfc reload configuration` | `hfcatlogin.reload.configuration` |
| `reload messages` | `/hfc reload messages` | `hfcatlogin.reload.messages` |

### 用户管理（/hfc user ...）

| 子命令 | 语法 | 权限 |
|--------|------|------|
| `user info` | `/hfc user info <名称>` | `hfcatlogin.user.info` |
| `user migrate` | `/hfc user migrate <名称> <新名称>` | `hfcatlogin.user.migrate` |
| `user unregister` | `/hfc user unregister <名称>` | `hfcatlogin.user.unregister` |
| `user delete` | `/hfc user delete <名称>` | `hfcatlogin.user.delete` |
| `user premium` | `/hfc user premium <名称>` | `hfcatlogin.user.premium` |
| `user cracked` | `/hfc user cracked <名称>` | `hfcatlogin.user.cracked` |
| `user register` | `/hfc user register <名称> <密码>` | `hfcatlogin.user.register` |
| `user login` | `/hfc user login <名称>` | `hfcatlogin.user.login` |
| `user emailoff` | `/hfc user emailoff <名称>` | `hfcatlogin.user.emailoff` |
| `user setemail` | `/hfc user setemail <名称> <邮箱>` | `hfcatlogin.user.setemail` |
| `user pass-change` | `/hfc user pass-change <名称> <新密码>` | `hfcatlogin.user.pass-change` |
| `user alts` | `/hfc user alts <名称>` | `hfcatlogin.user.alts` |

行为细节：

- `user info` — 查看 UUID、正版 UUID、上次在线、加入时间、邮箱、IP、上次认证时间
- `user migrate` — 将账号数据迁移到新用户名（目标名被占用时报错；被迁移者需离线；若为正版账号会同时解除正版绑定）
- `user unregister` — 清除密码 / IP / 认证记录 / 正版绑定（**不删除账号**，玩家需离线）
- `user delete` — **彻底删除账号**（不可恢复；玩家需离线）
- `user premium` / `user cracked` — 为指定玩家启用 / 关闭正版自动登录（在线玩家会被踢出重连）
- `user register` — 以管理员身份为玩家注册账号（用户名已存在则报错）
- `user login` — 强制让**当前在线且未认证**的玩家登录（用于玩家卡在登录界面等场景）
- `user emailoff` / `user setemail` — 清除 / 直接设置玩家邮箱（setemail 走管理员通道，不需要玩家密码）
- `user pass-change` — 直接重置玩家密码（不需要知道旧密码）
- `user alts` — 查询与指定玩家共享同一 IP 的其他账号（小号排查）

## 命令执行流程示例

### 玩家首次入服

```
/register 123456 123456   # 注册成功即登录
# 下次进入
/login 123456
# 修改密码
/hfc changepass 123456 newpass888
```

### 绑定邮箱（找回密码）

```
/hfc setemail player@example.com 123456     # 收邮件
/hfc verifyemail xxxxxxxxxxxxxxxx            # 填邮件里的 16 位验证码
# 之后忘记密码
/hfc resetpassword                          # 收重置邮件
/hfc confirmpasswordreset xxxxxxxxxxxxxxxx newpass888 newpass888
```

### 开启正版自动登录

```
/hfc premium enable 123456   # 申请（校验 Mojang 账号）
/hfc premium confirm         # 确认，5 分钟内
/hfc premium disable         # 之后想关闭
```
