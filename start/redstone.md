---
title: 生电与特性
description: 锐界幻境 Minecraft 服务器生电与特性说明：服务器配置、红石机制、生电玩法支持情况与相关特性调整。
head:
  - - meta
    - name: keywords
      content: 锐界幻境生电, Minecraft 红石, 生电特性, 红石机制, 服务器特性, 技术性生存
---

# 生电与特性

## 服务器配置

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| **服务端核心** | Leaf 26.2 | 基于 Pufferfish + Gale，性能优化 |
| **Java 环境** | GraalVM 25 LTS | JIT 编译优化，22% 内存节省 |
| **视距** | 随客户端设置 | 最大支持 32 |
| **模拟距离** | 6 | 固定值 |
| **安全种子** |  已启用 | 1024 位种子，无法暴力破解 |

## 反作弊规则

- 不检测方块放置与破坏相关行为（投影打印机宽松）
- 安全种子计算（无法破解）
- 反矿透混淆较宽松

## 实体串门限制

**地狱门实体限制：**

- 每 3 分钟检查 TPS
- TPS < 18 时禁止实体通过地狱门
- TPS > 18 时恢复

> 实体串门对性能的影响真的很大！这能有效避免高峰卡顿，维护全服玩家的游戏体验。

## 特殊修改

- **女巫小屋范围变大**：结构生成修改，小心全怪塔变女巫塔
- **末地群系末影人生成差异**：繁星的末地群系中，仅部分群系会生成末影人。建设小黑塔前请确认群系，详见[末地群系与末影人生成指南](/play/adventure/worlds/stellarity/biomes#末影人生成指南)

## 生电特性列表

###  启用的特性

| 特性 | 配置文件 | 配置项 | 状态 |
|------|----------|--------|------|
| **TNT 复制** | paper-global.yml | allow-piston-duplication |  启用 |
| **地毯复制** | paper-global.yml | allow-piston-duplication |  启用 |
| **铁轨复制** | paper-global.yml | allow-piston-duplication |  启用 |
| **无头活塞** | paper-global.yml | allow-headless-pistons |  启用 |
| **破基岩** | paper-global.yml | allow-permanent-block-break-exploits |  启用 |
| **末地门框架** | paper-global.yml | allow-permanent-block-break-exploits |  启用 |
| **折跃门** | paper-global.yml | allow-permanent-block-break-exploits |  启用 |
| **喷射合成** | server.properties | network-compression-threshold | 256（已调高） |
| **漏斗优化** | leaf-global.yml | use-vanilla-hopper | false（使用优化版） |
| **地狱门区块加载** | paper-global.yml | enable-nether | true |

###  禁用的特性

| 特性 | 原因 | 配置文件 |
|------|------|----------|
| **重力方块复制** | Paper 已彻底修复 | paper-global.yml |
| **虚空交易** | Paper 已彻底修复 | paper-global.yml |
| **光照抑制** | Paper 已彻底修复 | paper-global.yml |
| **末影珍珠滞空** | Paper 已彻底修复 | paper-global.yml |
| **RNG 附魔** | 可预测随机性事件 | paper-global.yml |

## 性能优化（Leaf 特有）

| 优化项 | 配置文件 | 配置项 | 状态 |
|--------|----------|--------|------|
| **异步区块发送** | leaf-global.yml | async-chunk-send |  启用 |
| **DAB 距离 AI** | leaf-global.yml | dab.enabled |  启用 |
| **异步生物生成** | leaf-global.yml | async-mob-spawning |  启用 |
| **异步寻路** | leaf-global.yml | async-pathfinding |  启用 |
| **异步实体追踪** | leaf-global.yml | async-entity-tracker |  启用（实验性） |
| **随机 tick 优化** | leaf-global.yml | optimize-random-tick |  启用 |
| **动力铁轨迭代优化** | leaf-global.yml | optimized-powered-rails |  启用 |
| **睡觉方块实体（锂）** | leaf-global.yml | sleeping-block-entity |  启用 |
| **生物生成收集优化** | leaf-global.yml | optimize-mob-spawning |  启用 |
| **仙人掌生长预检** | leaf-global.yml | check-survival-before-growth.cactus-check-survival |  启用 |
| **生物群系缓存** | leaf-global.yml | cache-biome |  启用 |
| **手上物品 tick 优化** | leaf-global.yml | only-tick-items-in-hand |  启用 |
| **怪物 noActionTime 光照跳过** | leaf-global.yml | optimize-no-action-time.disable-light-check |  启用 |
| **实体移动数据包削减** | leaf-global.yml | reduce-packets.reduce-entity-move-packets |  启用 |
| **实体运动数据包过滤** | leaf-global.yml | reduce-packets.reduce-entity-motion-packets |  启用 |
| **装饰性粒子禁用** | leaf-global.yml | reduce-packets.disable-useless-particles |  启用 |
| **异步连接状态切换** | leaf-global.yml | async-switch-state |  启用 |
| **流体卡顿滞后补偿** | leaf-global.yml | lag-compensation |  启用 |
| **更快随机生成器** | leaf-global.yml | faster-random-generator |  启用 |
| **虚拟线程** | leaf-global.yml | use-virtual-thread |  启用 |
| **爆炸优化** | paper-world-defaults.yml | optimize-explosions |  启用 |

## 生电兼容性调整（Leaf 内核）

> 以下为本次内核调整中可能与生电（技术性生存 / 红石机器）相关的配置项，均位于 `config/leaf-global.yml`。Leaf 以原版行为为目标，以下仅列出可能影响机器、农场运行或生电体验的点。

### 机制类（直接影响机器运行）

| 调整 | 配置项（leaf-global.yml） | 对生电的影响 |
|------|---------------------------|-------------|
| **区块卸载不保存掉落方块与激活 TNT** | `performance.dont-save-entity.dont-save-primed-tnt` / `dont-save-entity.dont-save-falling-block` | 玩家掉线、区块卸载时不再保存激活 TNT 与掉落方块实体——防炸机机制，TNT 复制/炸矿机、飞行器、刷沙机等在掉线时不会被炸毁。代价：区块卸载后这些实体直接消失而非续存，机器需重新启动。 |
| **随机刻系统重写（加权采样）** | `performance.optimize-random-tick` | 在活跃区块中按加权统计 + 采样选择可 tick 的方块，减少原版随机刻频繁选中不可 tick 位置的开销。甘蔗/仙人掌/竹子/树苗/作物等随机刻农场仍按原版频率产出（分布更均匀），整体性能提升。 |
| **动力铁轨迭代重写** | `performance.optimized-powered-rails` | 完全重写动力铁轨迭代逻辑，保持原版行为一致的前提下性能提升约 4 倍。矿车运输线、物品分类/运输系统受益明显。 |
| **睡觉的方块实体（锂风格）** | `performance.sleeping-block-entity` | 漏斗等方块实体空闲时不进行 tick，收到新任务自动唤醒，行为与原版一致。大型漏斗阵列、物品分类机与漏斗驱动的机器卡顿明显减少。 |
| **流体卡顿滞后补偿** | `misc.lag-compensation`（`enable-for-water` / `enable-for-lava`） | 低 TPS / 卡顿时对水流、岩浆流动进行滞后补偿，缓解卡顿对水流搬运、刷石机、刷沙机、TNT 大炮等流体类机器的影响，保证卡顿期间玩家的基本游戏体验。 |

### 农场与生物类（性能提升，行为基本一致）

| 调整 | 配置项（leaf-global.yml） | 对生电的影响 |
|------|---------------------------|-------------|
| **仙人掌生长前存活检查** | `performance.check-survival-before-growth.cactus-check-survival` | 生长前先判断能否生长，跳过无效位置，提升大型仙人掌机性能（产出行为不变）。 |
| **生物生成收集逻辑优化** | `performance.optimize-mob-spawning` | 更高效地收集可生成区块并查找附近玩家，刷怪塔 / 刷怪笼农场性能提升（生成逻辑与原版一致）。 |
| **怪物 noActionTime 跳过光照检测** | `performance.optimize-no-action-time.disable-light-check` | noActionTime 更新时跳过光照等级判断，直接累加计数器。逻辑上不影响生成与寻路，怪物 AI 行为有微调，建议以实测为准。 |
| **生物群系数据缓存** | `performance.cache-biome` | 缓存方块位置的生物群系数据，避免每次查询重新计算。对小黑塔选址等群系判定逻辑无影响，仅提升查询性能。 |
| **更快的世界生成随机生成器** | `performance.faster-random-generator` | 世界生成启用更快的随机生成器。仅影响新生成世界的 RNG（史莱姆区块、结构分布等），对既有世界无影响。 |

### 生电工具向（周边支持）

| 调整 | 配置项（leaf-global.yml） | 对生电的影响 |
|------|---------------------------|-------------|
| **Syncmatica 投影分享协议** | `network.protocol-support.syncmatica-protocol` | 安装 Syncmatica 的玩家可上传 / 下载服务器共享的投影文件，多人生电协作可共享机器图纸（配合反作弊「投影打印机宽松」）。 |
| **Xaero 小地图坐标 / 死亡点存储** | `network.protocol-support.xaero-map-protocol` | 玩家坐标点与死亡点与服务器挂钩存储，更换服务器名 / IP 不清空，方便生电选址与死亡点标记。 |

### 不影响生电行为的调整

雪球击退、击退位置同步、禁用聊天签名、AppleSkin / AsteorBar / ChatImage / Do a Barrel Roll 模组协议、关闭加入退出消息、禁用装饰性粒子、削减 / 过滤实体移动数据包、定位栏路径点优化、移除告示牌警告、服务端名称显示等，均不改变红石与机器逻辑，仅影响 PVP 表现、客户端显示或日常体验。

---

## 配置文件位置

```
/data/config/
├── paper-global.yml          # Paper 全局配置
├── paper-world-defaults.yml  # 世界配置
├── leaf-global.yml           # Leaf 优化配置
└── gale-global.yml           # Gale 配置

/data/
├── server.properties         # 服务器属性
└── bukkit.yml               # Bukkit 配置
```

##  注意事项

1. **TNT 复制**：仅限服务器端，客户端无法使用
2. **破基岩**：需要特定操作，建议先测试
3. **安全种子**：已启用，无法查看原始种子
4. **异步优化**：部分功能为实验性，可能有兼容问题

---

_最后更新：2026-08-28_
_适用版本：Leaf 26.2-155 + GraalVM 25_
