---
title: 服内模组支持
description: 锐界幻境支持的客户端模组清单：简单语音聊天、苹果皮、星辰状态条、聊天图片、Xaero 地图、共享投影、翻滚飞行等模组的说明与安装方式。
head:
  - - meta
    - name: keywords
      content: 锐界幻境模组, Minecraft 客户端模组, 简单语音聊天, Simple Voice Chat, 光影, AppleSkin, AsteorBar, ChatImage, Xaero, Xaero's Minimap, Xaero's WorldMap, Syncmatica, Do a Barrel Roll, Litematica, 投影
outline: [2, 3]
---

# 服内模组支持

这页列出服务器支持的客户端模组。点下面的目录，可直接跳到对应说明。

- [简单语音聊天](#简单语音聊天-simple-voice-chat) — 范围语音与全局语音
- [苹果皮](#苹果皮-appleskin) — 显示饱食度与饱和度
- [星辰状态条](#星辰状态条-asteorbar) — 简洁状态条与实体血条
- [遥远地平线](#遥远地平线-distant-horizons) — 显示更远的视距
- [聊天图片显示](#聊天图片显示-chatimage) — 聊天中显示图片
- [音乐点播姬](#音乐点播姬-allmusic) — 服务器内点播音乐
- [Xaero 小地图](#xaero的小地图-xaero-s-minimap) — 小地图与世界地图
- [共享投影](#共享投影-syncmatica) — 服务器共享投影文件
- [Do a Barrel Roll](#do-a-barrel-roll-翻滚飞行) — 鞘翅翻滚飞行
- [连锁采集](#连锁采集-veinminer) — 连锁挖掘快捷键

## 简单语音聊天(Simple Voice Chat)

<SmartImage
  src="/images/web_image/msreg/mod/svc.jpg"
  maxWidth="80px"
  caption="简单语音聊天模组图标"
/>

下载：[锐界幻境下载站](https://share.fnnas.net/s/a32874a8ab394948b4)｜[官方下载页面](https://modrepo.de/minecraft/voicechat/downloads)

在启动器中搜索「Simple Voice Chat」即可一键安装。

首次安装模组后，进入服务器或单人世界时会收到聊天消息，提示你完成语音聊天设置。
双方都安装模组后即可使用范围语音；创建群组并加入，可全局语音聊天。

### 功能与默认热键

| 功能 | 默认热键 | 备注 |
| ---- | ---- | ---- |
| 语音通话设置 | `V` | 打开语音通话设置菜单 |
| 按键通话 | `Caps Lock` | 按住该按键进行通话（按键通话模式下） |
| 麦克风静音 | `M` | 按住该按键临时停止声音输入（语音触发通话模式下） |
| 禁用语音通话 | `N` | 禁用语音通话，退出语音频道 |
| 隐藏图标 | `H` | 隐藏本模组的所有图标，不影响功能使用 |

::: warning 注意
语音聊天为加密传输，但模组作者不保证绝对安全性。使用该功能请自行承担风险。
:::

## 苹果皮(Appleskin)

[Modrinth 下载页](https://modrinth.com/mod/appleskin?version=1.21.11#download)(选择你需要的版本)

在启动器中搜索「Appleskin」即可一键安装。

提供与食物相关的界面改进，显示准确的饱食度与饱和度。

::: tip 已支持
服务器已支持该模组的数据同步。安装后即可获得准确的饱食度与饱和度显示。
:::

## 星辰状态条(AsteorBar)

[Modrinth 下载页](https://modrinth.com/mod/asteorbar#download)(选择你需要的版本)

在启动器中搜索「AsteorBar」即可一键安装。

简洁的状态条界面，用细长条显示生命值、饥饿值、盔甲耐久、氧气、经验等状态。生物头顶可显示血条与生命值。

::: tip 已支持
服务器已支持该模组的数据同步。默认不同步的饱食度与饱和度也能正确显示。
:::

## 遥远地平线(Distant_Horizons)

<SmartImage
  src="/images/web_image/msreg/mod/dh.jpg"
  maxWidth="240px"
  caption="遥远地平线模组图标"
/>

[Modrinth 下载页](https://modrinth.com/mod/distanthorizons#download)(选择你需要的版本)

客户端安装该模组后，服内显示最大 512 区块的视距范围。

## 聊天图片显示(ChatImage)

<SmartImage
  src="/images/web_image/msreg/mod/chatImage.jpg"
  maxWidth="240px"
  caption="聊天图片显示模组图标"
/>

[Modrinth 下载页](https://modrinth.com/mod/chatimage#download)(选择你需要的版本)

客户端安装该模组后，群服互通消息里的图片可在游戏中显示预览。

::: tip 已支持
服务器已支持该模组的图片协议。在聊天框发送 `[CICode,url=图片地址]` 格式的内容，其他玩家即可在聊天中看到图片。
:::

<SmartImage
  src="/images/web_image/msreg/mod/chatImage_show.png"
  maxWidth="550px"
  caption="聊天中显示图片的效果"
/>

## 音乐点播姬(AllMusic)

<SmartImage
  src="/images/web_image/msreg/mod/allmusic.jpg"
  maxWidth="240px"
  caption="音乐点播姬模组图标"
/>

下载：[锐界幻境下载站](https://share.fnnas.net/s/a32874a8ab394948b4)｜[蓝奏云备用地址](https://wwbkb.lanzouu.com/b002vmtcve)(密码：3fsb)

适用 1.21.x 版本，安装时选择最接近自身游戏版本的模组包。

必需前置：[Fabric Language Kotlin](https://www.mcmod.cn/class/2126.html)

### 常用指令

| 你要做什么 | 指令 |
| --- | --- |
| 查看全部指令 | `/music help` |
| 点播指定歌曲 | `/music [音乐ID]` |
| 停止当前播放 | `/music stop` |
| 查看播放队列 | `/music list` |
| 取消自己的点歌 | `/music cancel [序号]` |
| 参与切歌投票 | `/music vote` |
| 屏蔽或接收点歌通知 | `/music mute` |
| 调整界面位置与显示 | `/music hud` |

其他指令在游戏内执行 `/music help` 查看。

## Xaero的小地图(Xaero's Minimap)

[Modrinth 下载页](https://modrinth.com/mod/xaeros-world-map?version=1.21.11#download)(选择你需要的版本)

在启动器中搜索「Xaero's Minimap」即可一键安装；世界地图搜索「Xaero's World Map」。

限制公平模式：无雷达，无洞穴模式。

::: tip 已支持
服务器已支持 Xaero 系列地图协议，兼容 Xaero's Minimap 与 Xaero's WorldMap。坐标点与死亡点会和服务器挂钩存储。服务器名称或地址变化后，已保存的坐标点与死亡点不会被删除或刷新。
:::

## 共享投影(Syncmatica)

[Modrinth 下载页](https://modrinth.com/mod/syncmatica#download)(选择你需要的版本)

前置模组：[投影(Litematica)](https://modrinth.com/mod/litematica) 与 [MaLiLib](https://modrinth.com/mod/malilib)。

安装该模组的玩家，可把自己的投影上传到服务器；其他安装 Syncmatica 的玩家随时下载查看并使用这些共享投影。

::: tip 已支持
服务器已支持共享投影：玩家可上传或下载服务器共享的投影文件。
:::

## Do a Barrel Roll(翻滚飞行)

[Modrinth 下载页](https://modrinth.com/mod/do-a-barrel-roll#download)(选择你需要的版本)

让鞘翅飞行更灵活的客户端模组，完全解锁镜头方向。飞行时用鼠标滚转或俯仰，按键偏航；默认鼠标 X 轴滚转、Y 轴俯仰、A/D 偏航。

::: tip 已支持
服务器已支持兼容同步。飞行中的视觉效果会同步给其他安装该模组的玩家，尤其是玩家模型滚转。
:::

## 连锁采集(VeinMiner)

<SmartImage
  src="/images/web_image/msreg/mod/VeinMiner.jpg"
  maxWidth="240px"
  caption="连锁采集模组图标"
/>

[Modrinth 下载页](https://modrinth.com/datapack/veinminer?version=1.21.8&loader=fabric#download)(选择你需要的版本)

在启动器中搜索「VeinMiner」即可一键安装。

安装该模组后，可使用连锁采集的快捷键，快速切换连锁状态。
