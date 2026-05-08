# 服内模组支持

本服务器支持以下客户端模组，点击即可跳转到对应说明：

- [简单语音聊天](#简单语音聊天-simple-voice-chat) — 范围语音/全局语音聊天
- [苹果皮](#苹果皮-appleskin) — 显示饱食度/饱和度
- [遥远地平线](#遥远地平线-Distant_Horizons) — 支持显示512视距
- [聊天图片显示](#聊天图片显示-ChatImage) — 群服消息互通可在游戏中查看图片
- [音乐点播姬](#音乐点播姬-allmusic) — 服务器内点播音乐
- [Xaero小地图](#xaero的小地图-xaeros-minimap) — 游戏内小地图
- [连锁采集](#连锁采集-veinminer) — 连锁挖掘快捷键支持

## 简单语音聊天(Simple Voice Chat)

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/svc.jpg"
  maxWidth="80px"
  caption="Simple Voice Chat"
/>

[**锐界幻境下载站**](https://cloud.miragedge.top/guest/mod/SimpleVoiceChat)

[官方下载页面](https://modrepo.de/minecraft/voicechat/downloads "modrepo")(选择你需要的版本)

> ✔ 便捷安装：直接在 PCL2 中搜索「Simple Voice Chat」即可一键安装

首次安装模组后，进入服务器或单人世界时会收到聊天消息，提示你需要完成语音聊天模组的相关设置。
双方安装模组后，即可使用范围语音；创建群组并加入，可全局语音聊天。

### 功能与默认热键

| 功能 | 默认热键 | 备注 |
| ---- | ---- | ---- |
| 语音通话设置 | `V` | 打开语音通话设置菜单 |
| 按键通话 | `Caps Lock` | 按住该按键进行通话（按键通话模式下） |
| 麦克风静音 | `M` | 按住该按键临时停止声音输入（语音触发通话模式下） |
| 禁用语音通话 | `N` | 禁用语音通话，退出语音频道 |
| 隐藏图标 | `H` | 隐藏本模组的所有图标，但不影响功能使用 |

> ⚠ 注意：语音聊天为加密传输，但模组作者不保证绝对安全性，使用该功能请自行承担风险！

## 苹果皮(Appleskin)

[Modrinth下载页](https://modrinth.com/mod/appleskin?version=1.21.11#download "modrepo")(选择你需要的版本)

> ✔ 便捷安装：直接在 PCL2 中搜索「Appleskin」即可一键安装

各种与食物相关的HUD改进，通过服务端侧支持，显示准确的饱食度/饱和度

## 遥远地平线(Distant_Horizons)

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/dh.jpg"
  maxWidth="240px"
  caption="ChatImage"
/>

[Modrinth下载页](https://modrinth.com/mod/distanthorizons#download "modrepo")(选择你需要的版本)


客户端安装该模组后，服内支持最大512区块视距范围

## 聊天图片显示(ChatImage)

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/chatImage.jpg"
  maxWidth="240px"
  caption="ChatImage"
/>

[Modrinth下载页](https://modrinth.com/mod/chatimage#download "ChatImage")(选择你需要的版本)

当客户端安装了此模组，通过群服互通发送的消息包含图片时，可在游戏中显示预览图片

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/chatImage_show.png"
  maxWidth="550px"
  caption="ChatImage_show"
/>

## 音乐点播姬(AllMusic)

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/allmusic.jpg"
  maxWidth="240px"
  caption="AllMusic"
/>

[**锐界幻境下载站**](https://cloud.miragedge.top/guest/mod/AllMusic)

[**蓝奏云备用地址下载**](https://wwbkb.lanzouu.com/b002vmtcve "AllMusic")(密码: 3fsb )

> ✅ 适用版本：1.21.x 版本的 Fabric 和 NeoForge 端可用，安装时请寻找最接近自身游戏版本的模组包
> ✅ 必需前置：[FLK] [Fabric Language Kotlin](https://www.mcmod.cn/class/2126.html "FLK")

### 服内完整使用指令

主核心指令：`/music`

**基础指令**
- `/music help` - 查看全部指令帮助
- `/music [音乐ID]` - 点播指定ID的歌曲
- `/music stop` - 停止当前音乐播放
- `/music list` - 查看当前播放队列
- `/music cancel [序号]` - 取消自己的点歌
- `/music vote` - 参与切歌投票
- `/music vote cancel` - 取消发起的切歌投票
- `/music push [序号]` - 发起插歌投票
- `/music push cancel` - 取消发起的插歌投票
- `/music mute` - 屏蔽/接收点歌通知
- `/music mute list` - 屏蔽/接收空闲歌单通知
- `/music search [歌名]` - 搜索歌曲
- `/music select [序号]` - 选择搜索结果的歌曲
- `/music nextpage` - 搜索结果下一页
- `/music lastpage` - 搜索结果上一页

**界面自定义指令**
- `/music hud [位置] enable` - 启用/关闭指定界面
- `/music hud [位置] pos [x] [y]` - 设置界面位置
- `/music hud pic size [尺寸]` - 设置图片尺寸
- `/music hud pic rotate [开关]` - 设置图片旋转
- `/music hud pic speed [数值]` - 设置图片旋转速度
- `/music hud [位置] dir [对齐方式]` - 设置界面对齐方式
- `/music hud [位置] color [颜色HEX]` - 设置界面颜色
- `/music hud [位置] reset` - 重置指定界面
- `/music hud enable` - 启用/关闭所有界面
- `/music hud reset` - 重置所有界面

## Xaero的小地图(Xaero's Minimap)

[Modrinth下载页](https://modrinth.com/mod/xaeros-world-map?version=1.21.11#download "modrepo")(选择你需要的版本)

> ✔ 便捷安装：直接在 PCL2 中搜索「Xaero's Minimap」即可一键安装

限制公平模式 —— 无雷达，无洞穴模式

## 连锁采集(VeinMiner)

<SmartImage
  src="https://cloud.miragedge.top/d/ServerResourcesPack/web_image/msreg/mod/VeinMiner.jpg"
  maxWidth="240px"
  caption="VeinMiner"
/>

[点击前往modrinth下载](https://modrinth.com/datapack/veinminer?version=1.21.8&loader=fabric#download "modrinth")(选择你需要的版本下载)

> ✔ 便捷安装：直接在 PCL2 中搜索「VeinMiner」即可一键安装

我也不知道为什么连锁挖矿也需要在客户端安装模组，
可能是为了启用快捷键绑定，快速切换连锁状态？
（意思是没必要在客户端安装）

## 外置登录器(Yggdrasil)

> ⚠️  
> 因兼容性较差，服内暂时已删除外置皮肤库支持

1. 为在客户端使用了 LittleSkin 的 Yggdrasil 外置登录的玩家加载皮肤和披风  
2. 也可以配合 万用皮肤补丁 CustomSkinLoader 使用。  
当 CustomSkinLoader 版本高于 14.25 且加载列表中存在 GameProfile 加载项时（该加载项默认处于加载列表首位），该加载项即会加载来自 LittleSkin 的皮肤。

这是官方客户端配置教程：https://manual.littlesk.in/yggdrasil/client
