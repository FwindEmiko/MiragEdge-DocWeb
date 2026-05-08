# 账号绑定指南

自动白名单系统是锐界幻境服务器的核心安全机制，既能拦截未知危险用户加入，也是群服互通功能的基础——只有完成 QQ 与游戏账户绑定，才能正常进入服务器。

> 💡 我们会收集您的 QQ 号、关联游戏 ID、连接 IP 属地，这些信息仅用于服务器功能使用，绝对禁止第三方查看。
>
> 为避免不必要的损失和冲突，我们会通过日志的形式记录您的聊天消息、服内部分插件的操作记录，便于在需要时追查，此类消息在非必要时不会允许第三方查看。

## 绑定步骤

### 第一步：加入官方群

审核通过后，加入官方 QQ 交流群：

[点击加入交流群](https://qm.qq.com/cgi-bin/qm/qr?k=r_yUquo3bQwX3bL97RwG1aVj41WIEOI3&jump_from=webapi&authKey=A76pYGWh45XBe5V4kV5m3LWyR3XRpIl30FETYB0/scIEMeRGhIEDlQWmD5HVjSbj)

### 第二步：进入服务器触发绑定

成功进入服务器并完成游戏登录账号注册后，会被踢出然后弹出绑定提示框，显示您的专属验证码（4位数字）。

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/tutorial/GameQQ.png"
  alt="服内绑定提示"
  caption="服内绑定提示"
  maxWidth="400px"
/>

> 服务器注册时您输入的密码使用 BCrypt-2A 安全密码哈希加密，任何人都无法查看！当然也无法找回密码，当忘记密码时只能重置，建议绑定密码重置邮箱。

### 第三步：群内发送指令完成绑定

在官方 QQ 交流群中发送绑定指令：

`绑定 3528`（3528 替换为你的验证码）

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/tutorial/QQLink.png"
  alt="交流群发送绑定验证码"
  caption="交流群发送绑定验证码"
  maxWidth="400px"
/>

## 查询绑定

在官方 QQ 交流群内发送 `我的绑定`，可快速查看当前 QQ 账号绑定的所有游戏 ID

## 解绑说明

单个 QQ 账号最多可绑定 3 个游戏 ID，若需绑定新账号，需先解绑旧的游戏 ID。

具体指令可参考群内公示的「查、解绑指令示例」，或 @群机器人获取指引。

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/tutorial/QQUnLink.png"
  alt="查、解绑相关指令"
  caption="查、解绑相关指令"
  maxWidth="400px"
/>

## 更多功能

如需了解群服互通、机器人其他功能（如查服务器状态、领福利等），可查看详细教程：

[QQ机器人 & 群服互通功能教程](../function/qqbot)
