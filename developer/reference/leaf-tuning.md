---
title: Leaf 性能与生电调优
description: 服务器 Leaf/Paper 内核的配置项、生电特性开关与性能优化清单，供服主核对当前配置与排查机器兼容性问题。
outline: [2, 3]
---

# Leaf 性能与生电调优

这页是服务器内核配置的核对清单：生电特性哪些开着、性能优化动了什么、配置文件在哪。

> 最后更新：2026-08-28 ｜ 适用版本：Leaf 26.2-155 + GraalVM 25

## 服务器配置

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| 服务端核心 | Leaf 26.2 | 基于 Pufferfish + Gale |
| Java 环境 | GraalVM 25 LTS | JIT 编译优化，22% 内存节省 |
| 视距 | 随客户端设置 | 最大支持 32 |
| 模拟距离 | 6 | 固定值 |
| 安全种子 | 已启用 | 1024 位种子，无法暴力破解 |

## 反作弊口径

- 不检测方块放置与破坏（投影打印机宽松）
- 安全种子计算，无法破解
- 反矿透混淆较宽松

## 实体串门限制

每 3 分钟检查一次 TPS。TPS 低于 18 时禁止实体通过地狱门，高于 18 时恢复。

原因：实体串门对性能影响很大，限制可避免高峰卡顿。

## 特殊修改

- **女巫小屋范围变大**：结构生成修改，全怪塔可能变成女巫塔
- **末地群系末影人生成差异**：仅部分繁星群系生成末影人，建设小黑塔前须确认群系

## 生电特性开关

### 启用

| 特性 | 配置文件 | 配置项 | 值 |
| --- | --- | --- | --- |
| TNT 复制 | `paper-global.yml` | `allow-piston-duplication` | 启用 |
| 地毯复制 | `paper-global.yml` | `allow-piston-duplication` | 启用 |
| 铁轨复制 | `paper-global.yml` | `allow-piston-duplication` | 启用 |
| 无头活塞 | `paper-global.yml` | `allow-headless-pistons` | 启用 |
| 破基岩 | `paper-global.yml` | `allow-permanent-block-break-exploits` | 启用 |
| 末地门框架 | `paper-global.yml` | `allow-permanent-block-break-exploits` | 启用 |
| 折跃门 | `paper-global.yml` | `allow-permanent-block-break-exploits` | 启用 |
| 喷射合成 | `server.properties` | `network-compression-threshold` | 256（已调高） |
| 漏斗优化 | `leaf-global.yml` | `use-vanilla-hopper` | false（使用优化版） |
| 地狱门区块加载 | `paper-global.yml` | `enable-nether` | true |

### 禁用

| 特性 | 原因 | 配置文件 |
| --- | --- | --- |
| 重力方块复制 | Paper 已彻底修复 | `paper-global.yml` |
| 虚空交易 | Paper 已彻底修复 | `paper-global.yml` |
| 光照抑制 | Paper 已彻底修复 | `paper-global.yml` |
| 末影珍珠滞空 | Paper 已彻底修复 | `paper-global.yml` |
| RNG 附魔 | 可预测随机性事件 | `paper-global.yml` |

## 性能优化（Leaf 特有）

| 优化项 | 配置文件 | 配置项 |
| --- | --- | --- |
| 异步区块发送 | `leaf-global.yml` | `async-chunk-send` |
| DAB 距离 AI | `leaf-global.yml` | `dab.enabled` |
| 异步生物生成 | `leaf-global.yml` | `async-mob-spawning` |
| 异步寻路 | `leaf-global.yml` | `async-pathfinding` |
| 异步实体追踪 | `leaf-global.yml` | `async-entity-tracker`（实验性） |
| 随机 tick 优化 | `leaf-global.yml` | `optimize-random-tick` |
| 动力铁轨迭代优化 | `leaf-global.yml` | `optimized-powered-rails` |
| 睡觉方块实体（锂） | `leaf-global.yml` | `sleeping-block-entity` |
| 生物生成收集优化 | `leaf-global.yml` | `optimize-mob-spawning` |
| 仙人掌生长预检 | `leaf-global.yml` | `check-survival-before-growth.cactus-check-survival` |
| 生物群系缓存 | `leaf-global.yml` | `cache-biome` |
| 手上物品 tick 优化 | `leaf-global.yml` | `only-tick-items-in-hand` |
| 怪物 noActionTime 光照跳过 | `leaf-global.yml` | `optimize-no-action-time.disable-light-check` |
| 实体移动数据包削减 | `leaf-global.yml` | `reduce-packets.reduce-entity-move-packets` |
| 实体运动数据包过滤 | `leaf-global.yml` | `reduce-packets.reduce-entity-motion-packets` |
| 装饰性粒子禁用 | `leaf-global.yml` | `reduce-packets.disable-useless-particles` |
| 异步连接状态切换 | `leaf-global.yml` | `async-switch-state` |
| 流体卡顿滞后补偿 | `leaf-global.yml` | `lag-compensation` |
| 更快随机生成器 | `leaf-global.yml` | `faster-random-generator` |
| 虚拟线程 | `leaf-global.yml` | `use-virtual-thread` |
| 爆炸优化 | `paper-world-defaults.yml` | `optimize-explosions` |

## 可能影响生电的调整

以下调整会影响机器、农场运行，全部位于 `leaf-global.yml`。

### 机制类（直接影响机器）

| 调整 | 配置项 | 影响 |
| --- | --- | --- |
| 区块卸载不保存掉落方块与激活 TNT | `performance.dont-save-entity.dont-save-primed-tnt`、`dont-save-entity.dont-save-falling-block` | 掉线或区块卸载时不再保存激活 TNT 与掉落方块实体。防炸机：TNT 复制、炸矿机、飞行器、刷沙机不会被炸毁。代价：这些实体直接消失而非续存，机器需重新启动 |
| 随机刻系统重写（加权采样） | `performance.optimize-random-tick` | 减少随机刻选中不可 tick 位置的开销。甘蔗、仙人掌、竹子、树苗、作物等农场仍按原版频率产出，分布更均匀 |
| 动力铁轨迭代重写 | `performance.optimized-powered-rails` | 保持原版行为，性能提升约 4 倍。矿车运输线、物品分类与运输系统受益明显 |
| 睡觉的方块实体（锂风格） | `performance.sleeping-block-entity` | 漏斗等方块实体空闲时不 tick，收到任务自动唤醒，行为与原版一致。大型漏斗阵列与物品分类机卡顿减少 |
| 流体卡顿滞后补偿 | `misc.lag-compensation`（`enable-for-water`、`enable-for-lava`） | 低 TPS 时对水流、岩浆流动做滞后补偿，缓解卡顿对刷石机、刷沙机、TNT 大炮的影响 |

### 农场与生物类（性能提升，行为基本一致）

| 调整 | 配置项 | 影响 |
| --- | --- | --- |
| 仙人掌生长前存活检查 | `performance.check-survival-before-growth.cactus-check-survival` | 生长前先判断能否生长，跳过无效位置。产出行为不变 |
| 生物生成收集逻辑优化 | `performance.optimize-mob-spawning` | 更高效地收集可生成区块并查找附近玩家。刷怪塔与刷怪笼农场性能提升，生成逻辑与原版一致 |
| 怪物 noActionTime 跳过光照检测 | `performance.optimize-no-action-time.disable-light-check` | 更新 noActionTime 时跳过光照判断。不影响生成与寻路，怪物 AI 行为有微调，以实测为准 |
| 生物群系数据缓存 | `performance.cache-biome` | 缓存方块位置的群系数据。对小黑塔选址等群系判定无影响，仅提升查询性能 |
| 更快的世界生成随机生成器 | `performance.faster-random-generator` | 仅影响新生成世界的 RNG（史莱姆区块、结构分布），对既有世界无影响 |

### 生电工具支持

| 调整 | 配置项 | 影响 |
| --- | --- | --- |
| Syncmatica 投影分享协议 | `network.protocol-support.syncmatica-protocol` | 安装 Syncmatica 的玩家可上传或下载服务器共享的投影文件，多人生电协作可共享机器图纸 |
| Xaero 小地图坐标与死亡点存储 | `network.protocol-support.xaero-map-protocol` | 玩家坐标点与死亡点与服务器挂钩存储，更换服务器名或 IP 不清空 |

### 不影响生电的调整

雪球击退、击退位置同步、禁用聊天签名、客户端模组协议、关闭加入退出消息、禁用装饰性粒子、削减与过滤实体移动数据包、定位栏路径点优化、移除告示牌警告、服务端名称显示等，均不改变红石与机器逻辑，仅影响 PVP 表现、客户端显示或日常体验。

## 配置文件位置

```
/data/config/
├── paper-global.yml
├── paper-world-defaults.yml
├── leaf-global.yml
└── gale-global.yml

/data/
├── server.properties
└── bukkit.yml
```

## 注意事项

1. **TNT 复制**：仅限服务器端，客户端无法使用
2. **破基岩**：需要特定操作，建议先测试
3. **安全种子**：已启用，无法查看原始种子
4. **异步优化**：部分功能为实验性，可能有兼容问题

## 相关

玩家版（面向玩家的特性启用清单）：`/play/systems/redstone`
