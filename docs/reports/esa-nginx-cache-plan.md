# 阿里云 ESA 边端加速缓存优化方案书(Nginx 源站侧)

> 针对 MiragEdge 文档站(VitePress SSG)在阿里云 ESA 边端加速下出现的「页面元素异常、CSS 丢失」问题,从源站 Nginx 缓存响应头层面给出适配方案。本方案与前端正文的版本检测([useVersionCheck.ts](file:///f:/MiragEdge-DocWeb/.vitepress/theme/composables/useVersionCheck.ts))协同工作。

## 一、问题现象与根因

### 1.1 现象
- 部署更新后,部分用户页面 CSS 样式丢失、元素异常
- 偶发性,硬刷新(Ctrl+F5)可能恢复

### 1.2 根因
VitePress 构建产物结构:
- `*.html` — 预渲染页面,内部引用带 hash 的 `/assets/*-[hash].js|css`
- `/assets/*-[hash].js|css` — 带 content hash 的构建资源(内容变则 hash 变)
- `public/*` — 不带 hash 的静态资源(图片、favicon、manifest 等)

**核心矛盾:ESA 边缘缓存的 HTML 与源站 assets 版本不一致**

| 场景 | ESA 缓存内容 | 源站现状 | 结果 |
|---|---|---|---|
| A(最常见) | 旧 HTML(引用 `style.aaa.css`) | 新部署,旧 hash 资源已被覆盖/删除 | 浏览器请求 `style.aaa.css` 回源 404 → **CSS 丢失** |
| B | 新 HTML + 旧 chunk 残留 | — | SPA 路由动态 import 旧 chunk 404 → 页面元素异常 |
| C | HTML 边缘缓存过久 | 已更新 | 部署后迟迟不生效 |

### 1.3 现状源站配置问题
当前 [.DockerCompose/default.conf](file:///f:/MiragEdge-DocWeb/.DockerCompose/default.conf) 的 `miragedge.top` server 块:
- `/assets/` 已设 `expires 1y; immutable` ✅ 正确(带 hash 可长期缓存)
- **HTML 无任何 `Cache-Control` 指令** ❌ ESA 使用默认策略,缓存时长不可控
- **无 `s-maxage`** ❌ ESA 不知该缓存多久,可能长时间缓存旧 HTML
- **`add_header` 继承缺陷** ⚠️ `location ~* ^/assets/` 内的 `add_header Cache-Control` 会使 server 级安全头(X-Frame-Options 等)不被继承到 assets 响应

## 二、优化目标

| 资源类型 | 浏览器缓存 | ESA 边缘缓存 | 部署后收敛时间 |
|---|---|---|---|
| HTML 页面 | 每次校验(`max-age=0`) | 短缓存 + SWR(`s-maxage=60`) | ≤60s |
| `/assets/*-[hash]` | 1 年 immutable | 1 年 immutable | 即时(新 hash 即新 URL) |
| `public/*` 无 hash 资源 | 1 天 | 1 天 | ≤1 天(前端版本检测兜底) |
| `/version.json` | 不缓存 | 不缓存 | 即时 |

## 三、Nginx 配置方案

### 3.1 完整 default.conf(miragedge.top server 块)

```nginx
# miragedge.top 的配置
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_static on;

    listen 80;
    server_name miragedge.top;
    index index.html;

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "OK";
    }

    # 版本探测文件:前端 useVersionCheck 以 no-store 拉取,源站与 ESA 均禁止缓存
    # 这是 ESA 场景下"快速发现新部署"的关键,必须始终回源
    location = /version.json {
        root /web_miragedge;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        add_header X-Content-Type-Options "nosniff" always;
        expires off;
        access_log off;
        try_files $uri =404;
    }

    # 带内容 hash 的构建资源:文件名含 [hash],内容变更 hash 必变 → 可长期 immutable
    # VitePress 产物(js/css/字体)均在此目录
    # 使用 ^~ 前缀匹配,优先级高于正则,且更高效
    location ^~ /assets/ {
        root /web_miragedge;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header X-Content-Type-Options "nosniff" always;
        access_log off;
        try_files $uri =404;
    }

    # HTML 页面:短边缘缓存 + stale-while-revalidate
    # - s-maxage=60         :ESA 边缘缓存 60s(部署后最多 60s 内全节点收敛)
    # - max-age=0           :浏览器每次向 ESA 校验(走 ETag/304,不重复下载)
    # - stale-while-revalidate=60:ESA 在回源刷新期间可返回旧副本,用户零等待
    location ~* \.html$ {
        root /web_miragedge;
        add_header Cache-Control "public, max-age=0, s-maxage=60, stale-while-revalidate=60" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # 根路径与其他静态资源
    location / {
        root /web_miragedge;
        try_files $uri $uri.html $uri/ =404;
        error_page 404 /404.html;
        error_page 403 /404.html;

        # public/ 下无 hash 资源(图片/favicon/字体/manifest):中等缓存,避免长期陈旧
        # 前端 useVersionCheck 检测到新版本时会 reload,作为兜底
        location ~* \.(?:png|jpe?g|gif|webp|ico|svg|woff2?|ttf|eot|webmanifest)$ {
            expires 1d;
            add_header Cache-Control "public, max-age=86400" always;
            add_header X-Content-Type-Options "nosniff" always;
            access_log off;
            try_files $uri =404;
        }
    }

    # 安全响应头(作用于所有未在 location 内显式 add_header 的响应)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
}
```

### 3.2 关键改动说明

1. **新增 `location = /version.json`**:精确匹配,`no-store` 禁缓存,保证前端版本检测始终拿到最新值。**这是与前端正文的 `useVersionCheck` 协同的关键**。
2. **新增 `location ~* \.html$`**:HTML 短边缘缓存 + SWR,解决场景 A/C。
3. **`/assets/` 改用 `^~` 前缀匹配**:优先级高于正则,且更高效;补充 `X-Content-Type-Options`。
4. **新增无 hash 静态资源规则**:1 天缓存,避免图片等长期陈旧。
5. **`add_header ... always`**:确保 4xx/5xx 响应也带缓存头,避免 ESA 缓存错误页。

### 3.3 关于 `add_header` 继承(重要)

Nginx 规则:**当 location 内有任何 `add_header` 时,不继承 server 级的 `add_header`**。原配置中 `location ~* ^/assets/` 有 `add_header Cache-Control`,导致 assets 响应丢失所有安全头(X-Frame-Options 等)。本方案在每个带 `add_header` 的 location 内显式补齐 `X-Content-Type-Options`,并保留 server 级安全头作用于其余响应。

> 若希望安全头集中维护,可抽到 `security-headers.conf` 用 `include` 引入,避免重复:
> ```nginx
> # /etc/nginx/snippets/security-headers.conf
> add_header X-Frame-Options "SAMEORIGIN" always;
> add_header X-Content-Type-Options "nosniff" always;
> # ... 其余安全头
> ```
> 然后在每个 location 内 `include /etc/nginx/snippets/security-headers.conf;`。

## 四、缓存策略矩阵

| 路径匹配 | 资源示例 | Cache-Control | 浏览器 TTL | ESA 边缘 TTL | 说明 |
|---|---|---|---|---|---|
| `= /version.json` | `version.json` | `no-store, no-cache, must-revalidate` | 不缓存 | 不缓存 | 版本探测,必须始终回源 |
| `^~ /assets/` | `index-a1b2c3.js` | `public, max-age=31536000, immutable` | 1 年 | 1 年 | 带 hash,内容变则 URL 变 |
| `~* \.html$` | `features/index.html` | `public, max-age=0, s-maxage=60, stale-while-revalidate=60` | 每次校验 | 60s + SWR | 短缓存快速收敛 |
| `~* \.(png\|jpg\|...)` | `public/images/*.png` | `public, max-age=86400` | 1 天 | 1 天 | 无 hash,中等缓存 |

## 五、ESA 控制台配合建议

源站 `Cache-Control` 已足够,ESA 默认遵循(RFC 7234)。以下为可选增强:

1. **缓存策略遵循源站**:确认 ESA 缓存模式设为「遵循源站」(默认),不要在 ESA 控制台对 HTML 配置长缓存覆盖源站。
2. **查询字符串处理**:`version.json` 的 `?t=<nonce>` 仅用于浏览器破缓存。若 ESA 开启了「按查询字符串区分缓存」,需为 `version.json` 配规则忽略查询字符串,否则每个 nonce 都会触发回源(虽不影响正确性,但浪费)。
3. **部署后主动刷新(可选)**:若希望部署后立即生效(不等 60s),可在 CI 完成后调用 ESA API 刷新 HTML 缓存(URL 列表为站点所有页面路径,或直接刷新 `/*`)。**不要刷新 `/assets/`**——带 hash 资源无需刷新,长缓存有益无害。
4. **Edge Functions 慎用**:若使用了 ESA Edge Functions 改写响应,确保不破坏 `Cache-Control` 头。

## 六、与前端版本检测的协同

本仓库已实现前端版本检测([useVersionCheck.ts](file:///f:/MiragEdge-DocWeb/.vitepress/theme/composables/useVersionCheck.ts)),与源站策略协同:

```
用户浏览页面
  ├─ 首屏 30s 后 / 每 10min / 路由切换后 2s
  │     └─ fetch /version.json?t=<nonce> (no-store, 始终拿最新)
  │           └─ 与当前 HTML <meta name="x-build-id"> 不一致
  │                 └─ window.location.reload() (sessionStorage 防同版本循环)
  └─ <script>/<link> 加载失败 或 动态 import() reject
        └─ window.location.reload() (session 级防循环,只 reload 一次)
```

**关键依赖**:前端以 `no-store` 拉取 `version.json`,**必须配合源站 `Cache-Control: no-store`**。若 ESA 缓存了旧 `version.json`,版本检测会失效——这正是本方案 `location = /version.json` 的设计目的。

## 七、部署后验证

部署新 `default.conf` 后,用 curl 验证响应头:

```bash
# 1. version.json 必须是 no-store(关键)
curl -I "https://miragedge.top/version.json?t=123"
# 期望: cache-control: no-store, no-cache, must-revalidate

# 2. HTML 必须有 s-maxage=60
curl -I https://miragedge.top/
# 期望: cache-control: public, max-age=0, s-maxage=60, stale-while-revalidate=60

# 3. assets 必须 immutable
curl -I https://miragedge.top/assets/<某hash>.js
# 期望: cache-control: public, max-age=31536000, immutable

# 4. 部署新版本后,观察 ESA 节点收敛
curl -I https://miragedge.top/   # Age 头应 ≤60;多次请求观察 HTML 是否更新
```

## 八、回滚

若出现问题,恢复原 `default.conf` 的 `location /` 块即可。前端版本检测为容错设计,**即使源站未改也不会造成问题**(只是收敛更慢),可独立部署。
