<script setup>
// 漂浮音符组件
import { ref, onMounted, onBeforeUnmount } from 'vue'

const notes = ref([])
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 500)

  // 生成音符
  const noteChars = ['♪', '♫', '♬', '🎵', '🎶', '🎼', '🎸', '🎹']
  for (let i = 0; i < 8; i++) { // 减少数量
    notes.value.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      note: noteChars[Math.floor(Math.random() * noteChars.length)],
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 16 + Math.random() * 16,
      hue: Math.random() * 40 + 180
    })
  }
})
</script>

<template>
  <div class="notes-container" :class="{ visible: isVisible }">
    <div
      v-for="note in notes"
      :key="note.id"
      class="note"
      :style="{
        left: note.left + '%',
        top: note.top + '%',
        animationDelay: note.delay + 's',
        animationDuration: note.duration + 's',
        fontSize: note.size + 'px',
        color: `hsl(${note.hue}, 80%, 60%)`
      }"
    >{{ note.note }}</div>
  </div>
</template>

<style scoped>
.notes-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9996;
  opacity: 0;
  transition: opacity 1s ease;
}

.notes-container.visible {
  opacity: 1;
}

.note {
  position: absolute;
  will-change: transform, opacity;
  animation: float-note ease-in-out infinite;
  text-shadow: 0 0 10px currentColor;
}

@keyframes float-note {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(15deg) scale(1.1);
    opacity: 1;
  }
}
</style>
