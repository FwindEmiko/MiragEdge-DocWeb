<!-- 来源页面: https://miragedge.top/plugin-guides/hfcatlogin/commands -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/hfcatlogin/commands.md -->

# 命令参考

HFcatLogin 把全部功能收归主命令加子命令结构：主命令 `/hfcatlogin`（别名 `/hfc`），仅保留 `/login`、`/register` 两个独立快捷命令。所有命令支持 Tab 补全。

管理类子命令标注了对应权限节点，未授权时提示「您没有权限使用此命令！」。未认证状态下只能执行白名单命令，规则见[权限节点](https://miragedge.top/plugin-guides/hfcatlogin/permissions)。

玩家侧命令（登录、注册、改密、premium 与邮箱系列）见 [注册与登录（玩家版）](https://miragedge.top/start/login)。

## 主命令 /hfc（管理员功能）

管理子命令面向 `Audience`，控制台与玩家均可执行。

| 子命令 | 语法 | 权限 |
| :--- | :--- | :--- |
| `email test` | `/hfc email test <邮箱>` | `hfcatlogin.email.test` |
| `dump` | `/hfc dump` | `hfcatlogin.dump` |
| `reload configuration` | `/hfc reload configuration` | `hfcatlogin.reload.configuration` |
| `reload messages` | `/hfc reload messages` | `hfcatlogin.reload.messages` |

## 用户管理

| 子命令 | 语法 | 权限 |
| :--- | :--- | :--- |
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

- `user info`：查看 UUID、正版 UUID、上次在线、加入时间、邮箱、IP 与上次认证时间。
- `user migrate`：把账号数据迁移到新用户名。目标名被占用时报错，被迁移者需离线；正版账号会同时解除正版绑定。
- `user unregister`：清除密码、IP、认证记录与正版绑定，不删除账号，要求玩家离线。
- `user delete`：彻底删除账号，不可恢复，要求玩家离线。
- `user premium` 与 `user cracked`：为指定玩家启用或关闭正版自动登录，在线玩家会被踢出重连。
- `user register`：以管理员身份为玩家注册账号，用户名已存在时报错。
- `user login`：强制让当前在线且未认证的玩家登录，用于玩家卡在登录界面的场景。
- `user emailoff` 与 `user setemail`：清除或直接设置玩家邮箱，`setemail` 走管理员通道，不需要玩家密码。
- `user pass-change`：直接重置玩家密码，不需要知道旧密码。
- `user alts`：查询与指定玩家共享同一 IP 的其他账号，用于小号排查。

## 执行示例

```text
/hfc user info Steve                 # 查看账号资料
/hfc user premium Steve              # 打开该账号的正版自动登录
/hfc user pass-change Steve newpass888   # 重置密码
/hfc reload configuration            # 重载主配置
```
