---
title: 服务器状态与技术信息
description: 锐界幻境服务器硬件配置、软件架构、备份策略与节点在线状态监控，高性能服务端架构与实时状态一览。
head:
  - - meta
    - name: keywords
      content: 锐界幻境服务器, 硬件配置, 软件架构, 数据备份, 节点状态, 服务器性能, Leaf服务端
---

# 服务器状态与技术信息

## <MapIcon name="monitor" :size="24" /> 硬件配置

服务器采用高性能硬件配置，确保游戏流畅运行：

| 配置项 | 规格 |
|--------|------|
| **处理器** | 英特尔 i5 14600KF（5.8GHz 超频） |
| **内存** | 96GB 高频内存 |
| **网络** | **骨干 BGP 200M**（电信/联通/移动三线优化） |
| **存储** | 数据中心级 SSD |

### 网络优势

- **200M 骨干带宽** - 宿迁 BGP 多线接入，全国低延迟
- **三线优化** - 电信/联通/移动用户均可流畅连接
- **骨干线路** - 直连骨干网，减少跳数，更低延迟

## <MapIcon name="shield" :size="24" /> 软件架构与备份策略

### 服务架构

使用 **Velocity** 反向代理 + **Leaf** 服务端（基于 Pufferfish + Gale），全容器化管理，JumpServer 堡垒机安全协作，专业的网络优化，确保低延迟高稳定。

### 核心技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| **服务端** | Leaf 26.1.2 | 基于 Pufferfish + Gale，极致性能 |
| **Java** | GraalVM 25 LTS | JIT 编译优化，22% 内存节省 |
| **代理** | Velocity | 高性能反向代理 |
| **GC** | G1GC (Aikar) | 优化垃圾回收，减少卡顿 |

### 性能优化

Leaf 服务端启用了多项异步优化：

- <MapIcon name="check" :size="24" /> 异步区块发送 - 玩家加载区块更流畅
- <MapIcon name="check" :size="24" /> DAB 距离 AI - 远处生物减少计算
- <MapIcon name="check" :size="24" /> 异步生物生成 - 减少主线程负载
- <MapIcon name="check" :size="24" /> 异步寻路 - 生物寻路不阻塞主线程
- <MapIcon name="check" :size="24" /> 虚拟线程 - 节省内存，提升并发

### 数据备份

- **数据库备份** — 每日 4 次，实时保护游戏数据
- **虚拟机克隆** — 每周，完整系统快照
- **云端归档** — 每月，异地容灾保障

> 梦始之空世界存档 **永久保存**，我们承诺不会删除任何玩家的心血结晶。

## 节点状态统计

### 网络/计算节点在线状态

<NodeStatus />

### 游戏服务器在线状态

<iframe id="mc-status-mc-miragedge-top-" frameborder="0" width="800" height="420" style="max-width:100%;" scrolling="no" src="https://motd.minebbs.com/iframe?ip=dev.miragedge.top&stype=je&dark=true"></iframe>

<iframe id="mc-status-miragedge-top-" frameborder="0" width="700" height="420" style="max-width:100%;" scrolling="no" src="https://motd.minebbs.com/iframe?ip=dev.miragedge.top&stype=be&dark=true"></iframe>