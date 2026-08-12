---
title: 服务器状态监控
description: 锐界幻境服务器全维度状态监控——硬件配置、服务节点、网络连通性、软件架构一览。
head:
  - - meta
    - name: keywords
      content: 锐界幻境服务器, 硬件配置, 软件架构, 数据备份, 节点状态, 服务器性能, Leaf服务端, 服务监控
---

<script setup>
import { onMounted, ref } from 'vue'

const checkResults = ref([])
const isChecking = ref(false)
const services = [
  { name: 'AI 网关', url: 'https://ai.miragedge.top', label: 'ai.miragedge.top' },
  { name: '主站', url: 'https://miragedge.top', label: 'miragedge.top' },
  { name: 'FWE', url: 'https://f.windemiko.top', label: 'f.windemiko.top' },
  { name: '文档站', url: 'https://fwindemiko.github.io/MiragEdge-DocWeb/', label: 'DocWeb' },
  { name: 'GitHub', url: 'https://github.com', label: 'github.com' },
  { name: 'OpenList', url: 'https://cloud.miragedge.top', label: 'cloud.miragedge.top' },
]

async function runQuickCheck() {
  isChecking.value = true
  checkResults.value = []
  
  for (const svc of services) {
    const start = performance.now()
    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 5000)
      await fetch(svc.url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
      const ms = Math.round(performance.now() - start)
      checkResults.value.push({ ...svc, status: 'ok', ms })
    } catch {
      const ms = Math.round(performance.now() - start)
      checkResults.value.push({ ...svc, status: 'fail', ms })
    }
  }
  isChecking.value = false
}

onMounted(() => {
  runQuickCheck()
})
</script>

# 服务器状态监控

锐界幻境服务器全维度状态监控，涵盖硬件配置、服务节点、网络连通性与软件架构。

##  ️ 快速连通性检测

实时检测各服务节点是否可达：

<ClientOnly>
  <div style="margin: 1rem 0; padding: 1.25rem; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px;">
      <div style="font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <span> 检测结果</span>
        <span style="font-size: 0.8rem; color: var(--vp-c-text-3);">({{ checkResults.length }}/{{ services.length }} 完成)</span>
      </div>
      <button @click="runQuickCheck" :disabled="isChecking" style="padding: 6px 18px; border-radius: 20px; border: 1px solid var(--vp-c-brand); background: transparent; color: var(--vp-c-brand); cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s;">
        {{ isChecking ? '检测中...' : ' 刷新检测' }}
      </button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
      <div v-for="r in checkResults" :key="r.name" :style="{
        padding: '10px 14px',
        borderRadius: '10px',
        background: r.status === 'ok' ? 'rgba(66, 185, 131, 0.08)' : 'rgba(245, 108, 108, 0.08)',
        border: '1px solid ' + (r.status === 'ok' ? 'rgba(66, 185, 131, 0.2)' : 'rgba(245, 108, 108, 0.2)'),
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }">
        <div>
          <div style="font-size: 0.9rem; font-weight: 500;">{{ r.name }}</div>
          <div style="font-size: 0.75rem; color: var(--vp-c-text-3);">{{ r.label }}</div>
        </div>
        <div style="text-align: right;">
          <div :style="{ color: r.status === 'ok' ? '#42b983' : '#f56c6c', fontSize: '0.85rem', fontWeight: 600 }">
            {{ r.status === 'ok' ? '✅ 连通' : '❌ 超时' }}
          </div>
          <div style="font-size: 0.75rem; color: var(--vp-c-text-3);">{{ r.ms }}ms</div>
        </div>
      </div>
    </div>
    <div v-if="!isChecking && checkResults.length > 0" style="margin-top: 0.75rem; text-align: right; font-size: 0.8rem; color: var(--vp-c-text-3);">
      {{ checkResults.filter(r => r.status === 'ok').length }}/{{ checkResults.length }} 服务在线
    </div>
  </div>
</ClientOnly>

##  硬件配置

| 配置项 | 规格 |
|--------|------|
| **处理器** | 英特尔 i5 14600KF（5.8GHz 超频） |
| **内存** | 96GB 高频内存 |
| **网络** | **骨干 BGP 200M**（电信/联通/移动三线优化） |
| **存储** | 数据中心级 SSD |

### 网络优势

- **200M 骨干带宽** — 宿迁 BGP 多线接入，全国低延迟
- **三线优化** — 电信/联通/移动用户均可流畅连接
- **骨干线路** — 直连骨干网，减少跳数，更低延迟

##  软件架构

### 核心技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| **服务端** | Leaf 26.2 | 基于 Pufferfish + Gale，极致性能 |
| **Java** | GraalVM 25 LTS | JIT 编译优化，22% 内存节省 |
| **代理** | Velocity 4.1 | 高性能反向代理 |
| **GC** | G1GC (Aikar) | 优化垃圾回收，减少卡顿 |
| **AI 网关** | New API | 统一 AI 模型管理 |
| **记忆系统** | Hindsight | 跨会话持久记忆 |
| **容器** | Docker + Compose | 全容器化部署 |

### 架构图

```mermaid
graph TB
  subgraph 玩家层
    JE[Java Edition]
    BE[Bedrock Edition]
  end
  subgraph 代理层
    V[Velocity 4.1]
    G[Geyser 2.11]
  end
  subgraph 服务端
    L[Leaf 26.2]
    P[Paper 插件]
  end
  subgraph 基础设施
    D[Docker]
    NG[Nginx]
    H[Hindsight]
    AI[AI 网关]
  end
  JE --> V
  BE --> G --> V
  V --> L --> P
  L --> D
  D --> NG & H & AI
```

### 性能优化

Leaf 服务端启用了多项异步优化：

- **异步区块发送** — 玩家加载区块更流畅
- **DAB 距离 AI** — 远处生物减少计算
- **异步生物生成** — 减少主线程负载
- **异步寻路** — 生物寻路不阻塞主线程
- **虚拟线程** — 节省内存，提升并发

##  节点状态

### 计算/网络节点

<NodeStatus />

> 数据由 ECS 云服务器上的探针程序每 15 秒采集并写入。如节点数据未显示，请确认探针程序运行正常。

### 游戏服务器在线

<iframe frameborder="0" width="100%" height="420" style="max-width:800px; border-radius: 8px;" scrolling="no" src="https://motd.minebbs.com/iframe?ip=dev.miragedge.top&stype=je&dark=true"></iframe>

<iframe frameborder="0" width="100%" height="420" style="max-width:700px; border-radius: 8px;" scrolling="no" src="https://motd.minebbs.com/iframe?ip=dev.miragedge.top&stype=be&dark=true"></iframe>

##  数据备份

| 策略 | 频率 | 说明 |
|------|------|------|
| **数据库备份** | 每日 4 次 | 实时保护游戏数据 |
| **虚拟机克隆** | 每周 | 完整系统快照 |
| **云端归档** | 每月 | 异地容灾保障 |

> 梦始之空世界存档 **永久保存**，我们承诺不会删除任何玩家的心血结晶。

## 相关链接

- [运维待办](/developer/ops/todo)
- [计算资源](/developer/ops/compute)
