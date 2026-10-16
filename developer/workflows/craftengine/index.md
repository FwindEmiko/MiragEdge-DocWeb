---
title: CraftEngine 开发工作流
description: CraftEngine 内容开发入口。涵盖 pack 与命名空间约定、六条必记规则、标准五步闭环、物品与方块与字体图标配置模式、AI 执行清单和故障定位表。
outline: [2, 3]
head:
  - - meta
    - name: keywords
      content: "Minecraft, CraftEngine, CE, 资源包, 自定义物品, 字体图标, YAML, AI Skills"
---

# CraftEngine 开发工作流

CraftEngine 负责物品、方块、字体图标和资源包的注册与生成。这页给出开发闭环与配置模式。

实际配置优先于本文示例。资源拷贝位于 `F:\CraftEngine\resources`。官方文档与源码只用于确认版本差异和未覆盖能力。

## 六条必记规则

1. CE 的资源根目录是 `plugins/CraftEngine/resources/`。本项目按功能拆成多个 pack，不把所有内容塞进一个 `items/` 目录。
2. 每个 pack 有自己的 `pack.yml`，其中的 `namespace` 是 CE pack 命名空间，例如 `miragedge_items`、`miragedge_icon`、`miragedge_menu`、`customcrops`。
3. `items:`、`blocks:`、`images:`、`templates:` 是不同注册表，不能混写。配置中的 ID 写成 `namespace:id`。
4. `texture:` 与 `model:` 不是一回事。前者指向纹理资源，后者指向模型资源。图标字体使用 `images:`，不要伪造成物品。
5. `texture: minecraft:item/food/bacon` 对应 `assets/minecraft/textures/item/food/bacon.png`。`assets/`、`textures/` 和 `.png` 都不写进 CE 引用值。
6. 改动后必须同时验证 CE 加载、资源包下载和游戏内显示。YAML 不报错不代表客户端材质正确。

## 流程图

<SmartImage src="/images/developer/workflows/craftengine/texture-pipeline.svg" caption="图 1：CraftEngine 内容链路——定义（pack.yml 与 configuration）→ 纹理（resourcepack/assets 下的 PNG）→ 模型（模型 JSON 与模板）→ 基岩转换（Geyser 映射与资源包）" width="880" />

## 适用边界

| 系统 | CE 负责 | 其他系统负责 |
| --- | --- | --- |
| 自定义物品 | ID、基础材料、`data`、贴图与模型、事件 | 业务插件的复杂逻辑 |
| 自定义方块 | 方块注册、状态、模型、破坏与掉落配置 | 数据包的函数、世界生成和结构 |
| 字体图标 | `images:` 注册、字体文件、字符映射 | 菜单与聊天插件决定何时输出字符 |
| 资源包 | `assets/<namespace>/` 下的 PNG、模型、字体 | 客户端实际下载和缓存 |
| 数据包联动 | CE 物品 ID 作为跨系统数据 | `function`、`loot_table`、`recipe`、`structure` |

相关页面：

- [数据包与 CraftEngine 集成](/developer/workflows/datapack/ce-integration)
- [自定义作物工作流](/developer/workflows/custom-crops)
- [Geyser 基岩版内容转化工作流](/developer/workflows/geyser/)
- [CE 配置参考与实际目录](/developer/workflows/craftengine/reference)
- [CE 自定义盔甲模型与装备纹理](/developer/workflows/craftengine/armor)
- [官方 CE 文档](https://ce-pre.gtemc.cn/)
- [CraftEngine 源码仓库](https://github.com/Xiao-MoMi/craft-engine)
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)

## 实际目录

```text
plugins/CraftEngine/resources/
├── miragedge_items/
│   ├── pack.yml
│   ├── configuration/             # items、blocks、templates、recipes
│   └── resourcepack/assets/minecraft/
│       ├── models/
│       └── textures/
├── miragedge_icon/
│   ├── pack.yml
│   ├── configuration/icon.yml     # images: 字体图标
│   └── resourcepack/assets/minecraft/textures/font/image/
├── miragedge_menu/
├── miragedge_rank/
├── miragedge_other/
└── customcrops/
```

`miragedge_items` 的 `pack.yml` namespace 是 `miragedge_items`。`customcrops` 的作物配置使用 `customcrops:*` ID。新增内容先选择归属 pack，再决定路径和 ID，不要默认套用 `miragedge:`。

## 标准五步闭环

### 1. 盘点依赖

先判断这是物品、方块、字体图标、菜单模型还是作物阶段资源。

确认四件事：目标 pack、基础材料、客户端版本和是否需要基岩版兼容。再确认目标 ID 是否已被占用。

### 2. 设计 ID 与资源路径

使用小写 `snake_case`：

```text
注册 ID：miragedge_items:star_rod
纹理引用：minecraft:item/rods/star_rod
实际文件：resourcepack/assets/minecraft/textures/item/rods/star_rod.png
```

ID 命名空间和资源命名空间可以不同，以实际文件与现有配置为准。路径的大小写、下划线和目录层级必须完全一致。

### 3. 编写最小配置

普通物品从 `items:` 开始，只添加本次需求需要的字段。物品显示数据放在 `data:` 中，材质字段放在物品根级。参考本页后面的[食物写法](#食物与事件)与[模型写法](#模型与方块)。

### 4. 验证资源链路

```text
CE YAML
  ├─ ID / material / data
  ├─ texture 或 model 引用
  └─ resourcepack/assets/... 下的 PNG / JSON / mcmeta
       ↓
客户端资源包下载
       ↓
游戏内获取物品、放置方块、打开菜单或发送字体字符
```

### 5. 重载与验收

```bash
/ce reload
/ce item get <namespace:id> [amount]
/reload
```

只有同时修改原版数据包时才需要 `/reload`。

::: warning 不要写未经版本确认的 CE 命令
`/ce reload` 的子命令随 CE 版本变化。把未经当前版本确认的 `/ce reload all`、`/resourcepack reload` 写进自动化脚本会导致失败。

资源包未更新时，先重新加入服务器或在客户端重新加载资源包，再判断材质是否失效。
:::

## 配置模式

### 普通物品

```yaml
items:
  miragedge_items:star_rod:
    material: fishing_rod
    data:
      item-name: "<!i><b><gradient:#00BFFF:#1E90FF>星辉钓鱼竿</gradient></b>"
      max-damage: 256
      custom-model-data: 203
    texture:
      - minecraft:item/rods/star_rod
      - minecraft:item/rods/star_rod_cast
```

多纹理列表用于具有不同状态的物品。本服鱼竿使用这种写法，不要改成虚构的 `layers:` 结构。

### 食物与事件

```yaml
items:
  miragedge_items:toast:
    material: bread
    data:
      item-name: "<!i><gradient:#DEB887:#BC8F8F><b>吐司</b></gradient>"
      food:
        nutrition: 7
        saturation: 8.0
        can-always-eat: false
      lore:
        - "<!i><gray>10秒速度 I</gray>"
    texture: minecraft:item/food/toast
    events:
      - on: consume
        functions:
          - type: potion_effect
            potion_effect: minecraft:speed
            duration: 200
            amplifier: 0
```

业务命令、条件和函数参数必须以当前 CE 版本文档和服务器已有配置为准。

不要从其他插件的事件语法照搬。

### 自定义食物食用时出现紫黑碎屑

以下结论已在 Java 26.2 与 CraftEngine 26.7.4 验证。

**现象**：物品贴图和手持模型都正常，但食用时出现黑紫色缺失材质粒子。

**判断**：CE 自带可食用物与 CustomCrops 果实正常时，可排除四项。它们分别是资源包整体加载、PNG 路径、`texture` 字段和 `food` 营养值。

**根因**：为了让物品不可堆叠而添加 `data.components.minecraft:max_damage: 1`，会在 Java 26.2 的 CE 自定义食物路径中把物品带入耐久组件处理，导致客户端解析食用碎屑粒子模型失败。

这不是缺少 `particle` 字段，也不需要为每种食物额外编写 `item/generated` 模型或粒子定义。

::: danger 不要用 max-damage 实现不可堆叠
错误写法：

```yaml
data:
  components:
    minecraft:max_damage: 1
```

正确写法是改用最大堆叠数量限制，并保留原有 `material`、`texture`、`food`、`events` 和 `consume-replacement` 配置：

```yaml
data:
  components:
    minecraft:max_stack_size: 1
  food:
    nutrition: 7
    saturation: 8.0
```
:::

修复时删除 `food.yml` 中所有食物项的 `max-damage: 1`。只有确实需要不可堆叠的食物才添加 `minecraft:max_stack_size: 1`。

验证步骤：

1. 修改实际服务器目录 `CraftEngine/resources/miragedge_items/configuration/food.yml`。
2. 执行 `/ce reload all`，让客户端重新接收或刷新服务端资源包。
3. 抽测普通食物、带 `on consume` 事件的食物、带 `consume-replacement` 的饮料各一项。
4. 仍异常时，先用一个不带 `events` 的食物做最小复现，并检查是否残留 `max_damage`。

### 模型与方块

`model:` 用于模型注册或物品与方块绑定，常见结构是 `type`、`path`、`generation`。模型引用同样遵循资源定位规则。`customcrops:block/customcrops/crop/chinese_cabbage/stage_1` 对应 `assets/customcrops/models/block/customcrops/crop/chinese_cabbage/stage_1.json`。

```yaml
items:
  customcrops:chinese_cabbage_stage_1:
    material: sugar
    model: customcrops:block/customcrops/crop/chinese_cabbage/stage_1
    behavior:
      type: block_item
```

项目还使用 `templates/models.yml`、`templates/block_states.yml` 和 `templates/block_settings.yml`。复杂方块先复用模板，再写单个实例。

### 字体图标

```yaml
images:
  miragedge_icon:money:
    height: 10
    ascent: 8
    font: minecraft:default
    file: minecraft:font/image/money.png
    chars: "\ue001"
```

`file` 对应 `assets/minecraft/textures/font/image/money.png`。`chars` 是实际字符映射，上面写法即私用区的 U+E001，实际配置中直接写字符本身。不要假设所有字符都在 U+E000–U+F8FF，服务器现有配置中同时存在私用区字符和其他 Unicode 字符。新增字符前必须在 `icon.yml`、`rank_icom.yml` 和菜单配置中查重。

字体图标的使用方式由菜单与聊天插件决定。CE 注册了图标，不代表玩家发送普通文字时会自动显示。

### 装备与盔甲

装备涉及 `items:`、`templates:`、`model:`、`equipments:` 多个注册表。`miragedge_items/configuration/armor.yml` 为 1.21.2 以上使用 `type: component`，为旧版本保留 `type: trim` 分支，不要删掉版本条件。

```yaml
equipments:
  $$>=1.21.2:
    miragedge_items:winter_helmet_asset:
      type: component
      humanoid: "minecraft:entity/equipment/humanoid/winter_armor"
```

盔甲贴图还涉及 `assets/minecraft/textures/entity/equipment/...`，与背包物品图标的 `textures/item/...` 是两条资源链路，必须分别验收。详细方法见[CE 自定义盔甲模型与装备纹理](/developer/workflows/craftengine/armor)。

## AI 执行清单

收到 CE 改动请求时按以下顺序工作：

1. 扫描目标 pack 的 `pack.yml`、相关 `configuration` 和 `resourcepack/assets`，确认实际 namespace 与路径。
2. 搜索同类配置，优先复制服务器正在使用的最小模式。先不要引入模板、事件或模型高级字段。
3. 列出注册 ID、基础材料、配置路径、资源文件、客户端展示场景和联动插件。
4. 创建或修改配置与资源。YAML 中的中文保持 UTF-8 无 BOM，图片确认为真实 PNG 而非 HTML 错误页。
5. 检查 ID、路径大小写、资源文件存在性、同名字符冲突、JSON 与 YAML 语法。
6. 执行 `/ce reload` 后获取对象做游戏内验收，记录服务器日志中的首个错误。
7. 涉及数据包时额外执行 `/reload`，并参考[数据包与 CraftEngine 集成](/developer/workflows/datapack/ce-integration)。

## 故障定位

| 现象 | 优先检查 |
| --- | --- |
| 紫黑方块或材质缺失 | `texture` 或 `model` 路径、大小写、PNG 是否存在、客户端是否拿到新包 |
| 只显示原版物品 | ID 或配置文件未加载、`material` 或 `custom-model-data` 不匹配、字段缩进错误 |
| 字体图标为空白 | `images:` 是否加载、`file` 路径、`chars` 是否冲突、调用方是否指定了相同 font |
| 物品能拿到但放置异常 | 物品模型与方块模型混用，或缺少 block state 与 behavior |
| 自定义食物食用时有紫黑碎屑 | `food.yml` 是否残留 `max-damage: 1` 或 `minecraft:max_damage: 1` |
| CE 重载报错 | `logs/latest.log` 中第一条 CraftEngine 配置错误，回滚最后一个改动再二分 |
| Java 正常但基岩版异常 | 跨端转换链路问题，单独检查 Geyser 与转换资源包 |

## 版本与引用原则

- 不在本页硬编码未经验证的 CE 版本号。`pack.yml` 中的版本字段是 pack 版本，不等于插件版本。
- Minecraft 的 `pack_format` 由实际服务端版本决定，不能从旧页面或网上示例复制。
- 资料优先级依次为：当前服务器配置与日志、[CE 官方文档](https://ce-pre.gtemc.cn/)、[源码](https://github.com/Xiao-MoMi/craft-engine)、[DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)。
- DeepWiki 是辅助阅读材料，权威性低于源码和当前服务器配置。
