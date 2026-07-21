<template>
  <div class="smart-image-container" :class="containerClasses" :style="containerStyle">
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
        class="smart-image-content"
        :class="{ 'loaded': loaded, 'is-zoomable': zoomable }"
        :src="baseSrc"
        :alt="alt || 'Image'"
        :style="imageStyle"
        :loading="loadingAttr"
        :data-zoomable="zoomable ? 'true' : null"
        @load="onImageLoad"
        @error="onImageError"
        @click="onImageClick"
      />
    </div>

    <!-- 图片说明 -->
    <div v-if="caption" class="image-caption">
      {{ caption }}
    </div>
  </div>
</template>

<script>
import { withBase } from 'vitepress'
import externalWmMap from '../../../../public/external-wm-map.json'
import { useLightbox, registerToGroup, unregisterFromGroup } from '../../composables/useLightbox'
import { normalizeCssLength } from '../../utils/cssValue'

const wmMap = externalWmMap

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
    },
    // 对齐方式：left / center / right
    align: {
      type: String,
      default: 'center',
      validator: v => ['left', 'center', 'right'].includes(v)
    },
    // 左/右边距（用于左/右对齐时控制距离）
    margin: {
      type: [Number, String],
      default: null
    },
    // ====== Lightbox 相关 props ======
    // 是否启用点击放大
    zoomable: {
      type: Boolean,
      default: true
    },
    // 高清图源（默认空，则使用 src 原图）
    zoomSrc: {
      type: String,
      default: ''
    },
    // 分组名（同组可在 lightbox 中左右切换）
    zoomGroup: {
      type: String,
      default: ''
    },
    // 放大后的标题（默认空则复用 caption/alt）
    zoomCaption: {
      type: String,
      default: ''
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
    baseSrc() {
      // 外部图片水印重写：如果映射表中存在本地水印版本，则使用本地路径
      if (this.src && this.src.startsWith('http') && wmMap[this.src]) {
        return withBase(wmMap[this.src])
      }
      return withBase(this.src)
    },
    // 放大用的大图地址：优先 zoomSrc，否则使用 src（同样走水印重写）
    baseZoomSrc() {
      const raw = this.zoomSrc || this.src
      if (raw && raw.startsWith('http') && wmMap[raw]) {
        return withBase(wmMap[raw])
      }
      return withBase(raw)
    },
    // 放大后的标题：优先 zoomCaption，否则 caption，否则 alt
    effectiveZoomCaption() {
      return this.zoomCaption || this.caption || this.alt || ''
    },
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

      const width = normalizeCssLength(this.width)
      const height = normalizeCssLength(this.height)
      if (width) style.width = width
      if (height) style.height = height
      
      return style
    },

    wrapperStyle() {
      const style = {}

      const width = normalizeCssLength(this.width)
      const maxWidth = normalizeCssLength(this.maxWidth)
      if (width) style.width = width
      if (maxWidth) style.maxWidth = maxWidth
      
      return style
    },

    // 容器对齐样式
    containerStyle() {
      const style = {}
      
      if (this.align === 'left') {
        style.textAlign = 'left'
        const margin = normalizeCssLength(this.margin)
        if (margin) style.marginLeft = margin
      } else if (this.align === 'right') {
        style.textAlign = 'right'
        const margin = normalizeCssLength(this.margin)
        if (margin) style.marginRight = margin
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
      
      // 阴影：默认使用柔和的双层投影，避免生硬的大阴影
      if (this.shadow !== false) {
        if (this.shadow === true) {
          style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)'
        } else if (typeof this.shadow === 'string') {
          style.boxShadow = this.shadow
        }
      }
      
      return style
    }
  },

  watch: {
    src() {
      this._unregisterFromGroup()
      this._resetImageState()
      this.$nextTick(() => this._startImageMonitoring())
    },
    zoomSrc() {
      this._syncGroupRegistration()
    },
    zoomGroup() {
      this._syncGroupRegistration()
    },
    zoomable() {
      this._syncGroupRegistration()
    },
    zoomCaption() {
      this._syncGroupRegistration()
    },
    caption() {
      this._syncGroupRegistration()
    },
    alt() {
      this._syncGroupRegistration()
    }
  },

  mounted() {
    this._startImageMonitoring()
  },

  beforeUnmount() {
    this._clearImageMonitoring()
    this._unregisterFromGroup()
  },

  methods: {
    onImageLoad(event) {
      this._clearImageMonitoring()
      this.loaded = true
      this.error = false
      const img = event.target
      this.imageSize = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1
      }
      this._syncGroupRegistration()
    },

    onImageError() {
      this._clearImageMonitoring()
      this._unregisterFromGroup()
      this.error = true
      this.loaded = false
      console.error(`图片加载失败: ${this.src}`)
    },

    // 点击图片触发 lightbox
    onImageClick() {
      if (!this.zoomable) return;
      const img = this.$refs.imageRef;
      if (!img) return;
      // 使用浏览器原生属性检查图片是否真正加载完成
      // 避免 SSR hydration 场景下 loaded 状态未同步导致点击无反应
      if (!img.complete || img.naturalWidth === 0) return;
      const { open } = useLightbox();
      open({
        src: this.baseZoomSrc,
        alt: this.alt || '',
        caption: this.effectiveZoomCaption,
        originEl: img,
      }, this.zoomGroup || undefined);
    },

    _resetImageState() {
      this._clearImageMonitoring()
      this.loaded = false
      this.error = false
      this.imageSize = { width: 0, height: 0, aspectRatio: 1 }
    },

    _clearImageMonitoring() {
      if (this._observer) {
        this._observer.disconnect()
        this._observer = null
      }
      if (this._fallbackTimer) {
        clearTimeout(this._fallbackTimer)
        this._fallbackTimer = null
      }
      if (this._loadCheckTimer) {
        clearInterval(this._loadCheckTimer)
        this._loadCheckTimer = null
      }
      if (this._loadCheckDeadlineTimer) {
        clearTimeout(this._loadCheckDeadlineTimer)
        this._loadCheckDeadlineTimer = null
      }
    },

    _startImageMonitoring() {
      this._clearImageMonitoring()
      const img = this.$refs.imageRef
      if (!img) return

      if (img.complete && img.naturalWidth > 0) {
        this.onImageLoad({ target: img })
        return
      }

      // hydration 期间 complete=true 且 naturalWidth=0 可能只是资源尚未就绪。
      // 这里只补偿漏掉的 load 事件，真实失败统一交给原生 error 事件。
      this._loadCheckTimer = setInterval(() => {
        const current = this.$refs.imageRef
        if (!current) {
          this._clearImageMonitoring()
          return
        }
        if (current.complete && current.naturalWidth > 0 && !this.loaded) {
          this.onImageLoad({ target: current })
        }
      }, 200)

      this._loadCheckDeadlineTimer = setTimeout(() => {
        if (this._loadCheckTimer) {
          clearInterval(this._loadCheckTimer)
          this._loadCheckTimer = null
        }
        this._loadCheckDeadlineTimer = null
      }, 10000)

      if (this.lazy && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some(entry => entry.isIntersecting)) return
          observer.disconnect()
          this._observer = null
          const current = this.$refs.imageRef
          if (current?.complete && current.naturalWidth > 0) {
            this.onImageLoad({ target: current })
          }
        }, { rootMargin: '200px' })
        observer.observe(img)
        this._observer = observer
        this._fallbackTimer = setTimeout(() => {
          observer.disconnect()
          if (this._observer === observer) this._observer = null
          this._fallbackTimer = null
        }, 5000)
      }
    },

    _unregisterFromGroup() {
      if (!this._registeredGroup || !this._registeredSrc) return
      unregisterFromGroup(this._registeredGroup, this._registeredSrc)
      this._registeredGroup = null
      this._registeredSrc = null
    },

    _syncGroupRegistration() {
      this._unregisterFromGroup()
      if (!this.zoomGroup || !this.zoomable || !this.loaded) return;
      const img = this.$refs.imageRef;
      if (!img) return;
      registerToGroup(this.zoomGroup, {
        src: this.baseZoomSrc,
        alt: this.alt || '',
        caption: this.effectiveZoomCaption,
        originEl: img,
      });
      this._registeredGroup = this.zoomGroup
      this._registeredSrc = this.baseZoomSrc
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

/* 可放大的图片：放大镜光标（不依赖 loaded 状态，避免 SSR hydration 时 cursor 不正确） */
.image-wrapper img.is-zoomable {
  cursor: zoom-in;
}

/* 加载完成后的过渡与 hover 反馈 */
.image-wrapper img.is-zoomable.loaded {
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.image-wrapper img.is-zoomable.loaded:hover {
  transform: scale(1.01);
}

.image-wrapper img.is-zoomable.loaded:active {
  transform: scale(0.99);
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
.dark .image-wrapper img {
  background: linear-gradient(45deg, #2d2d2d 25%, #3d3d3d 25%, #3d3d3d 50%, #2d2d2d 50%, #2d2d2d 75%, #3d3d3d 75%);
  background-size: 20px 20px;
}

.dark .image-placeholder {
  background: linear-gradient(45deg, #2d2d2d 25%, #3d3d3d 25%, #3d3d3d 50%, #2d2d2d 50%, #2d2d2d 75%, #3d3d3d 75%);
  background-size: 20px 20px;
}

.dark .alt-text {
  color: #aaa;
}

.dark .image-caption {
  color: #aaa;
}

.dark .has-shadow .image-wrapper img {
  /* !important 用于覆盖内联 style 的浅色阴影；深色背景下阴影更微妙，避免脏重感 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
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

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }

  .image-wrapper img,
  .image-wrapper img.is-zoomable.loaded {
    transition: none;
  }

  .image-wrapper img.is-zoomable.loaded:hover,
  .image-wrapper img.is-zoomable.loaded:active {
    transform: none;
  }
}
</style>
