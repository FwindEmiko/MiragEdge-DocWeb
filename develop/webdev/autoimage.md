# 图片自动化模块

这是一个 Vue 组件，用于在文档网站中快速、优雅地插入图片，支持懒加载、圆角、阴影、边框等多种样式控制。

## 组件配置参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `src` | `String` | — | 是 | 图片路径（支持相对路径或绝对 URL） |
| `alt` | `String` | `''` | 否 | 替代文本 |
| `caption` | `String` | `''` | 否 | 图片说明文字（显示在图片下方） |
| `width` | `Number` / `String` | `null` | 否 | 图片宽度（例如 `400` 或 `'100%'`） |
| `height` | `Number` / `String` | `null` | 否 | 图片高度（不建议同时指定宽高，以免变形） |
| `maxWidth` | `Number` / `String` | `null` | 否 | 图片最大宽度（例如 `'200px'`） |
| `radius` | `String` / `Number` / `Boolean` | `'auto'` | 否 | 圆角设置：`'auto'`（根据图片长宽比自动计算）、具体值（如 `'8px'`）、`false`（无圆角） |
| `shadow` | `String` / `Boolean` | `true` | 否 | 阴影效果：`true`（默认阴影）、CSS 阴影字符串、`false`（无阴影） |
| `border` | `Boolean` / `String` | `false` | 否 | 边框设置：`true`（默认浅灰边框）、CSS 边框字符串、`false`（无边框） |
| `showInfo` | `Boolean` | `false` | 否 | 是否显示图片信息（如图片尺寸），目前为预留字段 |
| `lazy` | `Boolean` | `false` | 否 | 是否启用浏览器原生懒加载：`true` 为懒加载，`false` 为立即加载 |

> **注意**：`showInfo` 功能暂未实现，预留供后续扩展。

## 基础用法

最简单的图片插入，不带任何样式修饰。

<SmartImage src="https://picsum.photos/400/300?random=1" alt="示例图片" />

```html
<SmartImage src="https://picsum.photos/400/300?random=1" alt="示例图片" />
```

## 带说明文字

通过 `caption` 属性添加图片下方的说明文字。

<SmartImage 
  src="https://picsum.photos/400/300?random=2" 
  alt="示例图片"
  caption="这是一张示例图片的说明文字"
/>

```html
<SmartImage 
  src="https://picsum.photos/400/300?random=2" 
  alt="示例图片"
  caption="这是一张示例图片的说明文字"
/>
```

## 尺寸控制

### 固定宽度

指定 `width` 属性，图片将按该宽度等比例缩放。

<SmartImage 
  src="https://picsum.photos/400/300?random=3" 
  width="400"
  caption="固定宽度 400px"
/>

```html
<SmartImage 
  src="https://picsum.photos/400/300?random=3" 
  width="400"
  caption="固定宽度 400px"
/>
```

### 限制最大宽度

使用 `maxWidth` 限制图片最大宽度，在移动端自适应时尤其有用。

<SmartImage 
  src="https://picsum.photos/400/300?random=4" 
  maxWidth="200px"
  caption="最大宽度 200px"
/>

```html
<SmartImage 
  src="https://picsum.photos/400/300?random=4" 
  maxWidth="200px"
  caption="最大宽度 200px"
/>
```

## 圆角样式

### 自动圆角（默认）

`radius="auto"` 会根据图片的长宽比自动选择合适的圆角大小：接近正方形的图片圆角较大，长条形图片圆角较小。

<SmartImage 
  src="https://picsum.photos/400/300?random=5"
  radius="auto"
  caption="自动圆角"
/>

### 自定义圆角

传入任何合法的 CSS 圆角值。

<SmartImage 
  src="https://picsum.photos/400/300?random=6"
  radius="22px"
  caption="22px 圆角"
/>

### 无圆角

设置 `:radius="false"` 完全去除圆角。

<SmartImage 
  src="https://picsum.photos/400/300?random=7"
  :radius="false"
  caption="无圆角"
/>

```html
<!-- 自动圆角 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=5"
  radius="auto"
  caption="自动圆角"
/>

<!-- 自定义圆角 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=6"
  radius="22px"
  caption="22px 圆角"
/>

<!-- 无圆角 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=7"
  :radius="false"
  caption="无圆角"
/>
```

## 阴影效果

### 默认阴影

`shadow` 属性为 `true` 时应用预设的浅阴影。

<SmartImage 
  src="https://picsum.photos/400/300?random=8"
  shadow
  caption="默认阴影"
/>

### 自定义阴影

传入 CSS `box-shadow` 字符串自定义阴影效果。

<SmartImage 
  src="https://picsum.photos/400/300?random=9"
  shadow="0 2px 8px rgba(0, 0, 0, 0.1)"
  caption="轻阴影"
/>

### 无阴影

设置 `:shadow="false"` 移除阴影。

<SmartImage 
  src="https://picsum.photos/400/300?random=10"
  :shadow="false"
  caption="无阴影"
/>

```html
<!-- 默认阴影 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=8"
  shadow
  caption="默认阴影"
/>

<!-- 自定义阴影 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=9"
  shadow="0 2px 8px rgba(0, 0, 0, 0.1)"
  caption="轻阴影"
/>

<!-- 无阴影 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=10"
  :shadow="false"
  caption="无阴影"
/>
```

## 边框

### 默认边框

`border` 属性为 `true` 时添加 1px 浅灰色边框。

<SmartImage 
  src="https://picsum.photos/400/300?random=11"
  border
  caption="默认边框"
/>

### 自定义边框

传入完整的 CSS `border` 值。

<SmartImage 
  src="https://picsum.photos/400/300?random=12"
  border="4px solid #eaecef"
  caption="自定义边框"
/>

### 无边框

`border` 默认即为 `false`，也可显式设置。

<SmartImage 
  src="https://picsum.photos/400/300?random=13"
  :border="false"
  caption="无边框"
/>

```html
<!-- 默认边框 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=11"
  border
  caption="默认边框"
/>

<!-- 自定义边框 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=12"
  border="4px solid #eaecef"
  caption="自定义边框"
/>

<!-- 无边框 -->
<SmartImage 
  src="https://picsum.photos/400/300?random=13"
  :border="false"
  caption="无边框"
/>
```

## 懒加载控制

通过 `lazy` 属性控制图片的加载时机。

- **`lazy` 默认 `false`**：图片立即加载（`loading="eager"`），适用于首屏重要图片。
- **`lazy` 设为 `true`**：启用浏览器原生懒加载（`loading="lazy"`），图片将在即将进入视口时才开始加载，可优化页面加载性能。

<SmartImage 
  src="https://picsum.photos/400/300?random=14"
  :lazy="true"
  caption="启用懒加载（向下滚动可见）"
/>

```html
<SmartImage 
  src="https://picsum.photos/400/300?random=14"
  :lazy="true"
  caption="启用懒加载（向下滚动可见）"
/>
```

> **注意**：懒加载效果依赖于浏览器支持，且图片的 `load` 事件会在图片真正加载完成后触发。本组件已内部处理 SSR 场景下的状态同步，确保首次加载也能正确显示。

## 综合示例

组合使用多种属性，展示图片的高级样式。

<SmartImage 
  src="https://picsum.photos/800/600?random=15"
  alt="综合示例"
  caption="综合功能演示：自动圆角、阴影、边框"
  width="600"
  radius="auto"
  shadow
  border
/>

```html
<SmartImage 
  src="https://picsum.photos/800/600?random=15"
  alt="综合示例"
  caption="综合功能演示：自动圆角、阴影、边框"
  width="600"
  radius="auto"
  shadow
  border
/>
```

## 图片画廊

利用 CSS Grid 或 Flexbox 结合组件，可快速构建图片画廊。

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 2rem 0;">
  <SmartImage 
    src="https://picsum.photos/400/300?random=16"
    alt="图片1"
    radius="8px"
    shadow
  />
  <SmartImage 
    src="https://picsum.photos/400/300?random=17"
    alt="图片2"
    radius="8px"
    shadow
  />
  <SmartImage 
    src="https://picsum.photos/400/300?random=18"
    alt="图片3"
    radius="8px"
    shadow
  />
</div>

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 2rem 0;">
  <SmartImage 
    src="https://picsum.photos/400/300?random=16"
    alt="图片1"
    radius="8px"
    shadow
  />
  <SmartImage 
    src="https://picsum.photos/400/300?random=17"
    alt="图片2"
    radius="8px"
    shadow
  />
  <SmartImage 
    src="https://picsum.photos/400/300?random=18"
    alt="图片3"
    radius="8px"
    shadow
  />
</div>
```

## 注意事项

1. **图片路径**：`src` 支持相对路径（相对于当前文档）和绝对 URL。若使用相对路径，请确保构建工具能正确处理。
2. **缓存问题**：示例中使用 `random` 参数避免浏览器缓存，实际使用时请使用稳定的图片地址。
3. **SSR 兼容**：组件已通过 `mounted` 钩子处理服务端渲染场景，确保图片加载状态正确同步。
4. **原生懒加载**：`lazy` 属性依赖浏览器原生 `loading="lazy"`，不支持老旧浏览器，可配合第三方懒加载库使用。