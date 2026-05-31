<template>
  <div class="smart-image-container" :class="containerClasses">
    <!-- 占位符 -->
    <div 
      v-if="!loaded && !error" 
      class="image-placeholder"
      :style="placeholderStyle"
    >
      <div class="placeholder-content">
        <div class="spinner"></div>
        <span v-if="alt" class="alt-text">{{ alt.substring(0, 15) }}{{ alt.length > 15 ? '...' : '' }}</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div 
      v-if="error" 
      class="image-error"
      :style="placeholderStyle"
    >
      <div class="error-content">
        <span class="error-icon">❌</span>
        <span class="error-text">图片加载失败</span>
      </div>
    </div>

    <!-- 主图片 -->
    <div 
      v-if="!error"
      class="image-wrapper"
      :style="wrapperStyle"
    >
      <img
        ref="imageRef"
        :src="src"
        :alt="alt || 'Image'"
        :style="imageStyle"
        :class="{ 'loaded': loaded }"
        :loading="loadingAttr"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <!-- 图片说明 -->
    <div v-if="caption" class="image-caption">
      {{ caption }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartImage',
  
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    maxWidth: {
      type: [Number, String],
      default: null
    },
    radius: {
      type: [String, Number, Boolean],
      default: 'auto'
    },
    shadow: {
      type: [String, Boolean],
      default: true
    },
    border: {
      type: [Boolean, String],
      default: false
    },
    showInfo: {
      type: Boolean,
      default: false
    },
    // 新增：控制是否启用懒加载，默认 false（禁用懒加载，提高兼容性）
    lazy: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loaded: false,
      error: false,
      imageSize: {
        width: 0,
        height: 0,
        aspectRatio: 1
      }
    }
  },

  computed: {
    // 新增：根据 lazy prop 返回 loading 属性的值
    loadingAttr() {
      return this.lazy ? 'lazy' : 'eager';
    },

    containerClasses() {
      return {
        'has-caption': this.caption,
        'has-border': this.border,
        'has-shadow': this.shadow
      }
    },

    placeholderStyle() {
      const style = {}
      
      if (this.width) {
        style.width = typeof this.width === 'number' ? `${this.width}px` : this.width
      }
      
      if (this.height) {
        style.height = typeof this.height === 'number' ? `${this.height}px` : this.height
      }
      
      return style
    },

    wrapperStyle() {
      const style = {}
      
      if (this.width) {
        style.width = typeof this.width === 'number' ? `${this.width}px` : this.width
      }
      
      if (this.maxWidth) {
        style.maxWidth = typeof this.maxWidth === 'number' ? `${this.maxWidth}px` : this.maxWidth
      }
      
      return style
    },

    imageStyle() {
      const style = {}
      
      // 圆角处理
      if (this.radius !== false) {
        if (this.radius === 'auto') {
          // 根据图片长宽比自动计算圆角
          const aspectRatio = this.imageSize.aspectRatio
          if (aspectRatio > 2 || aspectRatio < 0.5) {
            style.borderRadius = '4px' // 长图用较小圆角
          } else if (aspectRatio > 1.5 || aspectRatio < 0.67) {
            style.borderRadius = '6px' // 中等长宽比
          } else {
            style.borderRadius = '8px' // 接近正方形用较大圆角
          }
        } else if (typeof this.radius === 'string') {
          style.borderRadius = this.radius
        } else if (typeof this.radius === 'number') {
          style.borderRadius = `${this.radius}px`
        }
      }
      
      // 边框
      if (this.border) {
        if (typeof this.border === 'string') {
          style.border = this.border
        } else {
          style.border = '1px solid rgba(0, 0, 0, 0.1)'
        }
      }
      
      // 阴影
      if (this.shadow !== false) {
        if (this.shadow === true) {
          style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        } else if (typeof this.shadow === 'string') {
          style.boxShadow = this.shadow
        }
      }
      
      return style
    }
  },

  mounted() {
    const img = this.$refs.imageRef;
    if (!img) return;

    // 图片已缓存，直接处理
    if (img.complete) {
      if (img.naturalWidth) {
        this.onImageLoad({ target: img });
      } else {
        this.onImageError();
      }
      return;
    }

    // 懒加载图片：用 IntersectionObserver 等待进入视口
    if (this.lazy && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            // 兜底：浏览器干预 load 事件时，手动处理
            if (img.complete && img.naturalWidth) {
              this.onImageLoad({ target: img });
            }
            break;
          }
        }
      }, { rootMargin: '200px' });
      observer.observe(img);
      setTimeout(() => observer.disconnect(), 5000);
    }
  },

  methods: {
    onImageLoad(event) {
      this.loaded = true
      const img = event.target
      this.imageSize = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      }
    },

    onImageError() {
      this.error = true
      this.loaded = false
      console.error(`图片加载失败: ${this.src}`)
    }
  }
}
</script>

<style scoped>
/* 样式保持不变，完全沿用原有样式 */
.smart-image-container {
  margin: 1.5rem 0;
  text-align: center;
}

/* 图片容器 */
.image-wrapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

/* 图片 */
.image-wrapper img {
  display: block;
  max-width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(45deg, #f5f5f5 25%, #e8e8e8 25%, #e8e8e8 50%, #f5f5f5 50%, #f5f5f5 75%, #e8e8e8 75%);
  background-size: 20px 20px;
}

.image-wrapper img.loaded {
  opacity: 1;
}

/* 占位符 */
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f5f5f5 25%, #e8e8e8 25%, #e8e8e8 50%, #f5f5f5 50%, #f5f5f5 75%, #e8e8e8 75%);
  background-size: 20px 20px;
  border-radius: 4px;
  min-height: 200px;
}

.placeholder-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

.alt-text {
  display: block;
  color: #666;
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 错误状态 */
.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #fff5f5 25%, #ffe8e8 25%, #ffe8e8 50%, #fff5f5 50%, #fff5f5 75%, #ffe8e8 75%);
  background-size: 20px 20px;
  border-radius: 4px;
  min-height: 200px;
}

.error-content {
  text-align: center;
}

.error-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

.error-text {
  color: #e74c3c;
  font-size: 14px;
}

/* 图片说明 */
.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-style: italic;
  line-height: 1.4;
}

/* 深色模式适配 */
:deep(.dark) .image-wrapper img {
  background: linear-gradient(45deg, #2d2d2d 25%, #3d3d3d 25%, #3d3d3d 50%, #2d2d2d 50%, #2d2d2d 75%, #3d3d3d 75%);
  background-size: 20px 20px;
}

:deep(.dark) .image-placeholder {
  background: linear-gradient(45deg, #2d2d2d 25%, #3d3d3d 25%, #3d3d3d 50%, #2d2d2d 50%, #2d2d2d 75%, #3d3d3d 75%);
  background-size: 20px 20px;
}

:deep(.dark) .alt-text {
  color: #aaa;
}

:deep(.dark) .image-caption {
  color: #aaa;
}

:deep(.dark) .has-shadow .image-wrapper img {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .smart-image-container {
    margin: 1rem 0;
  }
  
  .image-caption {
    font-size: 13px;
  }
}
</style>