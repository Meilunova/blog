# σ₃: Technical Context

_v1.0 | Created: 2025-08-28 | Updated: 2025-08-28_
_Π: 🚧INITIALIZING | Ω: 🔍RESEARCH_

## 🛠️ Technology Stack

### 🖥️ Frontend

- **Static Site Generator**: Hexo v7.3.0
- **Template Engine**: Pug (主题模板)
- **CSS Preprocessor**: Stylus
- **JavaScript**: ES6+ (模块化脚本)
- **Theme**: AnZhiYu (安知鱼主题)

### 🎨 UI/UX Framework

- **主题系统**: AnZhiYu 响应式主题
- **图标系统**: AnZhiYu 自定义图标字体
- **样式架构**: 基于 Stylus 的模块化样式系统
- **响应式设计**: Mobile-First 设计原则

### 📦 Package Management

- **Node.js**: 运行时环境
- **NPM**: 包管理器
- **依赖管理**: package.json + package-lock.json

### 🔧 Build Tools

- **Hexo CLI**: 命令行工具
- **Hexo Generators**: 内容生成器
- **Hexo Renderers**: 模板渲染器

## 📚 Core Dependencies

### 🏗️ Hexo Core

```json
{
  "hexo": "^7.3.0",
  "hexo-server": "^3.0.0",
  "hexo-renderer-ejs": "^2.0.0",
  "hexo-renderer-marked": "^7.0.1",
  "hexo-renderer-pug": "^3.0.0",
  "hexo-renderer-stylus": "^3.0.1"
}
```

### 📄 Content Generators

```json
{
  "hexo-generator-archive": "^2.0.0",
  "hexo-generator-category": "^2.0.0",
  "hexo-generator-tag": "^2.0.0",
  "hexo-generator-index-pin-top": "^0.2.2",
  "hexo-generator-sitemap": "^3.0.1",
  "hexo-generator-feed": "^3.0.0"
}
```

### 🔍 Search & SEO

```json
{
  "hexo-generator-search": "^2.4.3",
  "hexo-generator-searchdb": "^1.5.0",
  "hexo-wordcount": "^6.0.1"
}
```

### 🚀 Deployment

```json
{
  "hexo-deployer-git": "^4.0.0"
}
```

## ⚙️ Environment Configuration

### 🌍 Development Environment

- **Node.js Version**: 建议 16.x+
- **操作系统**: Windows 10/11
- **Shell**: PowerShell
- **编辑器**: 支持 Markdown 和 YAML 的编辑器

### 📁 Project Structure

```
F:\HexoBlog\blog/
├── 📁 source/           # 源文件目录
├── 📁 themes/anzhiyu/   # AnZhiYu 主题
├── 📁 public/           # 生成的静态文件
├── 📁 node_modules/     # 依赖包
├── 📁 memory-bank/      # 项目管理文档
├── 📄 _config.yml       # Hexo 主配置
├── 📄 _config.anzhiyu.yml # 主题配置
└── 📄 package.json      # 项目依赖
```

### 🔧 Build Scripts

```json
{
  "build": "hexo clean && hexo generate",
  "clean": "hexo clean",
  "deploy": "hexo deploy",
  "server": "hexo server",
  "dev": "hexo server",
  "start": "hexo server"
}
```

## 🎯 Site Configuration

### 🌐 Site Settings

- **Title**: Mike_Tea
- **Subtitle**: "分享生活中的小美好"
- **Author**: 奶茶味的香草
- **Language**: zh-CN
- **Timezone**: Asia/Shanghai
- **URL**: https://meilunova.github.io

### 📝 Content Settings

- **Post Format**: Markdown
- **Permalink**: `:year/:month/:day/:title/`
- **Pagination**: 10 posts per page
- **Syntax Highlighting**: highlight.js (mac theme)

### 🔍 SEO & Analytics

- **Search**: XML search index
- **Sitemap**: XML sitemap generation
- **RSS Feed**: Atom feed support
- **Meta Generator**: Enabled

## 🚀 Deployment Configuration

### 📦 GitHub Pages

- **Repository**: `git@github.com:Meilunova/Meilunova.github.io.git`
- **Branch**: main
- **Deploy Method**: hexo-deployer-git

### 🔄 CI/CD Pipeline

- **Build Command**: `hexo clean && hexo generate`
- **Deploy Command**: `hexo deploy`
- **Automation**: 支持 GitHub Actions (可选)

## 🎨 Theme Configuration

### 🖼️ AnZhiYu Theme Features

- **Menu System**: 多级导航菜单
- **Code Highlighting**: Mac 风格代码高亮
- **Comment System**: 支持多种评论系统
- **Social Integration**: 社交媒体集成
- **Custom CSS**: 支持自定义样式覆盖

### 🎯 Theme Customization

- **Custom CSS**: `source/css/custom.css`
- **Custom Assets**: `source/img/` 目录
- **Layout Overrides**: 主题配置文件定制

## 🔧 Development Workflow

### 📝 Content Creation

1. **新文章**: `hexo new post "文章标题"`
2. **新页面**: `hexo new page "页面名称"`
3. **草稿管理**: `hexo new draft "草稿标题"`

### 🔄 Build & Preview

1. **本地预览**: `hexo server`
2. **清理缓存**: `hexo clean`
3. **生成静态文件**: `hexo generate`
4. **部署**: `hexo deploy`

### 🧪 Testing & Validation

- **本地测试**: http://localhost:4000
- **响应式测试**: 多设备预览
- **SEO 检查**: 元数据和链接验证
- **性能测试**: 页面加载速度检查
