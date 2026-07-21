<template>
  <div v-if="showContributors && contributorList.length" class="contributors-container">
    <div class="contributors-inner">
      <div class="section-header">
        <span class="header-line"></span>
        <h3 class="section-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          本页面贡献者
        </h3>
        <span class="header-line"></span>
      </div>
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
/* ===== 容器：宽度对齐文档主体内容 ===== */
.contributors-container {
  margin: 1rem auto 0;
  padding: 1.5rem 0 0.5rem;
  /* 宽度不超过上方文档内容，且整体居中 */
  width: 100%;
  max-width: 100%;
}

.contributors-inner {
  /* 与 VitePress 文档 .content-container 最大宽度对齐：有 aside 时 688px */
  max-width: 688px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== 标题区：横向线 + 居中标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 1.5rem;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--vp-c-divider), transparent);
  min-width: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin: 0;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.title-icon {
  width: 18px;
  height: 18px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ===== 贡献者网格：横向优先、自动换行 ===== */
.contributors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

/* ===== 贡献者卡片：玻璃磨砂 + 悬停发光 ===== */
.contributor-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.875rem 0.5rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  text-decoration: none;
  color: inherit;
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  /* 紧凑卡片：横向优先时每张卡占自然宽度，但限制最大值避免单卡过宽 */
  width: fit-content;
  max-width: 100%;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.contributor-card:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(224, 82, 82, 0.18);
}

/* ===== 头像 ===== */
.contributor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 0 0 1px var(--vp-c-divider);
  transition: box-shadow 0.25s ease;
}

.contributor-card:hover .contributor-avatar {
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== 文字信息 ===== */
.contributor-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.contributor-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.contributor-handle {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

/* ===== GitHub 图标徽章 ===== */
.github-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--vp-c-bg);
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.25s ease;
}

.contributor-card:hover .github-badge {
  background: var(--vp-c-brand-1);
}

.github-icon {
  width: 14px;
  height: 14px;
  color: var(--vp-c-text-2);
  transition: color 0.25s ease;
}

.contributor-card:hover .github-icon {
  color: #fff;
}

/* ===== 尊重减少动画偏好 ===== */
@media (prefers-reduced-motion: reduce) {
  .contributor-card,
  .contributor-avatar,
  .github-badge,
  .github-icon {
    transition: none;
  }
}

/* ===== 响应式：移动端紧凑 ===== */
@media (max-width: 768px) {
  .contributors-inner {
    padding: 0 16px;
  }

  .section-header {
    gap: 10px;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 0.875rem;
  }

  .contributors-grid {
    gap: 0.5rem;
  }

  .contributor-card {
    gap: 0.5rem;
    padding: 0.375rem 0.75rem 0.375rem 0.375rem;
  }

  .contributor-name,
  .contributor-handle {
    max-width: 110px;
  }
}
</style>
