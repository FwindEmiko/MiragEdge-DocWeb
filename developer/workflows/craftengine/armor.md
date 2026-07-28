---
title: "CE 自定义盔甲模型与装备纹理工作流"
description: "CraftEngine 自定义盔甲的装备资源、1.21.2 component、1.20 trim、实体纹理 UV、3D 物品模型边界和错位排查教程。"
icon: 🛡️
outline: deep
head:
  - - meta
    - name: keywords
      content: "CraftEngine, CE, 自定义盔甲, armor, equipment, humanoid, humanoid_leggings, component, trim, asset_id, UV"
---

# CE 自定义盔甲模型与装备纹理工作流

> 本页专门解决“物品栏显示正常，但穿到玩家身上错位、乱码、贴图跑到错误部位”的问题。示例以服务器现有的 **巨像胸甲** 和 **灵影护腿** 为基准。

## 先给结论

物品栏正常不代表穿戴资源正确。一个自定义盔甲至少有两条资源链：

```text
物品栏 / 手持
  CE items.texture
  → assets/minecraft/textures/item/armor/*.png

玩家穿戴
  CE settings.equipment.asset-id
  → CE equipments
  → Minecraft equipment renderer
  → assets/minecraft/textures/entity/equipment/
       ├── humanoid/*.png             胸甲、头盔、靴子等主体层
       └── humanoid_leggings/*.png    护腿层
```

因此，下面两个文件即使完全正常，也不能证明穿戴效果正常：

```text
textures/item/armor/giant_chestplate.png  # 16×16，物品栏
textures/item/armor/shrink_leggings.png  # 16×16，物品栏
```

穿戴效果实际依赖：

```text
textures/entity/equipment/humanoid/giant_chestplate.png          # 64×64
textures/entity/equipment/humanoid_leggings/shrink_leggings.png  # 64×64
```

## 官方规则与版本分支

CE 官方文档目前把自定义装备分为两种方案：

| 方案 | Minecraft 版本 | CE 注册类型 | 特点 |
| --- | --- | --- | --- |
| 装备组件 | 1.21.2+ | `type: component` | 推荐；由 `equippable.asset_id` 指向装备资源 |
| 盔甲纹饰 | 1.20+ | `type: trim` | 兼容旧版本；依赖纹饰渲染机制，能力有限 |

官方参考：[CE 装备配置](https://ce-pre.gtemc.cn/zh-Hans/configuration/equipment)。

### 配置键名必须跟服务器版本一致

官方预发布文档示例使用下划线：`asset_id`、`client_bound_material`、`humanoid_leggings`；MiragEdge 当前资源快照中使用连字符：`asset-id`、`humanoid-leggings`。这说明配置语法随 CE 构建/版本存在差异。

本页的 MiragEdge 示例优先保持当前文件的实际写法；不要把官方预发布页面的下划线示例直接覆盖到线上配置。判断标准是：

1. 先看服务器现有同类配置；
2. 执行 `/ce reload`；
3. 以 `logs/latest.log` 的字段解析结果为准；
4. 用 `/ce version` 记录插件版本后再决定是否迁移键名。

## 一、正确的配置组成

### 1. 物品注册：决定物品栏外观

当前服务器的 `miragedge_items/configuration/armor-custom.yml`：

```yaml
items:
  miragedge_items:giant_chestplate:
    material: iron_chestplate
    data:
      item-name: "<!i><gradient:#8B7355:#A0522D:#CD853F>巨像胸甲</gradient>"
    settings:
      equipment:
        asset-id: miragedge_items:giant_chestplate_asset
        $$>=1.21.2:
          slot: chest
    texture: minecraft:item/armor/giant_chestplate

  miragedge_items:shrink_leggings:
    material: iron_leggings
    data:
      item-name: "<!i><gradient:#7B68EE:#9370DB:#B0C4DE>灵影护腿</gradient>"
    settings:
      equipment:
        asset-id: miragedge_items:shrink_leggings_asset
        $$>=1.21.2:
          slot: legs
    texture: minecraft:item/armor/shrink_leggings
```

这里的 `texture` 只负责物品栏/手持显示；`asset-id` 才是穿戴时选择哪一个 equipment 资源的入口。

### 2. 装备资源注册：决定玩家身上用哪张图

```yaml
equipments:
  $$>=1.21.2:
    miragedge_items:giant_chestplate_asset:
      type: component
      humanoid: "minecraft:entity/equipment/humanoid/giant_chestplate"

    miragedge_items:shrink_leggings_asset:
      type: component
      humanoid-leggings: "minecraft:entity/equipment/humanoid_leggings/shrink_leggings"

  $$<1.21.2:
    miragedge_items:giant_chestplate_asset:
      type: trim
      humanoid: "minecraft:entity/equipment/humanoid/giant_chestplate"

    miragedge_items:shrink_leggings_asset:
      type: trim
      humanoid-leggings: "minecraft:entity/equipment/humanoid_leggings/shrink_leggings"
```

对应文件必须位于：

```text
resourcepack/assets/minecraft/textures/entity/equipment/humanoid/giant_chestplate.png
resourcepack/assets/minecraft/textures/entity/equipment/humanoid_leggings/shrink_leggings.png
```

注意：`minecraft:entity/equipment/...` 是资源 ID，不是 `models/` 下的 JSON 文件路径。这里引用的是 Minecraft 预设装备模型类型下的纹理资源。

## 二、装备纹理的编写方法

### 胸甲/头盔/靴子：`humanoid`

`humanoid` 是主体装备模型类型，通常承载头盔、胸甲、靴子等身体部位。文件名可以自定义，但路径必须与 `equipments.humanoid` 的资源 ID 最后一段一致。

```text
装备资源 ID：minecraft:entity/equipment/humanoid/giant_chestplate
纹理文件：  assets/minecraft/textures/entity/equipment/humanoid/giant_chestplate.png
```

### 护腿：`humanoid-leggings`

护腿不能指向 `humanoid`。它使用单独的 leggings 预设和单独的 UV 布局：

```text
装备资源 ID：minecraft:entity/equipment/humanoid_leggings/shrink_leggings
纹理文件：  assets/minecraft/textures/entity/equipment/humanoid_leggings/shrink_leggings.png
```

如果把护腿纹理放在 `humanoid/` 或把 `humanoid` 贴图给 `humanoid-leggings`，常见结果就是腿部出现错位、拉伸、镜像或大块乱码。

### 画布尺寸不是随意的

当前服务器实际文件核对结果：

| 文件 | 尺寸 | 用途 |
| --- | ---: | --- |
| `item/armor/giant_chestplate.png` | 16×16 | 物品栏 |
| `item/armor/shrink_leggings.png` | 16×16 | 物品栏 |
| `entity/equipment/humanoid/giant_chestplate.png` | 64×64 | 穿戴胸甲 |
| `entity/equipment/humanoid_leggings/shrink_leggings.png` | 64×64 | 穿戴护腿 |

建议直接从对应版本的原版装备纹理模板开始绘制，而不是把 16×16 物品图放大，也不要把旧版 `textures/models/armor/*_layer_1.png` / `*_layer_2.png` 原样塞进新目录。放大只能改变分辨率，不能改变 UV 布局。

## 三、为什么会“贴图错位乱码”

### 症状 1：物品栏正常，穿戴后完全错位

优先检查实体装备 PNG 是否使用了错误模板：

- 64×64 文件实际上是旧版 64×32 armor layer；
- 胸甲图被放入 `humanoid_leggings`；
- 护腿图被放入 `humanoid`；
- 画布透明区域、部件排列和原版 equipment 模板不一致；
- 图片导出时裁剪掉了透明边界，导致 UV 坐标整体偏移。

### 症状 2：胸甲正常，护腿错位

这几乎总是 `humanoid` / `humanoid-leggings` 混用，或护腿采用了胸甲的 UV 模板。检查配置和目录：

```text
giant_chestplate → humanoid → textures/entity/equipment/humanoid/
shrink_leggings  → humanoid-leggings → textures/entity/equipment/humanoid_leggings/
```

### 症状 3：穿上后显示紫黑、乱码或像随机切片

先区分是“资源没找到”还是“UV 错”：

1. PNG 不存在、路径大小写错误、资源包没更新：通常是缺失纹理或紫黑。
2. PNG 能访问但部位切片错误：通常是 UV 模板不匹配。
3. 盔甲完全透明：可能是 `asset-id` 未生效、`equipments` 类型/键名不匹配，或 trim 方案没有正确应用纹饰。

### 症状 4：物品有自定义 3D 模型，但穿戴后仍是普通盔甲

这是预期行为。Minecraft 的 `asset_id` 会让穿戴时进入硬编码装备渲染器；`items.texture` 或物品模型 JSON 不能直接改变玩家身上的装备几何体。

如果目标是“拿在手里是 3D 模型”，物品模型按普通 CE item model 编写；如果目标是“穿上后改变玩家身体几何形状”，仅靠 equipment 纹理做不到，需要改用模型实体、显示实体、专用客户端模组或其他自定义渲染方案。

官方对 3D 头盔特别说明：1.21.2+ 可以重写 `equippable` 并移除 `asset_id`，让它回到普通物品渲染器；旧版本可使用 `client_bound_material`。这条方案主要针对 3D 头盔/物品模型，不是普通盔甲纹理错位的修复手段。

## 四、从零制作一套盔甲纹理

### 步骤 1：先确定渲染目标

```text
只改颜色/图案             → equipment 纹理 PNG
物品栏外观                 → items.texture / item model
穿戴时多个纹理叠加          → equipment 的纹理列表（按当前版本语法）
穿戴时改变身体几何形状      → equipment 方案不够，需要另一套渲染方案
```

### 步骤 2：复制正确的原版模板

为胸甲使用 `humanoid` 模板，为护腿使用 `humanoid_leggings` 模板。保留原始画布尺寸和透明通道，只替换对应部件的像素。

不要：

- 把物品栏 16×16 图直接放大到 64×64；
- 把 `layer_1` 和 `layer_2` 旧版图直接改名；
- 只画胸甲却拿去注册 `humanoid_leggings`；
- 用文件名表达部位但不检查 `equipments` 的资源 ID。

### 步骤 3：导出并检查 PNG

- PNG、RGBA、保留透明通道；
- 画布保持模板尺寸；
- 不要自动裁剪透明边界；
- 文件名只用小写字母、数字、下划线；
- 用图片查看器确认非透明像素落在预期 UV 区域；
- 用 `file`、ImageMagick 或图片编辑器确认真实格式，不要把 HTML 错误页误存为 PNG。

### 步骤 4：配置一对一映射

推荐让四个名字保持同一词根：

```text
物品 ID：       miragedge_items:giant_chestplate
装备资产 ID：   miragedge_items:giant_chestplate_asset
装备资源 ID：   minecraft:entity/equipment/humanoid/giant_chestplate
实体纹理文件：  humanoid/giant_chestplate.png
```

这样日志和人工排查时不会把 item texture 与 equipment texture 混为一谈。

## 五、针对巨像胸甲/灵影护腿的模拟验证

### 静态核对结果

已对当前 `F:\CraftEngine\resources` 快照进行核对：

- 两个物品 ID 存在于 `miragedge_items/configuration/armor-custom.yml`；
- 两个物品的 item texture 都存在，尺寸均为 16×16；
- `giant_chestplate` equipment texture 存在于 `humanoid/`，尺寸为 64×64；
- `shrink_leggings` equipment texture 存在于 `humanoid_leggings/`，尺寸为 64×64；
- 当前配置确实为 1.21.2+ `component` 和旧版本 `trim` 双分支；
- 本地配置使用连字符键名，和当前服务器快照一致，但与官方预发布文档的下划线示例不同，需以线上 CE 版本日志确认。

### 结论

当前“物品材质正常、穿戴后错位”的问题，静态上已经排除了“物品栏 PNG 缺失”和“装备 PNG 不存在”。最可疑的剩余点是：

1. `humanoid` / `humanoid-leggings` 的 UV 模板与实际 PNG 不匹配；
2. 线上 CE 构建要求的装备键名与资源快照写法不同；
3. 资源包更新后客户端仍使用旧缓存；
4. 期待用普通 item model 改变玩家身上几何体，超出了 equipment 纹理能力。

### 游戏内验证顺序

```text
1. /ce version
2. /ce reload
3. 查看 logs/latest.log 中 armor-custom.yml 的首个警告/错误
4. /ce item get miragedge_items:giant_chestplate 1
5. /ce item get miragedge_items:shrink_leggings 1
6. 脱下旧装备，重新穿戴新物品
7. 客户端重新加入服务器，排除资源包缓存
8. 先单独测试巨像胸甲，再单独测试灵影护腿
```

不要同时测试两件新装备、体型插件和资源包改动；否则无法判断是 CE 纹理、FwindEmikoCore 体型逻辑还是客户端缓存造成的现象。

## 六、最终排查表

| 检查项 | 正确状态 |
| --- | --- |
| 物品 `texture` | 指向 `textures/item/...`，只负责物品栏/手持 |
| `settings.equipment.asset-id` | 与 `equipments` 下的资产 ID 完全一致 |
| 1.21.2+ 类型 | `component`，且配置了正确 slot/模型类型 |
| 旧版本类型 | `trim`，且确认服务器真的走旧版本分支 |
| 胸甲纹理 | `textures/entity/equipment/humanoid/*.png` |
| 护腿纹理 | `textures/entity/equipment/humanoid_leggings/*.png` |
| 画布 | 使用当前 MC 版本对应的原版模板，当前快照为 64×64 |
| PNG | RGBA、无裁剪、透明通道存在 |
| 客户端 | 重进服务器后重新下载资源包 |
| 几何模型预期 | 明确区分纹理换色和真正 3D 几何改造 |

## 相关资料

- [CE 开发工作流](/develop/workflows/ce-workflow)
- [CE 配置参考与实际目录](/develop/workflows/ce-reference)
- [CraftEngine 官方：装备](https://ce-pre.gtemc.cn/zh-Hans/configuration/equipment)
- [CraftEngine 官方：物品模型](https://ce-pre.gtemc.cn/zh-Hans/configuration/item/models/model)
- [CraftEngine 官方：项目结构](https://ce-pre.gtemc.cn/zh-Hans/getting_start/project_structure)
- [CraftEngine 源码](https://github.com/Xiao-MoMi/craft-engine)
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)
