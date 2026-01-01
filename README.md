# 静态随机图 API (Static Random Pic API)

这是一个纯静态的随机图 API 解决方案。它不依赖任何后端逻辑（如 Cloudflare Workers 或 Python 服务器），完全依靠构建时生成的静态资源和客户端 JavaScript 实现随机图功能。

## 1. 原理
构建脚本 (`build.js`) 会扫描 `ri/h` (横屏) 和 `ri/v` (竖屏) 目录下的图片，将它们随机重命名为数字序列 (1.webp, 2.webp...) 并输出到 `dist` 目录。同时生成**一个** JavaScript 文件 (`random.js`)，包含图片总数和随机逻辑。客户端加载 JS 后，会自动查找带有特殊属性的标签并插入图片链接。

## 2. 构建 (Build)
在本地运行构建脚本以生成 `dist` 目录：

```bash
node build.js
```

构建完成后，`dist` 目录即为最终产物，可直接部署到任何静态托管服务 (GitHub Pages, Vercel, Cloudflare Pages, Nginx 等)。

## 3. 配置 (Configuration)
你可以配置生成的图片 URL 前缀（域名）。

### 方法 A: 配置文件 (推荐)
修改项目根目录下的 `config.json`：
```json
{
    "domain": "https://your-domain.com"
}
```

### 方法 B: 环境变量
构建时传入环境变量 `DOMAIN` (优先级高于 config.json)：
```bash
# Linux/Mac
export DOMAIN="https://cdn.example.com"
node build.js

# Windows (PowerShell)
$env:DOMAIN="https://cdn.example.com"
node build.js
```

如果不配置，默认为空，图片路径将是相对路径 (e.g. `/ri/h/1.webp`)。

## 4. 客户端使用 (Client-Side Usage)
在你的 HTML 页面中引入生成的 JS 文件即可。

### 引入脚本
只需引入一个文件：
```html
<script src="https://your-domain.com/random.js"></script>
```

### 特性说明
*   **会话保持 (Session Persistence)**: 在同一会话期间，横屏和竖屏图片会保持不变（不会每次刷新都变，除非重新打开页面或新开会话）。
*   **Swup 支持**: 内置对 Swup 页面切换的完美支持 (`content:replace` hook)。
*   **预加载**: 背景图会自动预加载，防止闪烁。
*   ***update**: 会根据user-agent判断是否是移动端，如果是移动端，就会去加载竖屏图片。*

### 使用方法

#### 1. 背景图片 (Background Image) - 定制版
这是根据需求定制的逻辑，针对 ID 为 `bg-box` 的元素进行特殊处理。
**逻辑**：JS 会自动寻找 `id="bg-box"` 的元素，预加载一张横屏随机图，成功后设置背景，并添加 `loaded` 类名，同时设置 CSS 变量。

```html
<div id="bg-box" class="transition-opacity duration-500 opacity-0 loaded:opacity-100">
    <!-- 内容 -->
</div>
```

***定制版V2** - 适配WordPress 子比主题*

当 `#bg-box` 元素存在时，脚本会优先处理它。但是如果他不存在时，会去body的class元素中查找是否有`wp-theme-zibll`类名。如果有，就会去处理这个类名的元素。

**效果：**
*   **预加载 (Preloading)**: 只有当图片完全下载后，才会设置背景图。
*   **Loaded Class**: 图片加载完成后，元素会被添加 `.loaded` 类名。
*   **CSS 变量**: 加载完成后会自动更新 `--card-bg` 和 `--float-panel-bg` 变量。
*   **背景禁用**: 支持通过 localStorage 的 `theme-bg-disabled` 键禁用背景图。
*   **会话缓存**: 同一会话内背景图保持一致，避免频繁切换。

**背景设置方案：**
*   **方案1**：直接设置 `#bg-box` 的背景图
*   **方案2**：检测到 `wp-theme-zibll` 主题时，增强背景样式（居中、不重复、固定、覆盖）
*   **方案3**：回退到 `data-random-bg` 属性

#### 2. 通用背景图片 (Generic Background) - 备用
如果没有找到 `#bg-box`，脚本会回退到查找带有 `data-random-bg` 属性的元素。
```html
<div data-random-bg="h">横屏背景</div>
<div data-random-bg="v">竖屏背景</div>
```

#### 3. 普通图片 (img 标签)
使用 `alt` 属性来指定随机图类型。
```html
<!-- 横屏随机图 -->
<img alt="random:h" title="我的随机图片">

<!-- 竖屏随机图 -->
<img alt="random:v" style="width: 200px;">
```

### 手动调用 (高级)
JS 暴露了全局函数，你可以手动获取随机 URL：
```javascript
// 获取横屏随机图 URL (会话内保持一致)
var urlH = window.getRandomPicH(); 
console.log(urlH);

// 获取竖屏随机图 URL (会话内保持一致)
var urlV = window.getRandomPicV();
console.log(urlV);

// 设置背景禁用状态
window.setBackgroundDisabled(true);  // 禁用背景
window.setBackgroundDisabled(false); // 启用背景

// 强制刷新随机背景（更换壁纸）
window.refreshRandomBackground();
```

## 5. 画廊页面 (Gallery Page)
构建脚本会自动生成一个静态画廊页面 `dist/gallery.html`。
该页面采用瀑布流布局 (Waterfall Layout) 和懒加载 (Lazy Loading) 技术，展示所有的随机图片。
你可以直接访问 `/gallery.html` 来查看所有图片。

## 6. 目录结构
*   `ri/` - 图片源目录
    *   `ri/h/` - 放入横屏图片
    *   `ri/v/` - 放入竖屏图片
*   `dist/` - 构建产物 (部署这个文件夹)
    *   `ri/` - 处理后的图片
    *   `random.js` - **核心逻辑文件**
    *   `index.html` - 演示页面
    *   `gallery.html` - 画廊页面
*   `build.js` - 构建脚本
*   `config.json` - 配置文件

## 7. 注意事项
*   每次添加新图片后，都需要重新运行 `node build.js`。
*   构建会清空 `dist` 目录，请勿在 `dist` 中直接修改文件。
