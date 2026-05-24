<template>
  <div class="node-status-container">
    <h3>Node在线状态统计</h3>
    <div class="node-grid">
      <div 
        v-for="server in servers" 
        :key="server.host"
        :class="['node-card', server.online4 ? 'online' : 'offline']"
      >
        <div class="node-header">
          <h4 class="node-name">{{ server.name }}</h4>
          <span class="node-status" :class="server.online4 ? 'status-online' : 'status-offline'">
            {{ server.online4 ? '在线' : '离线' }}
          </span>
        </div>
        <div class="node-details">
          <div class="detail-row">
            <span class="detail-label">位置:</span>
            <span class="detail-value">{{ server.location }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">类型:</span>
            <span class="detail-value">{{ server.type }}</span>
          </div>
          <div v-if="server.online4" class="online-details">
            <div class="detail-row">
              <span class="detail-label">CPU:</span>
              <span class="detail-value">{{ server.cpu }}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">内存:</span>
              <span class="detail-value">{{ formatMemory(server.memory_used, server.memory_total) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">硬盘:</span>
              <span class="detail-value">{{ formatDisk(server.hdd_used, server.hdd_total) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">负载:</span>
              <span class="detail-value">{{ server.load_1 }} {{ server.load_5 }} {{ server.load_15 }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">在线时长:</span>
              <span class="detail-value">{{ server.uptime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="last-updated">数据采集时间: {{ lastUpdated }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Server {
  name: string;
  type: string;
  host: string;
  location: string;
  online4: boolean;
  online6: boolean;
  uptime?: string;
  cpu?: number;
  memory_total?: number;
  memory_used?: number;
  hdd_total?: number;
  hdd_used?: number;
  load_1?: number;
  load_5?: number;
  load_15?: number;
  os?: string;
  [key: string]: any;
}

interface StatsData {
  servers: Server[];
  sslcerts?: any[];
  updated?: string;
}

const servers = ref<Server[]>([]);
const lastUpdated = ref<string>('');
let refreshInterval: number | null = null;

// 格式化内存显示
const formatMemory = (used: number | undefined, total: number | undefined): string => {
  if (used === undefined || total === undefined) return 'N/A';
  const usedGB = Math.round(used / 1024 / 1024 * 100) / 100;
  const totalGB = Math.round(total / 1024 / 1024 * 100) / 100;
  return `${usedGB}GB / ${totalGB}GB`;
};

// 格式化硬盘显示
const formatDisk = (used: number | undefined, total: number | undefined): string => {
  if (used === undefined || total === undefined) return 'N/A';
  const usedGB = used / 1024;
  const totalGB = total / 1024;
  // 保留两位小数，若需要可调整为 toFixed(1) 或动态小数位
  return `${usedGB.toFixed(2)}GB / ${totalGB.toFixed(2)}GB`;
};

// 获取服务器状态数据
const fetchServerStatus = async () => {
  try {
    const response = await fetch('/ServerStatus/json/stats.json');
    if (!response.ok) {
      throw new Error(`查询错误: ${response.status}`);
    }
    const data: StatsData = await response.json();
    servers.value = data.servers || [];
    
    // 格式化更新时间
    if (data.updated) {
      const date = new Date(Number(data.updated) * 1000);
      lastUpdated.value = date.toLocaleString('zh-CN');
    }
  } catch (error) {
    console.error('获取服务器状态失败:', error);
  }
};

// 初始化数据
onMounted(() => {
  fetchServerStatus();
  // 设置每5秒刷新一次
  refreshInterval = window.setInterval(fetchServerStatus, 5000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.node-status-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-status-container h3 {
  margin-top: 0;
  color: var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-brand);
  padding-bottom: 0.5rem;
}

.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.node-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 1rem;
  transition: border-color 0.3s ease;
}

.node-card.online {
  border-left: 4px solid #42b983;
  background-color: rgba(66, 185, 131, 0.03);
}

.node-card.offline {
  border-left: 4px solid #f56c6c;
  background-color: rgba(245, 108, 108, 0.03);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.node-name {
  margin: 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  flex: 1;
}

.node-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}

.status-online {
  background-color: #e0f5e9;
  color: #42b983;
}

.status-offline {
  background-color: #fde2e2;
  color: #f56c6c;
}

.node-details {
  font-size: 0.9rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: bold;
  color: var(--vp-c-text-2);
  min-width: 70px;
}

.detail-value {
  color: var(--vp-c-text-1);
  flex: 1;
}

.online-details {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.last-updated {
  margin-top: 1.5rem;
  text-align: right;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
</style>