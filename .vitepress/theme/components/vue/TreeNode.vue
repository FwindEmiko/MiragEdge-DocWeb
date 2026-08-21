<template>
  <div>
    <div
      class="tree-node"
      :class="{ 'tree-node-selected': node.path === selectedPath, 'tree-node-dir': node.type === 'directory' }"
      :style="{ paddingLeft: depth * 16 + 8 + 'px' }"
      @click="handleClick"
    >
      <span class="tree-node-icon">{{ node.type === 'directory' ? (expanded ? '📂' : '📁') : '📄' }}</span>
      <span class="tree-node-name">{{ node.name }}</span>
    </div>
    <div v-if="node.type === 'directory' && expanded" class="tree-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :selectedPath="selectedPath"
        :depth="depth + 1"
        @select="(f) => $emit('select', f)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SkillFile {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: SkillFile[]
}

const props = defineProps<{
  node: SkillFile
  selectedPath: string
  depth: number
}>()

const emit = defineEmits<{
  select: [file: SkillFile]
}>()

const expanded = ref(props.depth < 2)

function handleClick() {
  if (props.node.type === 'directory') {
    expanded.value = !expanded.value
  } else {
    emit('select', props.node)
  }
}
</script>

<style scoped>
.tree-node { display: flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.8rem; color: var(--vp-c-text-1); transition: background 0.1s; user-select: none; }
.tree-node:hover { background: var(--vp-c-bg-soft); }
.tree-node-selected { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.tree-node-icon { flex-shrink: 0; font-size: 0.75rem; }
.tree-node-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; word-break: break-all; }
</style>