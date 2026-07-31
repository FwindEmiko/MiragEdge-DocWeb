---
title: "Geyser 工作流 · 复杂数据包实体与展示"
description: "判断 Java 生物模型、CEM/EMF、Display Entity、家具和自定义实体应走 Bedrock 重建、Geyser Entity API 还是社区扩展。"
outline: deep
---

# 复杂数据包实体与展示

物品转换成功，不代表复杂生物和家具也成功。Java 的实体模型常由数据包、ModelEngine、EliteMobs、BetterModel、Armor Stand、Display Entity 或多个技术实体组合出来；Bedrock 需要自己的 entity definition、geometry、render controller、animation 和材质文件。Geyser 只负责把 Java 侧实体状态翻译给 Bedrock，不能把 Java 客户端渲染规则原样传过去。

## 1. 先判断实体承载方式

| Java 侧实现 | Bedrock 路线 | 自动转换结论 |
| --- | --- | --- |
| 原版实体，仅替换全局贴图 | 覆盖对应 Bedrock 原版实体资源 | 可手工完成，但会影响所有同类型实体。 |
| 原版实体 + Java 名称/装备/CMD 选择模型 | Geyser Entity API 或可识别的客户端状态 | 不要假定名称/PDC 会自动成为 Bedrock 条件。 |
| CEM/OptiFine/EMF 模型 | 重新制作 Bedrock geometry/animation | 没有通用 Geyser JSON 转换路线。 |
| ModelEngine/EliteMobs/BetterModel 生物 | 查明其使用的实体、技术实体和包资源，再分别适配 | 插件名称不能决定兼容性。 |
| `item_display` | GeyserDisplayEntity 等社区扩展，或改为自定义实体 | 官方 Geyser 当前不原生支持 Display Entity。 |
| `block_display` | 手工 Bedrock 实体/方块映射或第三方扩展 | 复杂旋转、缩放和碰撞需单独设计。 |
| `text_display` | Bedrock text/UI/实体文字回退 | 不要期待 Java 字体和文字实体自动保留。 |
| Java 服务器自定义实体类型 | Geyser Entity API 注册 Bedrock 类型并在生成事件替换 | 需要 Geyser extension 和配套 Bedrock RP。 |

转换清单的 `route` 必须写出上表中的具体路线。写成“Rainbow 已完成”只能说明物品/方块等已导出，不表示实体已完成。

## 2. 官方 Geyser Entity API 边界

官方文档当前将 Custom Entity API 标记为实验性。它在 Geyser API 2.11.0（26.2 更新）引入，未来可能改写；`GeyserDefineEntityPropertiesEvent` 虽然更早存在，但在 2.11.0 起使用的是 **Bedrock 实体标识符**，不是 Java 标识符。

官方路线需要两部分：

1. Geyser extension 在启动期注册 Bedrock entity definition，并在 Java 实体生成时选择该 definition。
2. Bedrock resource pack 提供 `entity/`、`models/entity/`、贴图、动画和渲染控制器。

只放资源包不注册实体，Bedrock 不会凭文件名自动把某个 Java zombie 变成自定义实体；只注册扩展不提供资源包，玩家也只会看到缺失模型或默认模型。

### 注册定义的最小结构

以下是给 AI 的结构提示，具体 API 包名和方法签名必须以当前 Geyser API Javadoc/编译结果为准：

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
- definition 要在生成事件之前注册；不要在每次生成时动态创建对象。
- 每个 Bedrock 连接拥有自己的实体缓存；不能用一个连接中的实体对象替代所有玩家的状态。
- JSON mappings 当前不能直接注册这类自定义实体；必须走 API/extension。
- 资源包中的 entity identifier、geometry identifier、动画和 controller 名称要与扩展和 `entity/*.entity.json` 一致。

### Java 实体与 Bedrock 实体的选择信号

`ServerSpawnEntityEvent` 能看到 Geyser 翻译链上的实体信息，但它不会自动把所有 Paper/CE/数据包内部状态暴露为可查询字段。特别是：

- 不要假定 Java PDC 会自动成为 Bedrock Molang property。
- 不要假定名称、Lore 或数据包 tag 可以直接用于 Geyser extension 的 `isBoss` 判断。
- 需要条件模型时，设计一个明确的桥接信号：专用 Java 实体类型、可读的元数据、Geyser extension 能观察的实体状态，或与服务端插件配套的桥接协议。
- 每个桥接信号要有“默认、出现、消失、重连、跨区块”测试，否则实体可能生成时正确、更新后回退。

### 动态实体属性

官方 API 支持将 Java 侧状态暴露为 Bedrock Molang `query.property(...)` 可查询的属性。属性数量和类型受 API 限制；当前文档要求每个实体类型最多 32 个属性，枚举和名称也有额外限制。

设计时把属性当作稳定协议：

```text
miragedge:phase = idle | enraged | dying
miragedge:health_fraction = 0.0 .. 1.0
miragedge:variant = 0 .. N
```

每个属性都要记录：Java 来源、默认值、更新时机、Molang 使用位置、失联时的回退值和性能成本。不要把每 tick 的大量 Java 状态都同步到 Bedrock；先证明动画确实需要它，再选择事件或低频更新。

## 3. Bedrock 资源包的实体组成

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

具体文件名由 Bedrock 资源包规范与模型工具决定，不能从 Java `assets/<namespace>/models/...` 直接改目录名。至少检查：

- geometry 的 identifier 与 entity definition 引用一致。
- bone 名称、pivot、rotation、scale 与动画 controller 一致。
- UV 坐标和贴图尺寸在 Bedrock 中可见；Java 的 parent/UV 语义不能盲拷。
- render controller 中的材质、纹理和 Molang 条件都有默认分支。
- 没有只在 Java 客户端有效的 CEM、OptiFine、Iris shader 或模型 predicate 文件残留。

### Java 到 Bedrock 的手工重建建议

1. 从 Java 最终包提取纹理和模型，只把它们当参考输入。
2. 在 Blockbench 或等价工具中建立 Bedrock entity 模型，重新校正 pivot、旋转限制、UV 和骨骼层级。
3. 先做静态默认姿态，再加入 idle、walk、attack、hurt、death 等动画。
4. 对每个 animation/controller 增加无状态回退，避免属性缺失时整个实体消失。
5. 将 Java 侧变体选择改写为 Geyser extension property 或独立 Bedrock entity definition。
6. 在新加入区块、传送、重连、死亡和实体卸载后重复测试。

不要用 `java2bedrock.sh` 的旧行为包输出作为 Geyser 生产方案。它可以帮助理解早期 Java 模型转换和 sprite 映射思路，但其 README 已明确依赖旧 Bedrock 版本、实验开关和客户端行为包；当前 Geyser 资源包路线应以官方 custom content、Rainbow 和目标 Bedrock 规范为准。

## 4. GeyserDisplayEntity 路线

Geyser 官方当前文档明确说明，Java `item_display`/`block_display` 等 Display Entity 仍不是 Geyser 原生支持对象。`GeyserDisplayEntity` 是社区 Geyser extension，README 说明它主要为 Item Display 提供支持，使玩家能看到 Nexo、CraftEngine、ItemsAdder 等物品展示；其 README 还将一个外部 converter（Kafal）作为生成 mapping/resource 的辅助工具。

使用它时必须把风险写进发布记录：

- 它不属于 Geyser 官方项目，问题应先向扩展维护者复现。
- “能显示 Item Display”不等于 `block_display`、`text_display`、复杂骨骼动画或所有 CE 家具都支持。
- 扩展和 converter 的版本必须与 Geyser/Bedrock/Java 模型版本一起锁定。
- 需要单独核对缩放、旋转、左右手、视距、区块重载、隐藏技术实体和交互碰撞。
- 扩展输出的 mappings/resource pack 不能覆盖 Rainbow/CE 的同名资源；要划分文件所有权。

### Display Entity 最小验收集

| 场景 | 通过条件 |
| --- | --- |
| 初次生成 | Bedrock 在实体出现的同一 tick/随后短时间看到正确模型。 |
| 旋转和缩放 | 与 Java 参考视角一致，没有轴翻转或比例漂移。 |
| 区块重载 | 远离再返回、重新加载区块后模型仍存在。 |
| 传送/跨维度 | 传送后没有残留旧实体或重复实体。 |
| 资源包缓存 | 新 release 能替换旧 pack，不出现旧贴图。 |
| 交互 | 若对象设计为装饰，点击/碰撞行为与 Java 预期一致；不兼容时明确标记装饰-only。 |
| 多对象组合 | 家具由多个 display/技术实体组成时，所有零件同时出现且相对位置稳定。 |

## 5. 数据包复杂生物的处理算法

当 AI 看到一个“数据包 Boss”时，按以下顺序定位，而不是直接说“用 Rainbow”：

1. 扫描数据包 function/loot/structure，找出实体生成命令、tag、装备、召唤方式和状态记分板。
2. 扫描最终 Java 资源包的 `entity`、`models`、`textures`、`optifine/cem`、`emf` 和动画目录。
3. 用 Java 测试客户端生成 Boss，观察它是原版实体换贴图、Armor Stand 组合、Display Entity，还是插件自定义实体。
4. 将逻辑状态与视觉载体分开记录：例如“函数负责 phase”“模型由 item_display 承载”“音效由 sounds.json 提供”。
5. 对每个视觉载体选择路线：Rainbow item/block、手工 Bedrock entity、Geyser Entity API、GeyserDisplayEntity 或 Java-only。
6. 先完成一个最小静态默认姿态，再逐一添加攻击/受伤/阶段动画。每次只增加一个状态，避免无法定位的全量重写。
7. 将 Bedrock 侧缺失能力写入 `coverage.yml`，并给玩家可接受的回退（原版实体、2D 图标、无动画装饰或 Java-only）。

### 不要混淆逻辑与视觉

数据包可以继续在 Java 服务端运行，哪怕 Bedrock 只得到简化模型。转换的最小成功标准应拆成：

```text
Java 逻辑继续触发
  + Java 玩家视觉不回归
  + Bedrock 玩家看到明确的可接受表示
  + 不会因 Bedrock 资源包加载失败导致 Geyser 登录失败
```

若一个 Boss 的攻击依赖 Java 函数，Bedrock 只需要正确看到阶段和伤害反馈，不应把函数搬进一个未经验证的 Bedrock behavior pack。

## 6. 实体扩展的发布结构

复杂实体不要把扩展 jar、实体 pack 和 Rainbow 普通物品输出散落在服务器目录。建议在 release 中保留：

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
└── coverage.yml
```

`bridge-contract.yml` 记录 Java entity signal、Bedrock identifier、property、默认值和扩展版本。更新扩展时同时更新资源包；不允许“只换 jar 不换 pack”或反过来。

## 7. 实体路线的失败边界

以下情况应直接标记为 `manual`、`unsupported` 或 `java-only`，不要让 AI 伪造“自动转换成功”：

- Java 模型依赖 shader、透明排序、光照或 Bedrock 没有等价物。
- CEM/EMF 根据名称、装备、NBT、距离和视角组合出大量条件分支，且没有稳定桥接信号。
- 一个家具使用多个 display entity、隐形实体、碰撞实体和客户端包逻辑，转换后缺任一零件都会错位。
- 动画需要 Java 客户端私有的骨骼/渲染器能力。
- 资源包只提供贴图，没有可重建的 geometry/animation 信息。
- Geyser Entity API 版本与服务器当前 build 不兼容，或扩展无法在目标平台启动。

“Bedrock 看到一个模型”与“Bedrock 获得 Java 的完整生物功能”是两个不同交付等级，必须在文档和验收记录中分开。

