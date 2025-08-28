# σ₂: System Patterns

_v1.0 | Created: 2025-08-28 | Updated: 2025-08-28_
_Π: 🚧INITIALIZING | Ω: 🔍RESEARCH_

## 🏛️ Architecture Overview

Hexo 博客项目采用经典的静态站点生成器架构，通过模板引擎和 Markdown 处理器生成静态 HTML 文件。

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Source Files  │───▶│ Hexo Engine  │───▶│  Static Site   │
│   (Markdown)    │    │ (Generator)  │    │   (HTML/CSS)   │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│     Themes      │    │   Plugins    │    │   Deployment   │
│   (AnZhiYu)     │    │ (Extensions) │    │ (GitHub Pages) │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## 🏗️ Core Components

### 📁 Directory Structure

```
blog/
├── _config.yml              # 主配置文件
├── _config.anzhiyu.yml      # 主题配置文件
├── source/                  # 源文件目录
│   ├── _posts/             # 文章目录
│   ├── about/              # 关于页面
│   ├── categories/         # 分类页面
│   ├── tags/               # 标签页面
│   └── css/                # 自定义样式
├── themes/                 # 主题目录
│   └── anzhiyu/           # AnZhiYu 主题
├── public/                # 生成的静态文件
└── memory-bank/           # 项目管理文档
```

### 🎨 Theme Architecture (AnZhiYu)

- **Layout Engine**: Pug 模板引擎
- **Style System**: Stylus 预处理器
- **Script System**: 模块化 JavaScript
- **Plugin System**: 第三方集成支持

### 🔄 Content Processing Pipeline

1. **Source Phase**: Markdown 文件编写
2. **Processing Phase**: Hexo 引擎解析和转换
3. **Theme Phase**: AnZhiYu 主题渲染
4. **Generation Phase**: 静态文件生成
5. **Deployment Phase**: 文件部署到服务器

## 🧩 Design Patterns

### 📝 Content Management Pattern

- **Front Matter**: YAML 元数据管理
- **Category Hierarchy**: 分层分类系统
- **Tag System**: 多标签标记系统
- **Asset Management**: 图片和媒体文件管理

### 🎯 Configuration Pattern

- **Layered Configuration**:
  - 全局配置 (`_config.yml`)
  - 主题配置 (`_config.anzhiyu.yml`)
  - 页面级配置 (Front Matter)

### 🔌 Plugin Architecture

- **Hook System**: 生命周期钩子
- **Filter System**: 内容过滤器
- **Helper System**: 模板辅助函数
- **Generator System**: 自定义页面生成器

## 🚀 Deployment Patterns

### 📦 Build Process

```
hexo clean → hexo generate → hexo deploy
```

### 🌐 Deployment Strategies

- **GitHub Pages**: 自动化 CI/CD
- **Cloudflare Pages**: 边缘计算部署
- **Traditional Hosting**: FTP/SFTP 部署

## 🔧 Customization Patterns

### 🎨 Theme Customization

- **Style Override**: 通过 `source/css/` 覆盖样式
- **Layout Extension**: 通过主题配置扩展布局
- **Component Addition**: 添加自定义组件

### 📱 Responsive Design

- **Mobile-First**: 移动优先设计原则
- **Breakpoint System**: 响应式断点管理
- **Progressive Enhancement**: 渐进式增强

## 🔍 SEO & Performance Patterns

### 🎯 SEO Optimization

- **Meta Tags**: 自动生成 SEO 标签
- **Sitemap**: XML 站点地图生成
- **RSS Feed**: Atom/RSS 订阅支持
- **Schema Markup**: 结构化数据标记

### ⚡ Performance Optimization

- **Asset Minification**: CSS/JS 压缩
- **Image Optimization**: 图片压缩和 WebP 支持
- **Lazy Loading**: 内容懒加载
- **CDN Integration**: 静态资源 CDN 加速

