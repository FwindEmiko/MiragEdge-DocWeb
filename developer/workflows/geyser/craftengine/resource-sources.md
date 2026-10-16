---
title: CE 内容设计规则与清单
description: CraftEngine 侧的设计规则与上线前检查清单。涵盖方块与家具与真实服务器状态、盔甲装备与鞘翅的两条链路、字体菜单与图集限制，以及常见错误的根因方向。
outline: [2, 3]
---

# CE 内容设计规则与清单

这页给出 CE 侧必须满足的设计约束，以及转换前要逐项核对的清单。

资源来源与合并冲突见 [CE 与合并资源包](./)。转换流程见 [转换与发布](../conversion/)。

## 1. CE 方块与家具

当前配置：

```yaml
block:
  serverside-blocks: 2000
  sound-system:
    enable: true

furniture:
  hide-base-entity: true
```

这意味着方块和家具可能涉及四类系统：

1. 服务器端注册 ID。
2. 技术实体。
3. 碰撞与交互实体。
4. 光照与声音。转换路线必须拆开：

- 普通「方块状态覆盖加 Java block model」可先用 Rainbow 的自动或手工方块映射。
- CE 服务器端真实方块必须从实际放置世界、区块和 Geyser 报告确认 Java 状态。不能假定它是 `note_block`、`tripwire` 或其他原版替代物。
- 家具的可见模型若由 `item_display`、`block_display`、盔甲架或技术实体承载，应转到[复杂数据包实体与展示](../entities)，不能当成普通方块的映射。
- `sound-system` 解决 Java 客户端声音体验，不会自动把声音事件变成基岩版 sound definition。Rainbow 仍需扫描并实测。
- `hide-base-entity` 隐藏的是 CE 内部跟踪实体。不要据此认为基岩版客户端会自动获得同样的模型和碰撞。

## 2. 盔甲、装备与鞘翅

物品栏图标和穿戴模型是两条链：

```text
CE items.texture 或 model
  → Java 物品栏、手持、掉落物

CE equipment 与 asset-id 与 humanoid
  → Java 装备渲染与实体贴图
```

转换时至少分四个测试：头盔、胸甲、护腿、靴子。另加鞘翅的飞行状态。

Rainbow 可以分析简单的 `equippable` 和装备资产，但自定义鞘翅在基岩版侧目前只能把视觉显示作为通过条件，不能假定 Java 侧的所有装备行为都被迁移。

CE 1.21.2 以上的 component 装备与旧版本 trim 分支不能凭教程删除。转换器只应读取最终 Java 包和真实装备组件。若 `report.txt` 没有生成装备 attachable 或 UV 异常，标记为人工处理，不要强行补图。

CE 侧的完整盔甲纹理方法见 [CE 自定义盔甲与装备纹理](../../craftengine/armor)。

## 3. 字体、菜单与图集

CE 可能合并 `font/default.json`、`font/uniform.json`、图标字体和菜单图片。Java 字体 glyph 与基岩版 UI 不是同一格式：

- CE `images:` 的字符映射可以继续服务 Java 客户端。
- Geyser 语言覆盖只能解决文本翻译，不能把 Java 字体 glyph 变成基岩版菜单布局。
- 菜单按钮的 Java slot、字体宽度和基岩版 UI 控件位置不能靠资源包转换器自动等价。
- 对关键菜单应提供基岩版可读的文字或物品图标回退，并把点击、翻页和关闭动作列入实机测试。
- 资源包被 CE 合并或图集优化后，转换器必须读取最终 atlas。不要手工用某个外部包的 `item_texture.json` 覆盖 Rainbow 产物。

## 4. 上线前检查清单

新增 CE 内容前先完成：

- 物品有稳定的基础 Java material。
- 在同一基础 Java material 内，视觉 identity 的 `item_model` 或 CMD 稳定且不冲突，不依赖名称、Lore 或 PDC。
- 状态切换能在 Java 测试客户端实际观察到，并已写入清单。
- 资源路径的大小写、namespace、父模型和纹理全部存在。
- 需要放置、装备、食用、充能的行为由 CE 与 Java 逻辑实现。Bedrock mapping 只登记可预定义的组件。
- 复杂模型没有被 CE 保护或混淆输出遮蔽，转换使用同批次未保护副本。
- 外部目录和 ZIP 已加入合并清单，且来源 SHA 可追踪。
- 真实方块、家具、技术实体和 Display Entity 已标记独立路线。
- 变更后重新生成 CE 最终包，而不是复用旧的 `resource_pack_unprotected.zip`。
- Java 端通过后才运行 Rainbow。Rainbow 通过后再做 Geyser 与基岩版测试。

## 5. 常见错误

| 现象 | 根因方向 | 正确处理 |
| --- | --- | --- |
| Rainbow 生成包缺少数据包物品 | 只转换了 CE 自建 pack | 使用 CE 最终未保护合并包，并从配方、奖励、菜单收集真实物品 |
| Java 正常但基岩版只有原版图标 | mapping 的基础物品或 `model` 值错误 | 从真实物品栈和 Rainbow 报告核对，不要从 PNG 路径猜 |
| 3D 模型变成平面图 | Java 模型的父级、display transform、多纹理或动画超出 Rainbow 范围 | 标记为人工基岩版 geometry 或 attachable，保留 2D GUI 回退 |
| 外部生物包整体缺失 | 被当作独立 ZIP 忽略，或模型由技术实体承载 | 检查 CE merge 输入，按实体与 Display 路线处理 |
| 受保护包能给 Java 但转换器报路径或 JSON 错 | 保护、混淆、图集和 JSON 转义介入 | 使用同批次 `resource_pack_unprotected.zip` |
| CE 重载后 Java 包变了但基岩版仍是旧模型 | Geyser 包与 Java 包是独立缓存 | 生成新 release，更新 Geyser 包与映射，重启并清理基岩版资源包缓存 |
