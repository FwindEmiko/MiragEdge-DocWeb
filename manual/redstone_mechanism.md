# 生电与特性

## 服务器配置

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| **服务端核心** | Leaf 1.21.11 | 基于 Pufferfish + Gale，性能优化 |
| **Java 环境** | GraalVM 25 LTS | JIT 编译优化，22% 内存节省 |
| **视距** | 随客户端设置 | 最大支持 32 |
| **模拟距离** | 6 | 固定值 |
| **安全种子** | <MapIcon name="check" :size="24" /> 已启用 | 1024 位种子，无法暴力破解 |

## 反作弊规则

- <MapIcon name="check" :size="24" /> 不检测方块放置与破坏相关行为（投影打印机宽松）
- <MapIcon name="check" :size="24" /> 安全种子计算（无法破解）
- <MapIcon name="check" :size="24" /> 反矿透混淆较宽松

## 实体串门限制

**地狱门实体限制：**

- 每 3 分钟检查 TPS
- TPS < 18 时禁止实体通过地狱门
- TPS > 18 时恢复

> <MapIcon name="lightbulb" :size="24" /> 实体串门对性能的影响真的很大！这能有效避免高峰卡顿，维护全服玩家的游戏体验。

## 特殊修改

- **女巫小屋范围变大**：数据包结构修改，小心全怪塔变女巫塔

## 生电特性列表

### <MapIcon name="check" :size="24" /> 启用的特性

| 特性 | 配置文件 | 配置项 | 状态 |
|------|----------|--------|------|
| **TNT 复制** | paper-global.yml | allow-piston-duplication | <MapIcon name="check" :size="24" /> 启用 |
| **地毯复制** | paper-global.yml | allow-piston-duplication | <MapIcon name="check" :size="24" /> 启用 |
| **铁轨复制** | paper-global.yml | allow-piston-duplication | <MapIcon name="check" :size="24" /> 启用 |
| **无头活塞** | paper-global.yml | allow-headless-pistons | <MapIcon name="check" :size="24" /> 启用 |
| **破基岩** | paper-global.yml | allow-permanent-block-break-exploits | <MapIcon name="check" :size="24" /> 启用 |
| **末地门框架** | paper-global.yml | allow-permanent-block-break-exploits | <MapIcon name="check" :size="24" /> 启用 |
| **折跃门** | paper-global.yml | allow-permanent-block-break-exploits | <MapIcon name="check" :size="24" /> 启用 |
| **喷射合成** | server.properties | network-compression-threshold | 256（已调高） |
| **漏斗优化** | leaf-global.yml | use-vanilla-hopper | false（使用优化版） |
| **地狱门区块加载** | paper-global.yml | enable-nether | true |

### <MapIcon name="ban" :size="24" /> 禁用的特性

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
| **异步区块发送** | leaf-global.yml | async-chunk-send | <MapIcon name="check" :size="24" /> 启用 |
| **DAB 距离 AI** | leaf-global.yml | dab.enabled | <MapIcon name="check" :size="24" /> 启用 |
| **异步生物生成** | leaf-global.yml | async-mob-spawning | <MapIcon name="check" :size="24" /> 启用 |
| **异步寻路** | leaf-global.yml | async-pathfinding | <MapIcon name="check" :size="24" /> 启用 |
| **异步实体追踪** | leaf-global.yml | async-entity-tracker | <MapIcon name="check" :size="24" /> 启用（实验性） |
| **随机 tick 优化** | leaf-global.yml | optimize-random-tick | <MapIcon name="check" :size="24" /> 启用 |
| **虚拟线程** | leaf-global.yml | use-virtual-thread | <MapIcon name="check" :size="24" /> 启用 |
| **爆炸优化** | paper-world-defaults.yml | optimize-explosions | <MapIcon name="check" :size="24" /> 启用 |

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

## <MapIcon name="alert" :size="24" /> 注意事项

1. **TNT 复制**：仅限服务器端，客户端无法使用
2. **破基岩**：需要特定操作，建议先测试
3. **安全种子**：已启用，无法查看原始种子
4. **异步优化**：部分功能为实验性，可能有兼容问题

---

_最后更新：2026-06-03_
_适用版本：Leaf 1.21.11-155 + GraalVM 25_
