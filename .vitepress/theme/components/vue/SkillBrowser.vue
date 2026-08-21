<!--
AI Skills 浏览器组件：展示技能文件树、预览内容、提供复制/下载/原始查看功能
-->
<template>
  <div class="skill-browser">
    <div class="skill-browser-header">
      <select v-model="currentSkillId" @change="loadSkill" class="skill-selector">
        <option v-for="s in skills" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <span v-if="currentSkill" class="skill-version">v{{ currentSkill.version }}</span>
    </div>
    <div class="skill-browser-layout" v-if="currentSkill">
      <div class="skill-file-tree">
        <div class="file-tree-header">文件列表</div>
        <div class="file-tree-scroll">
          <TreeNode
            v-for="node in currentSkill.files"
            :key="node.path"
            :node="node"
            :selectedPath="selectedPath"
            :depth="0"
            @select="selectFile"
          />
        </div>
      </div>
      <div class="skill-file-preview" v-if="selectedFile">
        <div class="preview-header">
          <span class="preview-filename">{{ selectedFile.name }}</span>
          <div class="preview-actions">
            <button class="skill-btn" @click="copyContent" title="Copy">复制</button>
            <a :href="rawUrl" target="_blank" class="skill-btn" title="Open raw">原始文件</a>
            <a :href="rawUrl" download class="skill-btn" title="Download">下载</a>
          </div>
        </div>
        <div class="preview-content">
          <pre v-if="isTextFile" class="preview-code"><code>{{ fileContent }}</code></pre>
          <div v-else class="preview-binary">
            <p>Binary file - preview not supported.</p>
            <a :href="rawUrl" download class="skill-btn">Download</a>
          </div>
        </div>
        <div class="preview-status" v-if="loading">Loading...</div>
        <div class="preview-status error" v-if="loadError">{{ loadError }}</div>
      </div>
      <div class="skill-file-preview preview-empty" v-else>
        <p>Select a file from the tree to preview</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

interface SkillFile {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  mtime?: string
  children?: SkillFile[]
}

interface Skill {
  id: string
  name: string
  description: string
  version: string
  skillFile: string
  files: SkillFile[]
}

interface Manifest {
  version: number
  skills: Skill[]
}

const props = withDefaults(defineProps<{
  skillId?: string
  baseUrl?: string
}>(), {
  baseUrl: '/ai-skills/'
})

const skills = ref<Skill[]>([])
const currentSkillId = ref(props.skillId || '')
const currentSkill = computed(() => skills.value.find(s => s.id === currentSkillId.value))
const selectedPath = ref('')
const fileContent = ref('')
const loading = ref(false)
const loadError = ref('')

const selectedFile = computed(() => {
  if (!currentSkill.value) return null
  return findFile(currentSkill.value.files, selectedPath.value)
})

function findFile(files: SkillFile[], path: string): SkillFile | null {
  for (const f of files) {
    if (f.path === path) return f
    if (f.children) {
      const found = findFile(f.children, path)
      if (found) return found
    }
  }
  return null
}

const isTextFile = computed(() => {
  if (!selectedFile.value) return false
  const ext = selectedFile.value.name.split('.').pop()?.toLowerCase()
  return ['md', 'yml', 'yaml', 'json', 'txt', 'java', 'kt', 'kts', 'ts', 'js', 'vue', 'css', 'html', 'xml', 'cfg', 'properties', 'gradle', 'bat', 'sh', 'env', 'gitignore'].includes(ext || '')
})

const rawUrl = computed(() => {
  if (!selectedFile.value) return ''
  return withBase(props.baseUrl + selectedFile.value.path)
})

async function loadManifest() {
  try {
    const res = await fetch(withBase(props.baseUrl + 'skills.json'))
    const manifest: Manifest = await res.json()
    skills.value = manifest.skills
    if (!currentSkillId.value && manifest.skills.length > 0) {
      currentSkillId.value = manifest.skills[0].id
    }
    loadSkill()
  } catch (e) {
    loadError.value = 'Failed to load skills: ' + (e as Error).message
  }
}

function loadSkill() {
  selectedPath.value = ''
  fileContent.value = ''
  loadError.value = ''
}

async function selectFile(file: SkillFile) {
  if (file.type === 'directory') return
  selectedPath.value = file.path
  fileContent.value = ''
  loadError.value = ''
  loading.value = true
  try {
    const res = await fetch(rawUrl.value)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    fileContent.value = await res.text()
  } catch (e) {
    loadError.value = 'Failed to load: ' + (e as Error).message
  } finally {
    loading.value = false
  }
}

async function copyContent() {
  if (!fileContent.value) return
  try {
    await navigator.clipboard.writeText(fileContent.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = fileContent.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

onMounted(() => {
  loadManifest()
})
</script>

<style scoped>
.skill-browser { border: 1px solid var(--vp-c-border); border-radius: 8px; overflow: hidden; background: var(--vp-c-bg); margin: 1rem 0; }
.skill-browser-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-border); }
.skill-selector { flex: 1; padding: 0.4rem 0.6rem; border: 1px solid var(--vp-c-border); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 0.9rem; cursor: pointer; }
.skill-version { font-size: 0.75rem; color: var(--vp-c-text-2); white-space: nowrap; }
.skill-browser-layout { display: flex; min-height: 400px; max-height: 600px; }
.skill-file-tree { width: 260px; min-width: 200px; border-right: 1px solid var(--vp-c-border); display: flex; flex-direction: column; }
.file-tree-header { padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-border); letter-spacing: 0.5px; }
.file-tree-scroll { flex: 1; overflow-y: auto; padding: 0.25rem 0; }
.skill-file-preview { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.preview-empty { align-items: center; justify-content: center; color: var(--vp-c-text-2); font-size: 0.9rem; }
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-border); gap: 0.5rem; flex-wrap: wrap; }
.preview-filename { font-weight: 600; font-size: 0.85rem; color: var(--vp-c-text-1); word-break: break-all; }
.preview-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
.skill-btn { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid var(--vp-c-border); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 0.75rem; cursor: pointer; text-decoration: none; transition: background 0.15s; }
.skill-btn:hover { background: var(--vp-c-bg-soft); }
.preview-content { flex: 1; overflow: auto; padding: 0; }
.preview-code { margin: 0; padding: 1rem; font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap; word-break: break-all; font-family: var(--vp-font-mono, ui-monospace, monospace); color: var(--vp-c-text-1); }
.preview-binary { padding: 2rem; text-align: center; color: var(--vp-c-text-2); }
.preview-status { padding: 0.5rem; text-align: center; font-size: 0.8rem; color: var(--vp-c-text-2); border-top: 1px solid var(--vp-c-border); }
.preview-status.error { color: var(--vp-c-danger-1); }
</style>