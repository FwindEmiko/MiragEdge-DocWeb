<template>
  <div v-if="showContributors && contributorList.length" class="contributors-container">
    <div class="contributors-section">
      <h3 class="section-title">本页面贡献者</h3>
      <div class="contributors-grid">
        <a
          v-for="person in contributorList"
          :key="person.username"
          :href="`https://github.com/${person.username}`"
          class="contributor-card"
          target="_blank"
          rel="noopener noreferrer"
          :title="`访问 ${person.nickname} 的 GitHub 主页`"
        >
          <div class="contributor-avatar">
            <img
              :src="person.avatar"
              :alt="person.username"
              class="avatar-image"
              loading="lazy"
              @error="handleAvatarError"
            />
          </div>
          <div class="contributor-info">
            <span class="contributor-name">{{ person.nickname }}</span>
            <span class="contributor-handle">@{{ person.username }}</span>
          </div>
          <div class="github-badge">
            <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useData, useRoute } from 'vitepress';

interface Contributor {
  username: string;
  nickname: string;
  avatar: string;
}

const { frontmatter } = useData();
const route = useRoute();

// 头像加载失败处理（通过 data-fallback 标志位避免 fallback 再次失败时形成请求循环）
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target.dataset.fallback) {
    return;
  }
  target.dataset.fallback = '1';
  target.src = 'https://github.com/identicons/octocat.png';
};

// 判断是否显示贡献者组件
const showContributors = computed(() => {
  // 排除首页
  const isHomePage = route.path === '/' || 
                     route.path === '/index' || 
                     route.path === '/README.md' ||
                     route.path.includes('/index.html') ||
                     route.path.includes('/index.md') ;
  
  // 也可以通过 frontmatter 显式控制是否显示
  const hideInFrontmatter = frontmatter.value.hideContributors === true;
  
  // 如果有贡献者数据，并且不是首页，并且没有被 frontmatter 显式隐藏，则显示
  return !isHomePage && !hideInFrontmatter;
});

const contributorList = computed<Contributor[]>(() => {
  // 如果不需要显示，直接返回空数组
  if (!showContributors.value) {
    return [];
  }
  
  // 尝试不同的字段名
  const contributors = frontmatter.value.contributors || frontmatter.value.contributorList;
  
  if (!contributors || typeof contributors !== 'string') {
    return [];
  }
  
  try {
    // 解析格式：昵称1,用户名1;昵称2,用户名2
    return contributors
      .split(';')
      .filter(item => item.trim() !== '')
      .map((item: string) => {
        const parts = item.split(',');
        // 如果没有逗号分隔，整个字符串作为昵称，同时作为用户名
        if (parts.length === 1) {
          const nickname = parts[0].trim();
          return {
            nickname,
            username: nickname, // 如果没有用户名，使用昵称作为用户名
            avatar: `https://avatars.githubusercontent.com/${nickname}?v=4&size=100`,
          };
        }
        // 如果有逗号分隔
        const [nickname, username] = parts;
        return {
          nickname: nickname?.trim() || username?.trim() || '',
          username: username?.trim() || nickname?.trim() || '',
          avatar: `https://avatars.githubusercontent.com/${username?.trim()}?v=4&size=100`,
        };
      })
      .filter(contributor => contributor.nickname);
  } catch (error) {
    console.error('解析贡献者列表时出错:', error);
    return [];
  }
});

// 调试信息（开发环境启用）
//if (import.meta.env.DEV) {
//  console.log('当前页面:', route.path);
//  console.log('是否显示贡献者:', showContributors.value);
//  console.log('Frontmatter:', frontmatter.value);
//  console.log('贡献者列表:', contributorList.value);
//}
</script>

<style scoped>
.contributors-container {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid var(--vp-c-divider-light);
}

.contributors-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.2rem;
  padding-left: auto;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  gap: 0.5rem;
}

.section-title::before {
  content: "📝";
  font-size: 1.2rem;
  margin-right: auto;
}

.section-title::after {
  content: "📝";
  font-size: 1.2rem;
  margin-left: auto;
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.contributor-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.contributor-card:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contributor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--vp-c-divider);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contributor-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.contributor-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.contributor-handle {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.github-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  flex-shrink: 0;
}

.github-icon {
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-2);
  transition: color 0.2s ease;
}

.contributor-card:hover .github-icon {
  color: var(--vp-c-brand);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contributors-grid {
    grid-template-columns: 1fr;
  }
  
  .contributors-container {
    margin: 2rem 0;
    padding: 1.5rem 0;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}

/* 暗色模式适配 */
.dark .contributor-card {
  background: var(--vp-c-bg-soft-up);
}

.dark .contributor-card:hover {
  background: var(--vp-c-bg-mute-up);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>