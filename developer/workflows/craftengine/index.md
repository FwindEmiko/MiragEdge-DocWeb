---
title: "CraftEngine 开发工作流 · AI Skills"
description: "以 MiragEdge 实际 CraftEngine resources 为基准的物品、方块、字体图标、资源包与数据包协同开发指南。"
icon: 🎨
outline: deep
head:
  - - meta
    - name: keywords
      content: "Minecraft, CraftEngine, CE, 资源包, 自定义物品, 字体图标, YAML, AI Skills"
---

# CraftEngine 开发工作流 · AI Skills

> 本页是 MiragEdge 的 CE 开发入口。**实际配置优先于本文示例**：服务器资源拷贝位于 `F:\CraftEngine\resources`，官方文档、源码和 DeepWiki 只用于确认版本差异与未覆盖能力。

## 先记住这 6 条

1. CE 配置的资源根目录是 `plugins/CraftEngine/resources/`；本项目按功能拆成多个 pack，而不是把所有内容塞进一个 `items/` 目录。
2. 每个 pack 有自己的 `pack.yml`，其中 `namespace` 是 CE pack 命名空间，例如 `miragedge_items`、`miragedge_icon`、`miragedge_menu`、`customcrops`。
3. `items:`、`blocks:`、`images:`、`templates:` 是不同注册表，不能混写；配置中的 ID 通常写成 `namespace:id`。
4. `texture:` 和 `model:` 不是一回事：前者通常指向纹理资源，后者指向模型资源；图标字体使用 `images:`，不应伪造一个物品来代替。
5. `texture: minecraft:item/food/bacon` 对应资源包中的 `assets/minecraft/textures/item/food/bacon.png`。`assets/`、`textures/` 和 `.png` 不写进 CE 引用值。
6. 改动后必须同时验证 CE 加载、资源包下载和游戏内显示；只看到 YAML 没报错不等于客户端材质正确。

## 适用边界

| 系统 | CE 负责 | 其他系统负责 |
| --- | --- | --- |
| 自定义物品 | ID、基础材料、`data`、贴图/模型、事件 | 业务插件的复杂逻辑 |
| 自定义方块 | 方块注册、状态、模型、破坏/掉落相关配置 | 数据包的函数、世界生成和结构 |
| 字体图标 | `images:` 注册、字体文件、字符映射 | 菜单/聊天插件决定何时输出字符 |
| 资源包 | `assets/<namespace>/...` 下的 PNG、模型、字体 | 客户端实际下载和缓存 |
| 数据包联动 | CE 物品 ID 作为跨系统数据 | `function`、`loot_table`、`recipe`、`structure` 等 |

与其他工作流的入口：

- [数据包工作流中的 CE 集成](/develop/workflows/datapack-workflow#craftengine-集成指南)
- [自定义作物工作流](/develop/workflows/customcrops-workflow#与-ce-物品的对接)
- [CE 配置样例与真实目录对照](/develop/workflows/ce-reference)
- [CE 自定义盔甲模型与装备纹理](/develop/workflows/ce-armor-workflow)
- [官方 CE 文档](https://ce-pre.gtemc.cn/)
- [CraftEngine 源码仓库](https://github.com/Xiao-MoMi/craft-engine)
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)

## MiragEdge 实际目录

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

服务器拷贝中已经存在的 pack 不是理论目录：`miragedge_items` 的 `pack.yml` namespace 是 `miragedge_items`，`customcrops` 的作物配置则使用 `customcrops:*` ID。新增内容应先选择归属 pack，再决定路径和 ID，禁止默认套用 `miragedge:`。

## 标准五步闭环

### 1. 盘点依赖

先回答：这是物品、方块、字体图标、菜单模型还是作物阶段资源？确认目标 pack、基础材料、客户端版本、是否需要 Java/基岩版兼容，以及现有 ID 是否已经占用。

### 2. 设计 ID 与资源路径

推荐使用小写 `snake_case`：

```text
注册 ID：miragedge_items:star_rod
纹理引用：minecraft:item/rods/star_rod
实际文件：resourcepack/assets/minecraft/textures/item/rods/star_rod.png
```

ID 命名空间和资源命名空间可以不同；必须以实际文件与现有配置为准。路径大小写、下划线、目录层级必须完全一致。

### 3. 编写最小配置

普通物品从 `items:` 开始，只添加本次需求需要的字段。物品显示数据放在 `data:` 中；材质字段放在物品根级。参考真实配置中的 [食物写法](#食物与事件) 和 [模型写法](#模型与装备)。

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

```text
/ce reload
/ce item get <namespace:id> [amount]
/reload                         # 只有同时修改原版数据包时才需要
```

`/ce reload` 的具体子命令随 CE 版本变化；不要把未经当前版本确认的 `/ce reload all`、`/resourcepack reload` 写入自动化脚本。资源包未更新时，先重新加入服务器或在客户端重新加载资源包，再判断材质是否失效。

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

多纹理列表用于具有不同状态/模型的物品（本服务器鱼竿就是这种实际用法），不要擅自改成虚构的 `layers:` 结构。

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

业务命令、条件和函数参数必须以当前 CE 版本文档及服务器已有配置为准；不要从其他插件的事件语法照搬。

### 模型与方块

`model:` 用于模型注册或物品/方块绑定，常见结构是 `type`、`path`、`generation`。模型引用也遵循资源定位规则，例如 `minecraft:block/custom/topaz_ore` 对应 `assets/minecraft/models/block/custom/topaz_ore.json`。

```yaml
items:
  miragedge_items:topaz_ore:
    model: minecraft:block/custom/topaz_ore

blocks:
  miragedge_items:topaz_ore:
    # 方块行为、状态、掉落等字段按当前 CE 文档补齐
```

实际项目还使用 `templates/models.yml`、`templates/block_states.yml` 和 `templates/block_settings.yml`。复杂方块先复用模板，再写单个实例；不要在每个配置文件复制一套模型生成逻辑。

### 字体图标（`images:`）

```yaml
images:
  miragedge_icon:money:
    height: 10
    ascent: 8
    font: minecraft:default
    file: minecraft:font/image/money.png
    chars: ""
```

`file` 对应 `assets/minecraft/textures/font/image/money.png`。`chars` 是实际字符映射，不要假设所有字符都在 U+E000–U+F8FF；服务器现有配置中同时出现了私用区字符和其他 Unicode 字符。新增字符前必须在现有 `icon.yml`、`rank_icom.yml`、菜单配置中查重。

字体图标的使用方式由菜单/聊天插件决定。CE 注册了图标，不代表玩家发送普通文字时会自动显示它。

### 装备与盔甲

装备涉及 `items:`、`templates:`、`model:`、`equipments:` 多个注册表。实际 `miragedge_items/configuration/armor.yml` 同时为 1.21.2+ 使用 `type: component`，为旧版本保留 `type: trim` 分支；这类配置不要删掉版本条件。

```yaml
equipments:
  $$>=1.21.2:
    miragedge_items:winter_helmet_asset:
      type: component
      humanoid: "minecraft:entity/equipment/humanoid/winter_armor"
```

盔甲贴图还涉及 `assets/minecraft/textures/entity/equipment/...`，与背包物品图标的 `textures/item/...` 是两条资源链路，必须分别验收。

## AI 执行清单

收到 CE 改动请求时，按以下顺序工作：

1. 扫描目标 pack 的 `pack.yml`、相关 `configuration` 和 `resourcepack/assets`，确认实际 namespace 与路径。
2. 搜索同类配置，优先复制服务器正在使用的最小模式；先不要引入模板、事件或模型高级字段。
3. 分别列出注册 ID、基础材料、配置路径、资源文件、客户端展示场景和联动插件。
4. 创建/修改配置与资源；YAML 中的中文保持 UTF-8 无 BOM，图片确认是真实 PNG 而非下载到的 HTML 错误页。
5. 检查 ID、路径大小写、资源文件存在性、同名字符冲突、JSON/YAML 语法。
6. `/ce reload` 后获取对象做游戏内验收；记录服务器日志中的首个错误，而不是只看最后一行。
7. 若涉及数据包，额外执行 `/reload` 并参考[数据包 CE 集成章节](/develop/workflows/datapack-workflow#craftengine-集成指南)。

## 故障定位

| 现象 | 优先检查 |
| --- | --- |
| 紫黑方块/材质缺失 | `texture` 或 `model` 路径、大小写、PNG 是否存在、客户端是否拿到新包 |
| 只显示原版物品 | ID/配置文件未加载、`material` 或 `custom-model-data` 不匹配、字段缩进错误 |
| 字体图标为空白 | `images:` 是否加载、`file` 路径、`chars` 是否冲突、调用方是否指定了相同 font |
| 物品能拿到但放置异常 | 物品模型与方块模型混用，或缺少 block state / behavior |
| CE 重载报错 | 查看 `logs/latest.log` 中第一条 CraftEngine 配置错误，回滚最后一个改动再二分 |
| Java 正常、基岩版异常 | 这是跨端转换链路问题，单独检查 Geyser/转换资源包，不要仅凭 Java 资源包结论 |

## 版本与引用原则

- 不在本页硬编码未经验证的 CE 版本号；当前拷贝的 `pack.yml` 版本字段是 pack 版本，不等于插件版本。
- Minecraft `pack_format` 由实际服务端版本决定，不能从旧页面或网上示例复制。
- 官方资料优先级：当前服务器配置和日志 → [CE 官方文档](https://ce-pre.gtemc.cn/) → [源码](https://github.com/Xiao-MoMi/craft-engine) → [DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)。
- DeepWiki 是辅助阅读材料，不是比源码和当前服务器更高的权威来源。

## 相关页面

- [CE 配置参考与实际目录清单](/develop/workflows/ce-reference)
- [CE 自定义盔甲模型与装备纹理](/develop/workflows/ce-armor-workflow)
- [数据包工作流：CraftEngine 集成](/develop/workflows/datapack-workflow#craftengine-集成指南)
- [自定义作物工作流：CraftEngine 资源对接](/develop/workflows/customcrops-workflow#与-ce-物品的对接)
- [旧贴图字符码页面](/develop/server_configs/sticker)
