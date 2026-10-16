---
title: 验收与排错
description: Geyser 发布的四层验收模型与故障定位。涵盖静态资源、启动、Java 回归、基岩版实机四层证明范围、coverage.json 记录、实机验收矩阵、常见故障定位表与失败报告格式。
outline: [2, 3]
---

# 验收与排错

Java 端、JSON、ZIP 或 Geyser 启动日志只能证明对应层级没有明显错误。基岩版兼容必须在目标客户端下载当前 Geyser 资源包后完成场景测试。

## 四层验收模型

| 层级 | 证明什么 | 不能证明什么 |
| --- | --- | --- |
| 静态资源 | JSON、YAML、ZIP、路径、唯一 ID、manifest 和 SHA 正确 | Geyser 是否注册、基岩版是否渲染、实体动画是否正确 |
| Geyser 启动 | mappings、pack、extension 被发现并解析 | 资源包是否被客户端接受、模型是否在所有场景出现 |
| Java 回归 | CE、数据包、外部插件和 Java 资源包仍正常 | 基岩版视觉、基岩版缓存、基岩版输入与 UI |
| 基岩版实机 | 目标客户端实际下载、渲染和交互 | 其他未测试版本、生产高并发性能、未来 Geyser 更新 |

::: warning 四层状态必须分别记录
发布记录中分别填写四层状态。`static: pass` 不能被摘要成 `bedrock: pass`。
:::

## 覆盖记录

用一份结构化 `coverage.json` 把预期内容与转换器实际输出分离：

```yaml
release: 2026-07-31-r01
static: pass
geyser_startup: pending
java_regression: pending
bedrock_live: pending
items:
  - id: miragedge_items:star_rod
    java_base: minecraft:fishing_rod
    java_model: "已从 Rainbow report 确认"
    mapping: mapped
    pack_asset: mapped
    scenes:
      inventory: pending
      first_person: pending
      third_person: pending
      dropped: pending
      fishing_rod_cast: pending
    notes: ""
blocks:
  - id: customcrops:chinese_cabbage_stage_3
    mapping: manual
    scenes:
      placed: pending
      break: pending
      collision: pending
      chunk_reload: pending
    notes: "确认 CE serverside block 与状态覆盖方式"
entities:
  - id: datapack:boss_alpha
    route: geyser-extension
    mapping: manual
    scenes:
      spawn: pending
      phase_change: pending
      attack: pending
      death: pending
      teleport: pending
    notes: "Custom Entity API 实验性"
known_gaps:
  - id: example:cem_variant
    status: java-only
    reason: "没有稳定的基岩版 entity 条件和动画等价物"
```

同一物品有多种状态时，所有状态都必须列出场景。只测试背包图标不能把持有、放置、装备、掉落和动画状态标为通过。

## 静态验收

### 输入包

- CE 未保护最终包存在，时间和 SHA 与发布记录一致。
- ZIP 根目录直接包含 `pack.mcmeta` 与 `assets`，没有意外的外层目录。
- 外部目录与 ZIP 的所有必需输入都存在，版本与 SHA 已记录。
- CE 生成日志没有被忽略的合并、父模型、图集、字体、声音或缺纹理错误。
- 数据包伴随资源包的逻辑来源仍能对应到最终资源路径。

### 映射

- 所有 mapping JSON 可被解析，`format_version` 与目标 Geyser 文档一致。
- v2 item mapping 的 Java 基础物品与 `model` 或 legacy CMD 来自实际物品或 Rainbow 报告。
- 每个 `bedrock_identifier` 不会对应两个不同的 Bedrock-facing 定义，且不在 `minecraft` namespace。相同图标与组件可跨不同 Java 基础物品显式复用，但必须记录该共享关系。
- `icon` shorthand 在基岩版 `item_texture.json` 中存在。
- 谓词的 property、index、threshold 和策略与实际 Java 状态一致。
- 不重复注册同一 Java item 加 item model 的无条件定义。
- components 只包含需要预定义的基岩版行为，不把动态 Java 状态伪装成静态组件。
- block mapping 的原始 Java state、geometry、material、碰撞和 state override 来源可追踪。

### 基岩版资源包

- `manifest.json` 可解析，header 与 module UUID 有效且不与其他活动包冲突。
- 有 item mapping 时存在 `textures/item_texture.json`。attachables、`models/entity`、`entity`、animations 只在对应 3D 物品或实体输出确实需要时检查。
- 所有纹理路径大小写与文件名一致，没有把 HTML 错误页当 PNG。
- 3D 模型的 geometry、attachable、GUI 图标和动画引用互相存在。
- 包内没有 Java 的 `assets/`、`pack.mcmeta`、行为包或旧转换器残留文件。
- 包的 SHA-256、文件大小和 release ID 已记录。

### 资源包冲突

- Geyser 活动 `packs/` 只保留本项目当前活动包和其他明确拥有者的包。
- 同名 texture、attachable、model 没有由多个项目隐式争抢。
- `custom-skulls.yml` 使用结构化合并，保留原有玩家、UUID、profile、skin hash 条目。
- locales 覆盖没有覆盖其他插件的同语言键，或覆盖原因已记录。

## Geyser 启动验收

确认 `gameplay.enable-custom-content: true` 后重启 Geyser 或服务器。采集从启动到首个基岩版登录期间的日志，不只看最后一行。

重点查找：

- 自定义 mapping 文件被发现、解析并注册。
- 基岩版包被读取，manifest、texture、attachable 和 entity 文件没有解析错误。
- extension JAR 版本、API 版本和资源包版本相互匹配。
- custom skulls 读取成功，没有 YAML 解析错误或重复条目。
- locales 覆盖被加载，没有因非法 JSON 或语言键导致整个包被跳过。
- 服务器没有因基岩版玩家连接触发重复注册、线程异常或实体缓存异常。

::: warning 日志无错误但客户端没下载新包
先核对 Geyser 实际 data folder 和 `packs/` 路径，再查客户端资源包缓存。不要先修改 mappings。
:::

## Java 回归验收

在同一 release 的 Java 客户端和服务器上至少回归：

| 类别 | 测试 |
| --- | --- |
| CE 物品 | 用当前 CE 的真实获取方式取物品，检查堆叠、名称、Lore、耐久、食用与使用 |
| 数据包 | `/reload` 后函数、配方、战利品、进度和结构仍加载 |
| 外部插件 | ModelEngine、EliteMobs、BetterModel、名称牌、家具或模型包的代表对象 |
| 资源包 | Java 客户端接收同批次主包，模型、纹理、声音和字体无回归 |
| 方块 | 放置、破坏、碰撞、光照、朝向、含水和区块重载 |
| 装备 | 物品栏图标与穿戴模型分别测试，包含四个槽位与鞘翅 |
| 实体 | 生成、状态、攻击、死亡、传送、卸载和重新进入区块 |

::: danger 数据包逻辑通过但资源包被重新生成
必须重新计算输入 SHA 并启动新的 release。不能复用旧 Rainbow 输出。
:::

## 基岩版实机验收矩阵

### 物品

- 背包图标和搜索与分类是否正确。
- 第一人称手持的尺寸、旋转、透明度和发光。
- 第三人称主手与副手模型，工具是否按预期显示 handheld。
- 掉落物、漏斗、箱子、村民交易、创造物品栏和展示框。
- 堆叠、耐久、损坏、附魔光、冷却、食用动画与真实组件。
- 鱼竿收竿与抛竿、弓弩蓄力、盾牌、盔甲和鞘翅状态。
- 配方书是否显示自定义产物。若使用 recipe output，检查 `creative_category` 是否已设置。

### 方块与家具

- 放置位置、朝向、碰撞盒、选择盒和破坏工具提示。
- 自定义光照、透明与半透明材质、面明暗和水中表现。
- 连接状态、成长阶段、红石、活塞、含水等动态状态。
- 远离区块再回来、传送跨维度、服务器重启后是否仍渲染。
- 家具多个组成实体的相对位置、旋转、隐藏技术实体和交互碰撞。

### 实体

- 首次生成、已有实体进入视野和新加入区块。
- idle、walk、attack、hurt、death 及阶段属性变化。
- 名称、血条、粒子、声音和乘骑与交互行为。
- 传送、跨维度、区块卸载与加载、玩家重连和服务器重启。
- 同类普通实体是否被错误套用自定义贴图。
- 多人同时观察时是否出现实体 ID、状态或资源包缓存串扰。

用干净基岩版 profile 和已有缓存 profile 各测一次。缓存 profile 能暴露一个常见问题：版本号、manifest UUID 或包文件名未变化，旧资源继续生效。

## 常见故障定位

| 症状 | 优先检查 | 不要先做 |
| --- | --- | --- |
| 所有自定义物品都是原版图标 | Geyser 的 `enable-custom-content`、mapping 是否加载、Java base 与 model 是否真实 | 不要直接改 PNG 或把 CE ID 写成 mapping key |
| 只有某个菜单物品缺失 | 该物品是否实际打开过或手持过，是否覆盖原版 item model | 不要只跑一次 `mapinventory` 就判定 Rainbow 有漏洞 |
| 图标正确但手持是紫黑或默认 | `icon`、attachable、geometry、handheld、第一与第三人称引用 | 不要删除 3D 目录来「回退」为成功 |
| 2D 正常但 3D 平面化 | Java parent、display transform、多纹理或动画不在 Rainbow 支持范围 | 不要把旧 java2bedrock 行为包直接上线 |
| 方块能拿到但世界中缺失 | block state override、真实 CE serverside block ID、geometry 与 material mapping | 不要假定所有 CE 方块都是同一个原版替代块 |
| 生物默认模型正确但 Boss 模型错误 | Java 实体变体没有可靠桥接信号，或 extension 未替换 definition | 不要用全局基岩版原版贴图覆盖所有同类实体 |
| Display Entity 完全不可见 | Geyser 原生不支持，GeyserDisplayEntity 或转换器未加载或版本不符 | 不要把它归入 Rainbow item mapping |
| 语言存在但字体图标空白 | Java 字体 glyph 与基岩版 UI 不等价，locale 不能生成字体 | 不要覆盖 `item_texture.json` 解决字体问题 |
| Java 包更新后基岩版不变 | Geyser 包、manifest UUID、客户端缓存和重启顺序 | 不要反复修改同一个 ZIP 而不换 release ID |
| 远程包下载失败 | Content-Length、Content-Type、最终重定向、鉴权 HTML | 不要把网页 URL 当直接 ZIP URL |
| 服务器启动成功但部分物品错 | Geyser 会忽略单个未知或冲突定义，查看完整启动日志和 report | 不要因没有全局异常就标记全部 item 通过 |

## 失败报告格式

给用户或下一个 AI 的报告必须包含：

```text
Release: 2026-07-31-r01
Input Java pack SHA256: ...
Geyser/Rainbow/Bedrock versions: ...

Static: pass/fail + evidence
Geyser startup: pass/fail + first error line
Java regression: pass/fail + tested scenarios
Bedrock live: pass/fail + client/device/version

Mapped:
- ...
Manual:
- ...
Unsupported or Java-only:
- ...
Known regressions:
- ...
Rollback release:
- ...
```

不要用「看起来正常」「大部分可用」「应该兼容」作为状态。每个失败项要写复现入口和下一个动作。每个未测试项写 `pending`，不要填 `pass`。

## 版本升级回归

出现以下任一变化时，重新跑至少一轮完整流程：

- Minecraft Java 或基岩版主版本、pack format 变化。
- Geyser API、custom content schema 或 custom entity API 变化。
- Rainbow 版本变化。
- CE 的 `client-bound-model`、CMD 起始值、合并冲突、保护与图集与优化设置变化。
- 新增或替换外部目录与 ZIP，或 ModelEngine、EliteMobs、BetterModel 版本变化。
- Java 资源包新增 `items/` item model、实体动画、字体、atlas 或声音冲突。
- 服务器从纯 Java 物品改成真实 CE serverside block、家具或 Display Entity。

可信 Java 基线建立后，普通物品、贴图、声音或语言的新增与修改默认走增量采集。Bridge 只列出 SHA 改变的 Java 资产，再把新 Rainbow 输出合并进来。

合并目标是受管映射和单一基岩版包。

以下任一情况出现时，才升级为完整重新采集：

- Minecraft、Geyser、Rainbow 主版本变化。
- CE 合并顺序或保护策略变化。
- 外部包替换。
- Java 输入出现大范围删改。
- 复杂实体与 Display 路线变化。

每次 Rainbow 输出仍必须使用新的 release 目录，不能覆盖旧 release。
