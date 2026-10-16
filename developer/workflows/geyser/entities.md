---
title: 复杂实体与展示
description: 判断 Java 生物、家具与展示实体应走哪条路线。涵盖实体承载方式的判断表、Geyser Entity API 边界与动态属性、基岩版实体资源组成、GeyserDisplayEntity 路线与失败边界。
outline: [2, 3]
---

# 复杂实体与展示

物品转换成功不代表复杂生物和家具也成功。这页给出实体路线判断与重建方法。

Java 的实体模型常由多个来源组合出来。

来源包括数据包、ModelEngine、EliteMobs、BetterModel、盔甲架和技术实体。

基岩版需要自己的文件集合。

它包含 entity definition、geometry、render controller、animation 和材质。

Geyser 只把 Java 侧实体状态翻译过来。它不能把 Java 客户端的渲染规则原样传递。

## 1. 判断实体承载方式

| Java 侧实现 | 基岩版路线 | 自动转换结论 |
| --- | --- | --- |
| 原版实体，仅替换全局贴图 | 覆盖对应基岩版原版实体资源 | 可手工完成，但会影响所有同类型实体 |
| 原版实体加 Java 名称或装备或 CMD 选择模型 | Geyser Entity API 或可识别的客户端状态 | 不要假定名称或 PDC 会自动成为基岩版条件 |
| CEM 或 OptiFine 或 EMF 模型 | 重新制作基岩版 geometry 与 animation | 没有通用的 Geyser JSON 转换路线 |
| ModelEngine 或 EliteMobs 或 BetterModel 生物 | 查明其使用的实体、技术实体和包资源，再分别适配 | 插件名称不能决定兼容性 |
| `item_display` | GeyserDisplayEntity 等社区扩展，或改为自定义实体 | 官方 Geyser 当前不原生支持 Display Entity |
| `block_display` | 手工基岩版实体或方块映射，或第三方扩展 | 复杂旋转、缩放和碰撞需单独设计 |
| `text_display` | 基岩版 text、UI 或实体文字回退 | 不要期待 Java 字体和文字实体自动保留 |
| Java 服务器自定义实体类型 | Geyser Entity API 注册基岩版类型并在生成事件替换 | 需要 Geyser extension 和配套基岩版资源包 |

转换清单中的 `route` 必须写出上表中的具体路线。写「Rainbow 已完成」只能说明物品与方块已导出，不表示实体已完成。

## 2. Geyser Entity API 边界

官方文档当前把 Custom Entity API 标记为实验性。它在 Geyser API 2.11.0（26.2 更新）引入，未来可能改写。`GeyserDefineEntityPropertiesEvent` 虽然更早存在，但从 2.11.0 起使用的是 Bedrock 实体标识符，不是 Java 标识符。

官方路线需要两部分：

1. Geyser extension 在启动期注册基岩版 entity definition，并在 Java 实体生成时选择该 definition。
2. 基岩版资源包提供 `entity/`、`models/entity/`、贴图、动画和渲染控制器。

只放资源包不注册实体，基岩版不会凭文件名自动把某个 Java 僵尸变成自定义实体。只注册扩展不提供资源包，玩家只会看到缺失模型或默认模型。

### 注册定义的最小结构

以下是结构提示。具体 API 包名和方法签名必须以当前 Geyser API 文档与编译结果为准。

```java
public final class MiragEdgeEntities implements Extension {
    private final CustomEntityDefinition boss =
        CustomEntityDefinition.of(Identifier.of("miragedge:boss_alpha"));

    @Subscribe
    public void onDefineEntities(GeyserDefineEntitiesEvent event) {
        event.register(boss);
    }

    @Subscribe
    public void onSpawn(ServerSpawnEntityEvent event) {
        if (isBoss(event)) {
            event.definition(boss);
        }
    }
}
```

约束：

- 自定义实体 identifier 不能使用 `minecraft` namespace，且必须全局唯一。
- definition 要在生成事件之前注册，不要在每次生成时动态创建对象。
- 每个基岩版连接拥有自己的实体缓存。不能用一个连接中的实体对象替代所有玩家的状态。
- JSON mappings 当前不能直接注册这类自定义实体，必须走 API 或 extension。
- 资源包中的 entity identifier、geometry identifier、动画和 controller 名称要与扩展和 `entity/*.entity.json` 一致。

### 选择信号

`ServerSpawnEntityEvent` 能看到 Geyser 翻译链上的实体信息，但它不会自动把 Paper、CE 或数据包的内部状态暴露为可查询字段。

- 不要假定 Java PDC 会自动成为基岩版 Molang property。
- 不要假定名称、Lore 或数据包 tag 可以直接用于扩展的 `isBoss` 判断。
- 需要条件模型时，设计一个明确的桥接信号：专用 Java 实体类型、可读的元数据、扩展能观察的实体状态，或与服务端插件配套的桥接协议。
- 每个桥接信号要有默认、出现、消失、重连、跨区块五类测试。否则实体可能生成时正确、更新后回退。

### 动态实体属性

官方 API 支持把 Java 侧状态暴露为基岩版 Molang 的 `query.property(...)` 可查询属性。属性数量和类型受 API 限制，当前文档要求每个实体类型最多 32 个属性。

把属性当作稳定协议：

```text
miragedge:phase = idle | enraged | dying
miragedge:health_fraction = 0.0 .. 1.0
miragedge:variant = 0 .. N
```

每个属性都要记录 Java 来源、默认值、更新时机和 Molang 使用位置。

还要记录失联时的回退值和性能成本。不要把每 tick 的大量 Java 状态都同步到基岩版。先证明动画确实需要它，再选择事件或低频更新。

## 3. 基岩版资源包的实体组成

复杂生物通常需要：

```text
manifest.json
entity/miragedge_boss.entity.json
models/entity/miragedge_boss.geo.json
textures/entity/miragedge_boss.png
animations/miragedge_boss.animation.json
animation_controllers/miragedge_boss.controller.json
render_controllers/miragedge_boss.render_controller.json
```

具体文件名由基岩版资源包规范与模型工具决定。不能从 Java 的 `assets/<namespace>/models/...` 直接改目录名。至少检查：

- geometry 的 identifier 与 entity definition 引用一致。
- bone 名称、pivot、rotation、scale 与动画 controller 一致。
- UV 坐标和贴图尺寸在基岩版中可见。Java 的 parent 与 UV 语义不能盲拷。
- render controller 中的材质、纹理和 Molang 条件都有默认分支。
- 没有只在 Java 客户端有效的 CEM、OptiFine、Iris shader 或模型谓词文件残留。

### 手工重建建议

1. 从 Java 最终包提取纹理和模型，只把它们当参考输入。
2. 在 Blockbench 或等价工具中建立基岩版 entity 模型，重新校正 pivot、旋转限制、UV 和骨骼层级。
3. 先做静态默认姿态，再加入 idle、walk、attack、hurt、death 等动画。
4. 对每个 animation 与 controller 增加无状态回退，避免属性缺失时整个实体消失。
5. 把 Java 侧变体选择改写为 Geyser extension property 或独立的基岩版 entity definition。
6. 在新加入区块、传送、重连、死亡和实体卸载后重复测试。

::: warning 不要用旧转换工具的行为包输出作为生产方案
`java2bedrock.sh` 可以帮助理解早期 Java 模型转换和 sprite 映射思路，但它的 README 已明确依赖旧基岩版版本、实验开关和客户端行为包。当前 Geyser 资源包路线应以官方 custom content、Rainbow 和目标基岩版规范为准。
:::

## 4. GeyserDisplayEntity 路线

Geyser 官方文档明确说明，Java 的 `item_display` 与 `block_display` 等 Display Entity 仍不是 Geyser 原生支持对象。`GeyserDisplayEntity` 是社区 Geyser extension，README 说明它主要为 Item Display 提供支持，使玩家能看到 Nexo、CraftEngine、ItemsAdder 等物品展示。其 README 还把外部转换器 Kafal 作为生成 mapping 与 resource 的辅助工具。

使用它时必须把风险写进发布记录：

- 它不属于 Geyser 官方项目，问题应先向扩展维护者复现。
- 「能显示 Item Display」不等于 `block_display`、`text_display`、复杂骨骼动画或所有 CE 家具都支持。
- 扩展与转换器的版本必须与 Geyser、基岩版、Java 模型版本一起锁定。
- 需要单独核对缩放、旋转、左右手、视距、区块重载、隐藏技术实体和交互碰撞。
- 扩展输出的 mappings 与资源包不能覆盖 Rainbow 或 CE 的同名资源，要划分文件所有权。

### 最小验收集

| 场景 | 通过条件 |
| --- | --- |
| 初次生成 | 基岩版在实体出现的同一 tick 或随后短时间内看到正确模型 |
| 旋转和缩放 | 与 Java 参考视角一致，没有轴翻转或比例漂移 |
| 区块重载 | 远离再返回、重新加载区块后模型仍存在 |
| 传送与跨维度 | 传送后没有残留旧实体或重复实体 |
| 资源包缓存 | 新 release 能替换旧包，不出现旧贴图 |
| 交互 | 若对象设计为装饰，点击与碰撞行为与 Java 预期一致；不兼容时明确标记为装饰专用 |
| 多对象组合 | 家具由多个 display 或技术实体组成时，所有零件同时出现且相对位置稳定 |

## 5. 数据包复杂生物的处理顺序

看到一个数据包 Boss 时，按以下顺序定位，不要直接说用 Rainbow：

1. 扫描数据包的 function、loot、structure，找出实体生成命令、tag、装备、召唤方式和状态记分板。
2. 扫描最终 Java 资源包的 `entity`、`models`、`textures`、`optifine/cem`、`emf` 和动画目录。
3. 用 Java 测试客户端生成 Boss，观察它是原版实体换贴图、盔甲架组合、Display Entity，还是插件自定义实体。
4. 把逻辑状态与视觉载体分开记录。例如函数负责阶段、模型由 `item_display` 承载、音效由 `sounds.json` 提供。
5. 对每个视觉载体选择路线：Rainbow item 或 block、手工基岩版 entity、Geyser Entity API、GeyserDisplayEntity，或仅 Java。
6. 先完成一个最小静态默认姿态，再逐一添加攻击、受伤和阶段动画。每次只增加一个状态。
7. 把基岩版侧缺失能力写入 `coverage.json`，并给玩家可接受的回退：原版实体、2D 图标、无动画装饰，或仅 Java。

### 逻辑与视觉分开评估

数据包可以继续在 Java 服务端运行，即使基岩版只得到简化模型。转换的最小成功标准应拆成四条：

```text
Java 逻辑继续触发
  + Java 玩家视觉不回归
  + 基岩版玩家看到明确的可接受表示
  + 不会因基岩版资源包加载失败导致 Geyser 登录失败
```

若一个 Boss 的攻击依赖 Java 函数，基岩版只需要正确看到阶段和伤害反馈。不要把函数搬进一个未经验证的基岩版行为包。

## 6. 发布结构

复杂实体不要把这些文件散落在服务器目录。它们包括扩展 JAR、实体包和 Rainbow 普通物品输出。

建议在 release 中保留：

```text
entities/<release-id>/
├── extension/
│   └── miragedge-geyser-entities-<version>.jar
├── pack/
│   └── miragedge-entities-<release-id>.zip
├── source/
│   ├── geometry/
│   ├── animations/
│   └── bridge-contract.yml
├── report.md
└── coverage.json
```

`bridge-contract.yml` 记录 Java entity signal、Bedrock identifier、property、默认值和扩展版本。更新扩展时同时更新资源包，不允许只换 JAR 不换包，或反过来。

## 7. 失败边界

以下情况应直接标记为 `manual`、`unsupported` 或 `java-only`，不要伪造自动转换成功：

- Java 模型依赖 shader、透明排序、光照或基岩版没有等价物。
- CEM 或 EMF 根据名称、装备、NBT、距离和视角组合出大量条件分支，且没有稳定桥接信号。
- 一个家具使用多个 display entity、隐形实体、碰撞实体和客户端包逻辑，转换后缺任一零件都会错位。
- 动画需要 Java 客户端私有的骨骼或渲染器能力。
- 资源包只提供贴图，没有可重建的 geometry 和 animation 信息。
- Geyser Entity API 版本与服务器当前 build 不兼容，或扩展无法在目标平台启动。

::: warning 两个交付等级必须分开
交付有两个等级：基岩版看到一个模型，以及基岩版获得完整的生物功能。

两者必须在文档和验收记录中分开。
:::
