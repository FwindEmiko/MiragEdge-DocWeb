# 🦊 狐风轩汐の原创/二创插件

部分为闭源插件，会无法访问仓库

## MiragEdgeHome（星辉锚点系统）
### 基础信息：
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：*待上传*
### 功能：
- 星辉锚点系统 — 玩家可设置个人家园锚点，自由命名与自定图标
- 数量数据驱动 — 管理员可单独调整各玩家的锚点上限
- 公共星辉锚点 — 公开家园供其他玩家传送，可设置访问费用（灵叶），费用自动转账给主人
- 星辉信使 — TPA 传送请求系统，含跨服支持、灵叶消耗机制和连续拒绝黑名单保护
- 传送后效果 — 成功传送后施加缓慢+失明效果，防迷惑定位
- 双端体验 — Java 版 MiniMessage 背包 GUI + 基岩版 Floodgate 表单
- Vault 经济集成 — 递增费用机制、TPA 消耗
- PlaceholderAPI 占位符支持（导航栏/计分板显示锚点数量）
- 跨服数据同步 — MySQL + Redis 双模式，Velocity 代理网络全兼容
- 替代旧版米饭 PlayerWarp

## MiragEdgeTitle（称号与入服消息）
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/MiragEdgeTitle
### 功能：
- 称号系统：称号商城 / 称号仓库 / 自定义称号，聊天前缀显示
- 入服消息系统：成就式解锁的个性化进/退服消息广播
- 基岩版 Floodgate 完整支持
- PlaceholderAPI 变量扩展
- 替代旧 FE_HelloBro 入服消息插件

## FE_Pluck（除魔）
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_Pluck
### 功能：
- 卸魔系统 - 将装备附魔剥离为附魔书

## FE_Quests（冒险等级任务）
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_Quests
### 功能：
- 为玩家提供教程引导，功能解锁，冒险经验等级升级的功能

## FE_ItemsCore（物品功能核心）
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_ItemsCore
### 功能：
- 结合各种自定义物品插件，实现物品的特殊效果

## EMCShop（等价交换商店）
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/EMCShop
### 功能：
- 提供物品转换、购买和预览功能
- 允许玩家将基础物品转换为更有价值的物品，或直接购买解锁的物品

## FE_PassPlus
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_PassPlus
### 功能：
- 锐界幻境服务器基于权限检查以执行指令的奖励系统（月卡系统）
- Papi占位符支持，同类分组，权重检查，发送特定消息

## EntityPortalLock
### 基础信息: 
- 原作者：CatTeaA
- 二次开发：F.windEmiko (狐风轩汐)
- 原代码仓库：https://github.com/CatTeaA/EntityPortalLock
### 功能：
- 原功能为禁止配置中的实体类型穿过下界门
- 二次开发后添加了对tps的检查，当tps低于某值时才禁止实体串门

## FE_ABCQ
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_ABCQ
### 功能：
- 锐界幻境服务器的知识问答插件

## FE_RefreshPapi
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_RefreshPapi
### 功能：
- 锐界幻境服务器的自定义占位符变量系统

## FE_NoWeaponFlight
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_NoWeaponFlight
### 功能：
- 禁止在手持重锤、矛的情况下启用飞行
- 飞行中切换重锤、矛会从空中坠落并在落地前取消相关攻击伤害

## FE_FixRepairingEnchant
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_FixRepairingEnchant
### 功能：
- 锐界幻境服务器的“自生”附魔修复补丁
- 监听到物品带有特定附魔注册id时启用该附魔相关能力
- 不同附魔等级，每特定秒数花费特定经验值恢复特定耐久度

## FE_BugEnchantRemover
### 基础信息: 
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_BugEnchantRemover
### 功能：
- 自动检测显示名、Lora词条、注册名中带有特定关键词的附魔并清除该物品
- 可用于处理数据包异常加入的特殊附魔

## FE_PVP（PVP竞技场系统）
### 基础信息:
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_PVP
### 功能：
- 完整的 PVP 竞技场系统，支持单挑（1v1）和团队竞技（2v2/3v3/4v4）
- ELO 段位排位系统，快速匹配队列
- 装备组合（Kit）管理，GUI 编辑器
- PlaceholderAPI 占位符支持
- 详细文档：[/plugins/fepvp](/plugins/fepvp/)

## FE_MWSarden
### 基础信息:
- 作者：F.windEmiko (狐风轩汐)
- 代码仓库：https://github.com/fwindemiko/FE_MWSarden
### 功能：
- 简单但强大的违禁物品检测插件
- 可用于处理数据包意外加入的如结构方块等物品