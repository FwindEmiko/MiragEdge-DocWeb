---
title: "Geyser 基岩版内容转化工作流"
description: "Java 版自定义内容到基岩版的完整转化工作流——映射、资源包、扩展开发、硬限制与验收"
outline: deep
---

# Geyser 基岩版内容转化工作流

> 最后更新：2026-08-07 · 基于 Geyser 2.11.x on Velocity 4.1.0 · CraftEngine on backend subserver

## 1. 概述

Geyser 是一个桥接代理，允许基岩版（Bedrock Edition）玩家连接到 Java 版服务器。但 Geyser **不会自动转化 Java 资源包**——Java ZIP 不能直接放进 `packs/` 目录。所有自定义内容必须手动创建映射文件和基岩版资源包。

### 三类输入

1. **CraftEngine 物品/方块** — CE 自建的物品和服务器端方块
2. **数据包伴随资源包** — Stellarity、Incendium、True-Ending 等数据包携带的物品/方块/模型
3. **外部合并包** — CustomNameplates、BetterModel、Sparkles 等独立 ZIP

### 当前服务器环境

| 组件 | 版本 | 位置 |
|------|------|------|
| Geyser | 2.11.x (b1209) | Velocity 代理端 `/mnt/miragedge/vc/plugins/Geyser-Velocity/` |
| CraftEngine | 后端子服 | `/mnt/miragedge/MainServer/plugins/CraftEngine/` |
| Velocity | 4.1.0-SNAPSHOT | 代理端 |
| 服务端核心 | Leaf 26.2 (Paper fork) | 后端 |

::: warning 架构关键
Geyser 在代理端，CraftEngine 在后端子服。CE 方块是运行时动态注册的，Geyser 启动时看不到——这决定了非原版方块必须用 Extension API（见第 6 节）。
:::

## 2. 基岩版资源包结构

### 目录结构

```text
my-pack.mcpack (或 .zip)
├── manifest.json
├── textures/
│   ├── item_texture.json       # 物品纹理图集
│   ├── terrain_texture.json    # 方块纹理图集
│   ├── items/                  # 物品 PNG
│   │   └── my_item.png
│   ├── blocks/                 # 方块 PNG
│   │   └── my_block.png
│   └── models/
│       └── armor/             # 盔甲纹理
│           ├── my_armor_1.png  # 胸甲
│           └── my_armor_2.png  # 护腿
├── models/
│   └── blocks/
│       └── my_block.geo.json  # 方块几何体
└── attachables/
    └── my_armor.json           # 可穿戴物品定义
```

### manifest.json

```json
{
  "format_version": 2,
  "header": {
    "description": "My Resource Pack",
    "name": "My Pack",
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "version": [1, 0, 0],
    "min_engine_version": [1, 16, 0]
  },
  "modules": [
    {
      "description": "My Resource Pack",
      "type": "resources",
      "uuid": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
      "version": [1, 0, 0]
    }
  ]
}
```

- 两个 UUID 必须不同且唯一
- `type` 必须是 `"resources"`
- `min_engine_version` 建议设为 `[1, 16, 0]`（跨版本兼容）

### item_texture.json

```json
{
  "resource_pack_name": "my_pack",
  "texture_name": "atlas.items",
  "texture_data": {
    "my_ns:my_item": {
      "textures": "textures/items/my_item"
    }
  }
}
```

- 键名是纹理标识符，用于映射文件的 `bedrock_options.icon`
- 如果不设 `icon`，默认使用 bedrock_identifier（`:` 替换为 `.`，`/` 替换为 `_`）
- 路径不带 `.png` 后缀

### terrain_texture.json

```json
{
  "resource_pack_name": "my_pack",
  "texture_name": "atlas.terrain",
  "padding": 8,
  "num_mip_levels": 4,
  "texture_data": {
    "blocks_crop_cucumber_1": {
      "textures": "blocks/crop/cucumber/cucumber_1"
    }
  }
}
```

- 键名格式：`blocks_` + 路径用 `_` 连接
- 对应方块映射中的 `material_instances.*.texture`

### 纹理键前缀规则

::: danger 重要
- `block_` 前缀的纹理键 → 基岩版按 **3D 方块展开图** 渲染（显示为方块拆解图）
- `item_` 前缀的纹理键 → 基岩版按 **平面物品图标** 渲染

同一个 PNG 文件，只需在 `item_texture.json` 和 `terrain_texture.json` 中分别用不同前缀注册即可。
:::

### 80 字符路径限制

基岩版资源包内的文件路径（从包根开始）**不能超过 80 字符**。超长路径会导致 Geyser 启动警告，基岩客户端可能无法加载。

**修复方法**：缩短目录名（如 `crimson_bracket_fungus` → `cbf`）

### 几何体文件格式（.geo.json）

```json
{
  "format_version": "1.12.0",
  "minecraft:geometry": [
    {
      "description": {
        "identifier": "geometry.my_namespace.my_model",
        "texture_width": 16,
        "texture_height": 16,
        "visible_bounds_width": 3,
        "visible_bounds_height": 3,
        "visible_bounds_offset": [0, 0.5, 0]
      },
      "bones": [
        {
          "name": "root",
          "pivot": [0, 0, 0],
          "cubes": [
            {
              "origin": [-8, 0, -8],
              "size": [16, 16, 16],
              "uv": [0, 0],
              "uv_size": [16, 16]
            }
          ]
        }
      ]
    }
  ]
}
```

- `identifier` 必须以 `geometry.` 开头
- `origin` 是中心原点制（-8~8），不是 Java 的左下原点（0~16）
- `uv_size` 指定 UV 贴图尺寸

### attachables（可穿戴物品）

```json
{
  "minecraft:attachable": {
    "description": {
      "identifier": "my_ns:my_chestplate",
      "item": {
        "my_ns:my_chestplate": "my_chestplate"
      }
    },
    "scripts": {
      "parent_setup": "variable.chest_layer_visible = 0.0;"
    },
    "geometry": {
      "default": "geometry.player_armor"
    },
    "textures": {
      "default": "textures/models/armor/my_armor_1"
    },
    "render_controllers": ["controller.render_armor"]
  }
}
```

## 3. 自定义物品映射（V2 格式）

### 文件结构

映射文件放在 `custom_mappings/` 目录下，格式如下：

```json
{
  "format_version": 2,
  "items": {
    "minecraft:JAVA_ITEM": [
      { "定义1" },
      { "定义2" }
    ]
  }
}
```

### 三种定义类型

#### definition（1.21.4+ item_model）

```json
{
  "type": "definition",
  "model": "stellarity:dragonblade",
  "bedrock_identifier": "stellarity:dragonblade",
  "bedrock_options": {
    "icon": "stellarity.item_dragonblade",
    "display_handheld": true
  }
}
```

#### legacy（旧版 custom_model_data）

```json
{
  "type": "legacy",
  "custom_model_data": 1450104,
  "bedrock_identifier": "incendium:trailblazer",
  "bedrock_options": {
    "icon": "incendium.trailblazer",
    "display_handheld": true
  }
}
```

#### group（多定义分组）

```json
{
  "type": "group",
  "model": "example:my_item",
  "definitions": [
    {
      "bedrock_identifier": "example:my_item_nether",
      "predicate": {
        "type": "match",
        "property": "context_dimension",
        "value": "minecraft:the_nether"
      }
    },
    {
      "bedrock_identifier": "example:my_item"
    }
  ]
}
```

### 必填字段

| 字段 | 说明 |
|------|------|
| `bedrock_identifier` | 基岩版物品标识符，**必填**，不能使用 `minecraft:` 命名空间，不能与其他定义重复 |
| `model` | definition 类型必填，Java item_model 标识符 |
| `custom_model_data` | legacy 类型必填，旧版 CMD 数值 |

### bedrock_options 全字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | string | bedrock_identifier | 物品图标，对应 item_texture.json 键名 |
| `display_handheld` | bool | false | 是否以工具/武器姿势手持 |
| `allow_offhand` | bool | true | 是否允许放副手 |
| `protection_value` | int | 0 | 护甲值显示（仅 equippable 时有效） |
| `creative_category` | string | none | 创造模式分类 |
| `creative_group` | string | - | 创造模式组 |
| `tags` | array | - | 物品标签 |

### components 全列表

| 组件 | 说明 |
|------|------|
| `minecraft:consumable` | 食用/饮用行为 |
| `minecraft:equippable` | 可装备（需指定 slot） |
| `minecraft:food` | 食物属性 |
| `minecraft:max_damage` | 最大耐久 |
| `minecraft:max_stack_size` | 最大堆叠 |
| `minecraft:use_cooldown` | 使用冷却 |
| `minecraft:enchantable` | 可附魔 |
| `minecraft:tool` | 工具属性 |
| `minecraft:repairable` | 可修复 |
| `minecraft:enchantment_glint_override` | 附魔光效覆盖 |
| `minecraft:attack_range` | 攻击范围 |
| `minecraft:kinetic_weapon` | 动能武器（弓） |
| `minecraft:piercing_weapon` | 穿透武器（弩） |
| `minecraft:swing_animation` | 挥动动画 |
| `minecraft:use_effects` | 使用效果 |

#### 移除组件

在组件名前加 `!` 前缀：

```json
"components": {
  "!minecraft:food": {}
}
```

### predicates 系统

#### condition 谓词

| 属性 | 说明 |
|------|------|
| `broken` | 物品是否损坏（仅剩 1 点耐久） |
| `damaged` | 物品是否受损 |
| `custom_model_data` | 检查 CMD flags 指定 index |
| `has_component` | 是否拥有指定组件 |
| `fishing_rod_cast` | 钓竿是否抛出 |

```json
"predicate": {
  "type": "condition",
  "property": "broken"
}
```

#### match 谓词

| 属性 | 说明 |
|------|------|
| `charge_type` | 弩装填的弹药类型（arrow/rocket） |
| `trim_material` | 盔甲纹饰材料 |
| `context_dimension` | 当前维度 |
| `custom_model_data` | CMD 字符串 |

```json
"predicate": {
  "type": "match",
  "property": "context_dimension",
  "value": "minecraft:the_end"
}
```

#### range_dispatch 谓词

| 属性 | 可标准化 | 说明 |
|------|---------|------|
| `bundle_fullness` | 否 | 收集袋充满度 |
| `damage` | 是 | 物品损伤值 |
| `count` | 是 | 物品数量 |
| `custom_model_data` | 否 | CMD 浮点值 |

```json
"predicate": {
  "type": "range_dispatch",
  "property": "count",
  "threshold": 32
}
```

### predicate_strategy

- `and`（默认）：所有谓词都满足
- `or`：任一谓词满足

### priority

数值越高优先级越高，排在前面的定义先检查。

### 完整示例

#### 武器

```json
{
  "type": "definition",
  "model": "stellarity:dragonblade",
  "bedrock_identifier": "stellarity:dragonblade",
  "bedrock_options": {
    "icon": "stellarity.item_dragonblade",
    "display_handheld": true
  }
}
```

#### 盔甲

```json
{
  "type": "definition",
  "model": "stellarity:champion_chestplate",
  "bedrock_identifier": "stellarity:champion_chestplate",
  "bedrock_options": {
    "icon": "stellarity.item_champion_chestplate",
    "protection_value": 8
  },
  "components": {
    "minecraft:equippable": {
      "slot": "chest",
      "asset_id": "stellarity:champion"
    },
    "minecraft:max_stack_size": 1
  }
}
```

#### 食物

```json
{
  "type": "definition",
  "model": "geyser_mc:yummy_food",
  "bedrock_identifier": "geyser_mc:yummy_food",
  "components": {
    "minecraft:consumable": {},
    "minecraft:food": {
      "nutrition": 5,
      "saturation": 0.0
    },
    "minecraft:max_stack_size": 16
  }
}
```

## 4. 硬限制：不可兼得的物品

::: danger 实测定论 2026-08-07
基岩版的行为动画全部硬编码在原版物品 ID 上。自定义 `bedrock_identifier` 会创建全新物品类型，**所有原版行为动画全部丢失**。
:::

### 机制详解

Geyser 源码 `CustomItemRegistryPopulator.java`（约 2037-2135 行）中有一段逻辑：根据 vanilla mapping 的 `bedrock_identifier` 自动注入 `chargeable`/`throwable` 组件到 item NBT：

```java
// 源码逻辑（简化）
case "minecraft:bow" -> GeyserChargeable.builder()
    .maxDrawDuration(1.0F)
    .ammunition(Identifier.of("arrow"))
    .build();
case "minecraft:crossbow" -> GeyserChargeable.builder()
    .chargeOnDraw(true)
    .ammunition(Identifier.of("arrow"))
    .build();
// 三叉戟自动获得 SPEAR 动画
if (mapping.getBedrockIdentifier().equals("minecraft:trident")) {
    return Optional.of(new Consumable(
        DEFAULT_ITEM_USE_DURATION,
        Consumable.ItemUseAnimation.TRIDENT,
        null, false, List.of()
    ));
}
```

**但是**：虽然 Geyser 把这些组件写入了 item NBT，**基岩客户端不认这些注入**——因为行为动画是客户端硬编码的，不是服务端 NBT 控制的。

### 基岩版动画映射表

```
NONE=0, EAT=1, DRINK=2, BLOCK=3, BOW=4, SPEAR=6, CROSSBOW=9, SPYGLASS=10, BRUSH=12
```

### 实测结果

| 物品 | 原版行为 | 自定义 bid 后果 | 能否同时有自定义纹理+原版行为 |
|------|---------|---------------|------|
| `minecraft:bow` | 拉弓动画（3段） | 能射但无拉弓动画 | **否** |
| `minecraft:crossbow` | 蓄力动画 | 无法射出 | **否** |
| `minecraft:trident` | 投掷动画 | 无投掷动画 | **否** |
| `minecraft:fishing_rod` | 抛竿动画 | 手持角度歪斜 | **否** |
| `minecraft:elytra` | 飞行功能 | 无法飞行 | **否** |
| `minecraft:shield` | 格挡动画 | 无法格挡 | **否** |

### 为什么不能只保留 icon？

`bedrock_identifier` 在 V2 格式下是**必填字段**。尝试省略它（只设 `icon`）会导致：

```
InvalidCustomMappingsFileException: While reading key "bedrock_identifier"
in single item definition: key is required but was not present
```

所以只有两个选择：
- **有 bid** → 创建新物品类型 → 丢失原版行为
- **无 bid** → 报错，Geyser 拒绝加载

### 唯一解

**删除这 6 类物品的全部映射条目**，走纯原版。功能正常但无自定义纹理。

::: tip 结论
弓、弩、三叉戟、钓竿、鞘翅、盾——这 6 类物品在基岩版**无法同时拥有自定义纹理和原版行为动画**。这是 Geyser V2 映射系统的硬限制，不是配置问题。
:::

## 5. 自定义方块映射

### JSON 映射（原版方块覆盖）

```json
{
  "format_version": 1,
  "blocks": {
    "minecraft:granite_wall": {
      "name": "my_block",
      "display_name": "自定义花岗岩墙",
      "geometry": "geometry.blocks.my_block_geo",
      "material_instances": {
        "*": {
          "texture": "some_texture",
          "render_method": "alpha_test",
          "face_dimming": true,
          "ambient_occlusion": true
        }
      },
      "tags": ["stone", "wall"],
      "state_overrides": {
        "east=none,north=none,south=none,up=true,waterlogged=true,west=none": {
          "geometry": "geometry.blocks.my_other_block_geo",
          "destructible_by_mining": 10
        }
      }
    }
  }
}
```

### 方块组件

| 组件 | 说明 |
|------|------|
| `geometry` | 几何体标识符或对象 |
| `material_instances` | 材质实例（纹理+渲染方法） |
| `collision_box` | 碰撞箱 |
| `selection_box` | 选择箱 |
| `light_emission` | 发光等级 0-15 |
| `light_dampening` | 遮光等级 0-15 |
| `friction` | 摩擦力 0.0-1.0 |
| `tags` | 方块标签 |
| `transformation` | 变换（缩放/平移/旋转） |
| `placement_filter` | 放置规则 |
| `unit_cube` | 是否为标准立方体 |
| `state_overrides` | 按方块状态覆盖属性 |

### 限制

JSON 映射只能覆盖**已知原版方块状态**。对于 CraftEngine 等插件运行时动态注册的非原版方块（如 `craftengine:custom_44`），JSON 映射会报错：

```
InvalidCustomMappingsFileException: Unknown Java block: craftengine:custom_44
```

必须使用 Extension API（见第 6 节）。

## 6. Geyser Extension 开发（非原版方块）

### 项目结构

```text
CustomCrops-Geyser/
├── build.gradle.kts
├── settings.gradle.kts
├── src/main/resources/
│   ├── extension.yml
│   └── geometry/
│       ├── block_1.geo.json
│       └── block_2.geo.json
└── src/main/java/.../
    ├── MyExtension.java
    └── BlockDefinitions.java
```

### extension.yml

```yaml
name: CustomCrops
id: customcrops
main: top.miragedge.geyser.customcrops.CustomCropsExtension
api: 2.11.0
version: 1.0.0
```

### build.gradle.kts

```kotlin
plugins { id("java") }
group = "top.miragedge"
version = "1.0.0"

repositories {
    mavenCentral()
    maven("https://repo.opencollab.dev/main/")
    maven("https://jitpack.io")
}

dependencies {
    compileOnly("org.geysermc.geyser:api:2.11.0-SNAPSHOT")
}

tasks.jar { archiveBaseName.set("CustomCrops-Geyser") }
```

### 核心代码

```java
package top.miragedge.geyser.customcrops;

import org.geysermc.geyser.api.extension.Extension;
import org.geysermc.geyser.api.event.lifecycle.GeyserDefineCustomBlocksEvent;
import org.geysermc.geyser.api.block.custom.NonVanillaCustomBlockData;
import org.geysermc.geyser.api.block.custom.CustomBlockState;
import org.geysermc.geyser.api.block.custom.component.CustomBlockComponents;
import org.geysermc.geyser.api.block.custom.component.BoxComponent;
import org.geysermc.geyser.api.block.custom.component.GeometryComponent;
import org.geysermc.geyser.api.block.custom.component.MaterialInstance;
import org.geysermc.geyser.api.block.custom.nonvanilla.JavaBlockState;
import org.geysermc.geyser.api.block.custom.nonvanilla.JavaBoundingBox;
import org.geysermc.event.subscribe.Subscribe;

public class CustomCropsExtension implements Extension {

    @Subscribe
    public void onDefineCustomBlocks(GeyserDefineCustomBlocksEvent event) {
        int idCounter = 0;

        for (BlockDefinitions.BlockDef def : BlockDefinitions.BLOCKS) {
            // 构建方块组件
            CustomBlockComponents components = CustomBlockComponents.builder()
                .geometry(GeometryComponent.builder()
                    .identifier("geometry.customcrops." + def.modelName())
                    .build())
                .materialInstance("*", MaterialInstance.builder()
                    .texture("customcrops_" + def.modelName())
                    .renderMethod("alpha_test")
                    .faceDimming(true)
                    .ambientOcclusion(true)
                    .build())
                .collisionBox(BoxComponent.emptyBox())
                .selectionBox(new BoxComponent(-8, 0, -8, 16, 16, 16))
                .build();

            // 必须用 NonVanillaCustomBlockData
            NonVanillaCustomBlockData data = NonVanillaCustomBlockData.builder()
                .namespace("customcrops")
                .name("customcrops_" + def.modelName())
                .components(components)
                .includedInCreativeInventory(false)
                .build();

            event.register(data);

            // 用 JavaBlockState 映射非原版方块
            int baseId = 32367 + (idCounter * 2);
            idCounter++;

            CustomBlockState state = data.blockStateBuilder().build();
            JavaBlockState javaBlockState = JavaBlockState.builder()
                .identifier("craftengine:" + def.blockId())
                .javaId(baseId)
                .stateGroupId(baseId + 1)
                .blockHardness(1.0f)
                .waterlogged(false)
                .collision(new JavaBoundingBox[0])  // 必须非 null
                .canBreakWithHand(true)
                .pistonBehavior("NORMAL")  // 必须非 null
                .build();
            event.registerOverride(javaBlockState, state);
        }
    }
}
```

### JavaBlockState 必填字段

| 字段 | 值 | 注意事项 |
|------|-----|---------|
| `identifier` | `"craftengine:custom_44"` | CraftEngine 方块 ID |
| `javaId` | `>= 32367` | 必须在最后一个原版方块状态之后 |
| `stateGroupId` | `javaId + 1` | 状态组 ID |
| `blockHardness` | `1.0f` | 硬度 |
| `waterlogged` | `false` | 是否含水 |
| `collision` | `new JavaBoundingBox[0]` | **必须非 null**，否则 NPE |
| `canBreakWithHand` | `true` | 徒手破坏 |
| `pistonBehavior` | `"NORMAL"` | **必须非 null**，否则 NPE |

::: danger 常见崩溃
- `collision` 为 null → `NullPointerException: Cannot read array length`
- `pistonBehavior` 为 null → 同上
- `javaId < 32367` → `RuntimeException: runtime ID must start after last vanilla block state`
:::

### 构建与部署

```bash
# 构建
cmd.exe /c "F:\env\gradle\8.12\bin\gradle.bat build --no-daemon"

# 部署
scp build/libs/CustomCrops-Geyser-1.0.0.jar \
    root@server:/mnt/miragedge/vc/plugins/Geyser-Velocity/extensions/
```

## 7. Java 方块模型 → 基岩版几何体转换

### 坐标系差异

| 属性 | Java Edition | Bedrock Edition |
|------|-------------|-----------------|
| 原点 | 左下角 (0,0,0) | 中心 (-8,0,-8) |
| 范围 | 0~16 | -8~8 |
| UV | 每面独立 | 按 cube UV |

转换公式：`bedrock_x = java_x - 8`

### 零厚度元素处理

十字形植物模型（如作物）在 Java 中使用零厚度元素（如 `from=[0,0,8] to=[16,16,8]`）。直接转换会导致 z-fighting。

**修复**：对零厚度元素加 1px 厚度：

```python
if dx < 1:
    x1 -= 0.5
    x2 += 0.5
    dx = 1
```

### parent 模型递归继承

Java 模型可以通过 `parent` 字段继承父模型。转换器必须递归解析 parent 链，直到找到有 `elements` 的模型。

常见 parent：
- `block/crop` → 十字形作物（无 elements，需 fallback）
- `block/cube_all` → 标准立方体（无 elements，需 fallback）
- `block/handheld` → 手持物品（有 display transform）

### Vanilla parent fallback

对于 parent 为 vanilla 模型且自身无 elements 的情况，需要生成 fallback 几何体：

| Parent | Fallback 几何体 |
|--------|----------------|
| `block/crop` | 十字形（2 个交叉平面） |
| `block/cube_all` | 标准立方体 |
| `block/cube` | 标准立方体 |

### rstrip(".json") 陷阱

::: danger Python 陷阱
`path.rstrip(".json")` 是**字符集剥离**，不是后缀移除！

`"stage_golden".rstrip(".json")` → `"stage_golde"`（末尾的 `n` 被剥掉了，因为它在 `.json` 字符集中）

**正确写法**：
```python
path = path[:-5] if path.endswith(".json") else path
```
:::

### 纹理路径映射

Java 纹理引用 → 基岩版 terrain_texture 键：

```text
Java: customcrops:block/crop/cucumber/cucumber_1
                    ↓ 去掉命名空间和 block/ 前缀
中间: crop/cucumber/cucumber_1
                    ↓ 加 blocks/ 前缀
Bedrock PNG 路径: textures/blocks/crop/cucumber/cucumber_1.png
                    ↓ 路径用 _ 连接
terrain_texture 键: blocks_crop_cucumber_cucumber_1
```

### Vanilla 纹理回退

部分 Java 模型引用原版纹理（如 `block/oak_log`），基岩版需映射到对应原版纹理键：

```python
VANILLA_TEX = {
    "block/spruce_log": "log/spruce",
    "block/oak_log": "log/oak",
    "block/farmland": "farmland",
    "block/farmland_moist": "farmland_wet",
    "block/water_still": "water_still_grey",
}
```

## 8. CraftEngine 集成注意事项

### 动态方块注册

CraftEngine 的自定义方块在**服务器运行时动态注册**（如 `craftengine:custom_44`）。Geyser 启动时这些方块还不存在，所以 JSON 映射会报错 `Unknown Java block`。

**解决方案**：用 Geyser Extension API 的 `NonVanillaCustomBlockData` + `JavaBlockState`，在 `GeyserDefineCustomBlocksEvent` 中注册。

### CE 资源包

| 文件 | 用途 |
|------|------|
| `generated/resource_pack.zip` | 受保护/混淆的主包，**不作为转换输入** |
| `generated/resource_pack_unprotected.zip` | 未保护副本，**首选转换输入** |
| `generated/resource_pack_map.zip` | BlueMap 兼容包，**不用** |

### CE blockstates

CE 的 blockstates 文件位于 `assets/craftengine/blockstates/custom_XX.json`，包含 `variants` 字段，指向 Java 模型路径。

### 缩短名映射

部分作物名过长会导致基岩版路径超 80 字符，需要缩短：

| 原名 | 缩写 |
|------|------|
| `chinese_cabbage` | `ch_cabbage` |
| `gigantic_cabbage` | `gi_cabbage` |
| `gigantic_pineapple` | `gi_pineapple` |
| `gigantic_tomato` | `gi_tomato` |
| `greenhouse_glass` | `gh_glass` |
| `sweet_potato` | `s_potato` |
| `crimson_bracket_fungus` | `cbf` |
| `warped_glow_fungus` | `wgf` |

## 9. Incendium / Stellarity 数据包适配

### Incendium（下界）

- 使用旧版 `custom_model_data` + 函数体系（非 `item_model`）
- 必须用 V2 `legacy` 类型映射
- 官方 Sparkles GeyserMC Pack 已包含大部分物品（不含弩/鞘翅/盾）
- 官方包 4 处基础物品错误已修正

**修正记录**：
- `blazing_hatchet` → `iron_axe`（官方写 diamond/netherite_axe）
- `scarlet_dagger(vampire)` → `iron_sword`（官方写 netherite_sword）
- `withersbane` → `iron_sword`（官方写 golden_sword）
- `chilling` 仅 `diamond_sword`（官方多写 netherite_sword）

### Stellarity（末地）

- 使用 `item_model`（1.21.4+），用 V2 `definition` 类型映射
- 约 132 个映射条目
- 弓/弩/三叉戟/钓竿/鞘翅/盾因硬限制已删除映射（见第 4 节）

### 官方 Sparkles GeyserMC Pack 限制

| 限制 | 说明 |
|------|------|
| 弓拉弓动画 | 仅 3 段（基岩版硬限制） |
| 弩 | 不包含 |
| 鞘翅 | 不包含 |
| 盾牌 | 不包含（WIP） |
| 自定义生物纹理 | 不包含（OptiFine 特性） |

### base item 验证

**不要猜测 base item！** 必须从数据包的 loot table 中提取：

```bash
# 检查 loot table
unzip -p datapack.zip data/.../loot_table/item/xxx.json | jq '.pools[0].entries[0].name'
```

### 盔甲适配

1. 映射中添加 `minecraft:equippable` 组件（指定 slot）
2. 资源包中创建 `attachables/` JSON 文件
3. 盔甲纹理放入 `textures/models/armor/`（胸甲 `_1`，护腿 `_2`）

## 10. 部署流程

### 目录结构

```text
Geyser-Velocity/
├── custom_mappings/        # 映射 JSON 文件
│   ├── miragedge-managed.json
│   └── incendium_mappings.json
├── packs/                  # 基岩版资源包
│   ├── stellarity-pack.mcpack
│   └── incendium-pack.mcpack
├── extensions/             # Geyser 扩展 JAR
│   └── CustomCrops-Geyser-1.0.0.jar
└── config.yml
```

### 部署步骤

1. **备份**：`cp miragedge-managed.json miragedge-managed.json.bak-$(date +%Y%m%d)`
2. **上传映射**：`scp miragedge-managed.json root@server:.../custom_mappings/`
3. **上传资源包**：`scp my-pack.mcpack root@server:.../packs/`
4. **上传扩展**：`scp my-ext.jar root@server:.../extensions/`
5. **检查 config.yml**：`enable-custom-content: true`
6. **重启 Geyser**
7. **验证日志**

### 验证日志

```text
[geyser]: Registered 496 custom items
[geyser]: Registered 103 non-vanilla block overrides.
[geyser]: Registered 199 custom block overrides.
[geyser]: Registered 1574 custom blocks.
```

常见错误：
- `key is required but was not present` → bedrock_identifier 缺失
- `Unknown Java block` → JSON 映射引用了不存在的方块 ID
- `namespace cannot be minecraft` → bedrock_identifier 用了 minecraft: 前缀

## 11. 验证清单

部署前逐项检查：

- [ ] `format_version` 正确（物品 V2=2，方块 V1=1）
- [ ] 所有 `bedrock_identifier` 唯一
- [ ] `bedrock_identifier` 不使用 `minecraft:` 命名空间
- [ ] 弓/弩/三叉戟/钓竿/鞘翅/盾的映射已删除（硬限制）
- [ ] 武器/工具有 `display_handheld: true`
- [ ] 盔甲有 `components.minecraft:equippable`（含 slot）
- [ ] 所有 `bedrock_options.icon` 引用匹配 `item_texture.json` 键
- [ ] base item 从 loot table 验证，非猜测
- [ ] 资源包有 `manifest.json`（两个不同 UUID）
- [ ] 纹理路径 < 80 字符
- [ ] `terrain_texture.json` 包含所有方块纹理键
- [ ] `item_texture.json` 包含所有物品纹理键
- [ ] 几何体文件 `.geo.json` 的 `identifier` 以 `geometry.` 开头
- [ ] Extension 的 `JavaBlockState` 有 `collision`（非 null）和 `pistonBehavior`（非 null）
- [ ] Extension 的 `javaId >= 32367`
- [ ] 部署前已备份
- [ ] Geyser 重启后日志无 ERROR

## 12. 参考来源

### Geyser 官方文档

- [Custom Items (v2)](https://geysermc.org/wiki/geyser/custom-items)
- [Custom Items (v1)](https://geysermc.org/wiki/geyser/custom-items-old)
- [Custom Blocks](https://geysermc.org/wiki/geyser/custom-blocks)
- [Using Resource Packs](https://geysermc.org/wiki/geyser/packs)
- [Custom Entities](https://geysermc.org/wiki/geyser/custom-entities)
- [Rainbow](https://geysermc.org/wiki/other/rainbow/)

### GeyserMC GitHub 源码

- [Geyser 主仓库](https://github.com/GeyserMC/Geyser)
- [CustomItemRegistryPopulator.java](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/registry/populator/CustomItemRegistryPopulator.java)
- [CustomBlockRegistryPopulator.java](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/registry/populator/CustomBlockRegistryPopulator.java)
- [Rainbow](https://github.com/GeyserMC/Rainbow)

### 基岩版资源包参考

- [Minecraft Wiki: Resource Pack](https://minecraft.wiki/w/Resource_pack)
- [Mojang bedrock-schemas](https://github.com/Mojang/bedrock-schemas)
- [manifest.json 模板](https://convertmcpack.net/pages/manifest_template.html)

### 社区工具

- [GeyserExtensionists/GeyserDisplayEntity](https://github.com/GeyserExtensionists/GeyserDisplayEntity) — Display Entity 扩展（与 Geyser 2.11 不兼容）
- [Kas-tle/java2bedrock.sh](https://github.com/Kas-tle/java2bedrock.sh) — 物品模型转换（仅 item/generated）
- [markeev/java2bedrock-furniture](https://github.com/markeev/java2bedrock-furniture) — 家具方块转换参考

### MiragEdge 本地资源

- 映射文件：`F:\FCelestial\Geyser-Velocity\custom_mappings\managed\miragedge-managed.json`
- 转换器：`F:\FCelestial\Geyser-Velocity\bridge\java2bedrock_converter.py`
- CustomCrops 扩展：`F:\FCelestial\CustomCrops-Geyser\`
- CE 资源包：`F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip`
