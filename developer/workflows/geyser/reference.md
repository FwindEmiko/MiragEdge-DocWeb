---
title: 协议与产物参考
description: Geyser 自定义内容的字段边界速查。涵盖 custom content 开关与目录、Custom Item v2 与谓词、Custom Block mapping、custom skulls 与语言覆盖、Rainbow 能力定位。
outline: [2, 3]
---

# 协议与产物参考

这页是 [Geyser 基岩版内容转化](./) 的字段速查。示例只展示 schema 形状与约束，不是可直接部署的 MiragEdge 配置。

具体 ID、基础材料、组件和资源路径必须从三处取得。

它们分别是实际 CE 最终合并包、真实物品栈和 Rainbow 报告。

## 1. Custom Content 开关与目录

```yaml
gameplay:
  enable-custom-content: true
```

该配置启用 Geyser 的三种 mapping 系统：item、block 和 skull。关闭时它们都不会生效，变更后需要重启 Geyser。

逻辑目录：

```text
<Geyser data folder>/
├── custom_mappings/    # 多个 JSON mapping 文件可共存
├── packs/              # 基岩版 .zip 或 .mcpack
├── locales/overrides/  # 语言覆盖
├── custom-skulls.yml
└── extensions/         # 自定义 block、entity、pack 选择等 API 路线
```

Geyser 不自动转换 Java 资源包。它也不自动生成 custom item mapping。

Rainbow 是当前优先的采集与生成工具。它仍是实验性工具，输出必须审计。

## 2. Custom Item v2

Geyser API 2.9.3 与 Build 1062 及之后，把旧 custom item v1 标为 deprecated。当前推荐 v2。v2 处理：

- Java 1.21.4 以上的 `minecraft:item_model` 与 item components。
- 旧式 `minecraft:custom_model_data` 的 legacy 定义。
- 同一 Java 基础物品和 model 下由谓词选择多个预注册基岩版物品。

基岩版 item components 不能在运行时任意改变，与 Java item stack 不同。因此 mapping 中声明的组件应是「该定义总会拥有」的稳定属性。不同组件组合要拆成不同定义和谓词。

### JSON 顶层

```json
{
  "format_version": 2,
  "items": {
    "minecraft:flint": [
      {
        "type": "definition",
        "model": "example:custom_item_model",
        "bedrock_identifier": "example:custom_item"
      }
    ]
  }
}
```

`items` 的键是基础 Java item，不是 CE item ID。每个值是一个 definitions 数组。

| 定义类型 | 必填字段 | 用途 |
| --- | --- | --- |
| `definition` | `model`、`bedrock_identifier` | 现代 `item_model` 映射 |
| `legacy` | `custom_model_data`、`bedrock_identifier` | legacy CMD 映射，CMD 是 float 值 |
| `group` | `definitions`，可选共享 `model` | 为同一模型组织多个条件化定义，成员可继承 group 的 model |

`bedrock_identifier` 不可使用 `minecraft` namespace。它可以被不同 Java 基础物品复用，但复用时必须指向完全相同的 Bedrock-facing 定义，例如相同的 `icon`、`components` 和 `bedrock_options`。不能让同一 identifier 在不同映射里隐式代表两个物品。缺命名空间时 Geyser 可能使用默认 namespace，生产配置不要依赖这种隐式行为。

### Bedrock options

```json
"bedrock_options": {
  "icon": "example.custom_item",
  "allow_offhand": true,
  "display_handheld": true,
  "protection_value": 4,
  "creative_category": "equipment",
  "creative_group": "itemGroup.name.chestplate",
  "tags": ["example:weapon"]
}
```

| 字段 | 规则 |
| --- | --- |
| `icon` | 对应 `textures/item_texture.json` 中的 shorthand。默认从 Bedrock ID 推导时 `:` 变 `.`、`/` 变 `_`，生产包建议显式写 |
| `allow_offhand` | 默认 `true`，禁止副手时显式写 `false` |
| `display_handheld` | 工具与武器等手持模型通常需要，普通 2D 物品不要盲开 |
| `protection_value` | 装备栏视觉护甲值，只在可装备物品上有视觉意义 |
| `creative_category` | 取值 `none`、`construction`、`nature`、`equipment`、`items`。自定义物品是配方产物时必须设置，否则基岩版配方书不显示 |
| `creative_group` | 只能使用现有基岩版 group，Geyser 当前不能创建自定义 group |
| `tags` | 供资源包 Molang 表达式使用，不是 Java 数据包 tag |

### 受支持的稳定组件

```text
minecraft:consumable
minecraft:equippable
minecraft:food
minecraft:max_damage
minecraft:max_stack_size
minecraft:use_cooldown
minecraft:enchantable
minecraft:tool
minecraft:repairable
minecraft:enchantment_glint_override
minecraft:attack_range
minecraft:kinetic_weapon
minecraft:piercing_weapon
minecraft:swing_animation
minecraft:use_effects
```

限制也必须写入设计：

- `consumable` 不支持食用粒子与音效。
- `equippable` 不支持 camera overlay 与 swappable。
- 基岩版当前不支持某些可穿戴且可堆叠的组合。必要时移除冲突的基础 item 默认组件。
- `enchantable` 在基岩版被映射为 `slot=all`，不保证非原版附魔可用。
- `attack_range` 需要与 `kinetic_weapon` 或 `piercing_weapon` 联动才有效。
- `swing_animation` 的实际动画固定，通常只能修改时长。
- `use_effects` 的 `can_sprint` 不可翻译，并且只在基础物品能射击、投掷或可食用时才会翻译。
- `rarity`、`attribute_modifiers` 等组件已由 Geyser 自动处理，不要重复塞进每个 mapping。

移除基础 item 默认组件时，JSON key 使用 `!` 前缀：

```json
"components": {
  "!minecraft:food": {}
}
```

只在清楚理解基础物品默认行为与基岩版限制时使用。随机移除组件会让 Java 与基岩版行为更不一致。

### 谓词

同一 Java item 加 model 可以有一个无谓词的 fallback 和若干带谓词的定义。多条定义的谓词不能相同。若 model 属于 `minecraft` namespace，无谓词定义还有额外限制。

| 类型 | property | 说明 |
| --- | --- | --- |
| `condition` | `broken`、`damaged` | 耐久状态 |
| `condition` | `custom_model_data` | 检查 CMD flag，需注意 index |
| `condition` | `has_component` | 检查组件，包含默认组件 |
| `condition` | `fishing_rod_cast` | 当前是否持有已抛出的钓竿 |
| `match` | `charge_type`、`trim_material`、`context_dimension`、`custom_model_data` | 文本式匹配，必须提供 `value` |
| `range_dispatch` | `bundle_fullness`、`damage`、`count`、`custom_model_data` | 数值大于等于 threshold，可用 `scale`，部分 property 支持 `normalize` |

谓词可用 `expected: false` 反转。多谓词默认 `and`，也可显式写：

```json
"predicate_strategy": "or"
```

Geyser 的优先匹配顺序是较高的 `priority`、较高的 range threshold、更多的谓词。复杂多范围条件仍应显式审计并在必要时设置 `priority`。

使用 API 时，分别注册每个内置谓词并使用 `PredicateStrategy.AND` 或 `PredicateStrategy.OR`。不要手工把谓词链成一个表达式，否则 Geyser 无法高效缓存结果。

### 非原版 Java item

Fabric 与 NeoForge 等真正非原版的 Java item 只能由 Geyser API 的 `NonVanillaCustomItemDefinition` 注册，不能用 JSON mappings。它不支持谓词、谓词策略和 priority。这不是 CE 与 Paper 普通自定义物品的默认路线，除非服务端确实发送非原版 Java item identifier。

## 3. item_texture.json

```json
{
  "resource_pack_name": "miragedge-bedrock-r01",
  "texture_name": "atlas.items",
  "texture_data": {
    "miragedge.star_rod": {
      "textures": ["textures/items/star_rod"]
    }
  }
}
```

mapping 中的 `bedrock_options.icon` 必须匹配 `texture_data` 的键。`textures/items/star_rod` 是基岩版包内路径，通常不写 `.png`。它与 Java 的 `assets/<namespace>/textures/...` 不同。

## 4. Custom Block mappings

```json
{
  "format_version": 1,
  "blocks": {
    "minecraft:granite_wall": {
      "name": "miragedge_example_block",
      "display_name": "示例方块",
      "geometry": "geometry.miragedge.example_block",
      "material_instances": {
        "*": {
          "texture": "miragedge_example_block",
          "render_method": "alpha_test",
          "face_dimming": true,
          "ambient_occlusion": true
        }
      }
    }
  }
}
```

`name` 是唯一必填字段，其余组件按需求设置。顶层 block 键和 `state_overrides` 的键必须是实际 Java block state，不可从 CE 配置名称猜测。

常用可配置项：

- `collision_box` 与 `selection_box`：支持一个或多个盒子。碰撞的 origin 与 size、selection bounds 都有基岩版坐标范围限制。复杂 CE 家具不要用一个猜测的整方块盒子代替实际碰撞。
- `geometry`：字符串 identifier，或带 `bone_visibility` 的对象。
- `material_instances`：逐面或 glob 的纹理、`render_method`、face dimming、AO。
- `state_overrides`：每个 Java 状态组合可覆盖 geometry、挖掘时间、放置、摩擦、亮度、变换等。
- `transformation`：translation、scale、rotation。rotation 按基岩版支持的 90 度步进设计。
- `placement_filter`、`tags`、`creative_category`、`creative_group`、`included_in_creative_inventory`。
- `light_emission`、`light_dampening`、`friction`、`unit_cube`。

::: warning Block components 在基岩版更新中相对不稳定
每次 Geyser 或基岩版更新都要重新检查 block mappings。实机覆盖要包括碰撞、选择、放置、光照、状态切换和区块重载。
:::

JSON 无法表达复杂块时，Geyser extension 可在 `GeyserDefineCustomBlocksEvent` 中注册 `CustomBlockData`、components、permutations、item 与 block overrides。它仍需要基岩版包提供 geometry 和纹理。

## 5. Custom skulls、语言与 waypoint

### Custom skulls

Geyser 通过 `custom-skulls.yml` 预注册 Java 玩家头颅，生成对应的基岩版 block 或 attachable 表示，才能在背包、手持和实体穿戴中显示。可用输入包括：

- Java player username。
- Java player UUID。
- 头颅 NBT 中的 player profile Base64 值。
- Minecraft 皮肤服务器纹理 hash。

Rainbow 原始输出若含 `custom-skulls.yml`，应完整放进 release 的 `rainbow/input/`，不能直接部署。Bridge 再按 `player-usernames`、`player-uuids`、`player-profiles`、`skin-hashes` 四个 list section 去重，并生成 `custom-skulls.patch.yml` 和最终 `merged/custom-skulls.yml`。

当前 Geyser schema 的每个条目本身就是字符串。不存在可安全「更新同 key 不同值」的结构化字段。

新值追加，完全相同的值跳过，禁止整体覆盖。

用户名与 UUID 跟随皮肤变化。profile 与 hash 只有人工更新才会变化。发布记录要写清采用的稳定性策略和最终文件 SHA。

### 语言覆盖

Rainbow 会从已加载 Java 资源包导出并合并 Geyser 兼容的语言覆盖，投放到 `locales/overrides/`。最终 Java 包的 `assets/*/lang/*.json` 不能被盲目复制到这里：Java 翻译键、Geyser 翻译键、字体和 GUI 语义并不天然一一对应。

Bridge 的 `reports/java-languages.json` 仅用于核对各 locale 的来源、键数量和冲突。只有 Rainbow 导出的或经人工确认的 override 才会进入 staging release。语言覆盖也不等于 Java 字体、格式化标签、GUI 位置或自定义 glyph 在基岩版可用。

### Waypoint styles

Geyser 支持 custom waypoint styles，JSON schema 使用 `format_version: 1` 与 `waypoint_styles`，至少需要 sprite，near 与 far 距离有默认值。它与物品和实体无关，只有服务器实际使用 locator bar waypoint 样式时才加入覆盖清单。Rainbow 提供 waypoint 映射能力，但没有实际需求时不应增加额外包复杂度。

## 6. Rainbow 能力与限制

| 能力 | 当前定位 |
| --- | --- |
| 自定义 block state overrides | 可自动或手工映射，`/rainbow auto blocks` 可能短暂冻结客户端 |
| `item_model` 与 CMD item | 可生成 mappings、components、Bedrock options 和部分谓词 |
| 2D item | 可生成简单基岩版包 |
| 3D item | 可转换 Java model 为基岩版 geometry、attachable、动画和 GUI icon，支持部分 head、first、third transforms |
| 简单 armor | 可分析 `equippable` 与装备资源 |
| 自定义 elytra | 仅视觉支持，不能宣称完整行为等价 |
| 动画纹理 | 单纹理 2D 与 3D 物品可生成 flipbook，多纹理复杂动画要人工检查 |
| sounds | 可采集自定义声音 |
| language | 可合并导出语言覆盖 |
| skulls | 可导出 mappings 与头颅清单 |
| 生物实体、CEM、Display Entity | 不属于通用自动转换承诺，转到实体工作流 |
| Java 字体、UI、shader | 不属于通用自动转换承诺，按基岩版 UI 与回退设计 |

## 7. 历史工具的位置

`Kas-tle/java2bedrock.sh` 说明过 Java 模型、sprite、mapping 的早期转换思路，但它的 README 依赖历史基岩版版本和 behavior pack 实验功能，且声明 Windows 不是原生目标。它不应替代当前生产链：

```text
CE 最终未保护 Java 包
  -> Java 客户端实际加载
  -> Rainbow
  -> Geyser mappings 与基岩版资源包
  -> 静态审计与基岩版实机测试
```

可以把旧工具作为排查 Java 模型结构和手工 sprite 的参考。

但不得把它的 output 当作当前 Geyser 兼容性结论。

## 8. 上游资料

- [Geyser Custom Content](https://geysermc.org/wiki/geyser/custom-content)
- [Geyser Custom Items](https://geysermc.org/wiki/geyser/custom-items)
- [Geyser Custom Blocks](https://geysermc.org/wiki/geyser/custom-blocks)
- [Geyser Custom Skulls](https://geysermc.org/wiki/geyser/custom-skulls)
- [Geyser Custom Waypoints](https://geysermc.org/wiki/geyser/custom-waypoints)
- [Geyser Entity API](https://geysermc.org/wiki/geyser/custom-entities)
- [Geyser Resource Packs](https://geysermc.org/wiki/geyser/packs)
- [Rainbow documentation](https://geysermc.org/wiki/other/rainbow/)
- [Rainbow source](https://github.com/GeyserMC/Rainbow)
