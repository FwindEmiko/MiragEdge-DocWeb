---
title: 贴图字符码速查表
description: 锐界幻境服务器贴图字符码速查表：通过 CraftEngine 插件实现自定义材质贴图，汇总开发常用的贴图字符编码，提升开发效率。
head:
  - - meta
    - name: keywords
      content: 锐界幻境贴图, CraftEngine, 贴图字符码, 字符编码, 自定义材质, 贴图速查
---

# 贴图字符码速查表
### 说明
服务器通过CraftEngine插件实现自定义材质贴图，本页面汇总开发常用的贴图字符编码，避免频繁翻找原配置文件，提升开发效率。

## Icon小图标类

| 贴图名称（英文标识） | 字符编码 | 预览图 |
|----------------------|----------|--------|
| 灵叶（Spirit_Leaf）| `` | ![灵叶](/images/resourcepack/icon/money.png) |
| 星痕石（Starscar_Gem） | `` | ![星痕石](/images/resourcepack/icon/points.png) |
| 红色感叹号提示（info） | `` | ![红色感叹号提示](/images/resourcepack/icon/info.png) |
| 聊天（chat） | `` | ![聊天](/images/resourcepack/icon/chat.png) |
| 日期（time） | `` | ![日期](/images/resourcepack/icon/time.png) |

## Rank身份标牌

| 贴图名称（英文标识） | 字符编码 | 预览图 |
|----------------------|----------|--------|
| NPC（npc） | `` | ![NPC](/images/resourcepack/rank_tab/npc.png) |
| 商店（shop） | `` | ![商店](/images/resourcepack/rank_tab/shop.png) |
| 玩家（player） | `` | ![玩家](/images/resourcepack/rank_tab/min/player.png) |
| 玩家（player） | `Œ` | ![玩家](/images/resourcepack/rank_tab/player.png) |
| 会员（vip） | `` | ![会员](/images/resourcepack/rank_tab/min/vip.png) |
| 会员（vip） | `Ħ` | ![会员](/images/resourcepack/rank_tab/vip.png) |
| 大会员（vip_plus） | `⫔` | ![大会员](/images/resourcepack/rank_tab/min/vip_plus.png) |
| 大会员（vip_plus） | `` | ![大会员](/images/resourcepack/rank_tab/vip_plus.png) |
| MVP会员（mvp） | `` | ![MVP会员](/images/resourcepack/rank_tab/min/mvp.png) |
| MVP会员（mvp） | `Į` | ![MVP会员](/images/resourcepack/rank_tab/mvp.png) |
| 大MVP会员（mvp_plus） | `⺞` | ![大MVP会员](/images/resourcepack/rank_tab/min/mvp_plus.png) |
| 大MVP会员（mvp_plus） | `` | ![大MVP会员](/images/resourcepack/rank_tab/mvp_plus.png) |

## 物品材质贴图

| 贴图名称（英文标识） | 命名空间 | 预览图 |
|----------------------|----------|--------|
| 胡萝卜镐（carrot_pickaxe） | `items_skin` | ![胡萝卜镐](/images/resourcepack/items_skin/weapons/pickaxe/carrot_pickaxe.png) |

### 使用提示
1. 字符编码可直接复制到功能配置文件中，兼容ItemsAdder插件的字符渲染规则；
2. 预览图路径为服务器资源包实际存储路径，如需调整贴图可参考该路径；
3. 后续新增常用贴图字符码会同步更新至本页面。