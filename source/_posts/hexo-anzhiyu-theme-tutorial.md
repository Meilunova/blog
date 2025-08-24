---
title: Hexo博客美化教程 - AnZhiYu主题配置
date: 2025-07-21 15:00:00
updated: 2025-01-21 15:00:00
tags:
  - 前端开发
  - Hexo
  - 博客搭建
  - AnZhiYu主题
  - 主题配置
categories:
  - 前端开发
  - 博客搭建
keywords: Hexo, AnZhiYu, 主题配置, 博客美化, 前端开发, 博客搭建
description: 详细介绍AnZhiYu主题的安装和配置方法，从基本配置到进阶设置，帮助你打造一个独具个性的博客网站。完整的配置教程和实用技巧分享。
cover: https://pub-56bf4aab86514a6684f7dc2b7b994a1f.r2.dev/880D5513CE944E1AF6DDE7443D11666A.jpg
top_img: https://pub-56bf4aab86514a6684f7dc2b7b994a1f.r2.dev/880D5513CE944E1AF6DDE7443D11666A.jpg
comments: true
toc: true
toc_number: true
copyright: true
copyright_author: 奶茶味的香草
copyright_author_href: https://github.com/Meilunova
copyright_url: https://meilunova.github.io
copyright_info: 本文由奶茶味的香草原创，转载请注明出处
original: true
type: original
mathjax: false
katex: false
aplayer: false
highlight_shrink: false
aside: true
swiper_index: 7
top_group_index: 7
ai:
  - 这篇文章详细介绍了AnZhiYu主题的完整配置流程
  - 包含从安装到美化的所有步骤和技巧
  - 适合想要搭建个人博客的开发者参考
  - 提供了完整的配置示例和实用建议
---

<!-- more -->

在上一篇文章中，我们介绍了如何搭建一个基础的 Hexo 博客。今天，我将为大家带来 AnZhiYu 主题的安装和配置教程。AnZhiYu 是一款美观、功能丰富的 Hexo 主题，通过本教程，你将能够让你的博客焕然一新，拥有更加个性化的外观和功能。

## 1. 安装安知鱼主题

### 1.1. Git 安装

在博客根目录执行以下命令安装最新版主题：

```bash
git clone -b main https://github.com/anzhiyu-c/hexo-theme-anzhiyu.git themes/anzhiyu
```

第一次使用需要安装 pug 以及 stylus 的渲染器：

```bash
npm install hexo-renderer-pug hexo-renderer-stylus --save
```

### 1.2. 应用主题

修改 hexo 配置文件`_config.yml`，把主题改为`anzhiyu`：

```yaml
theme: anzhiyu
```

### 1.3. 覆盖配置

为了减少主题升级时的冲突，推荐使用覆盖配置的方式。

Linux 系统执行以下命令：

```bash
cp -rf ./themes/anzhiyu/_config.yml ./_config.anzhiyu.yml
```

Windows 系统手动将`/themes/anzhiyu/_config.yml`复制到根目录下并重命名为`_config.anzhiyu.yml`，或使用以下命令：

```bash
cp themes/anzhiyu/_config.yml _config.anzhiyu.yml
```

注意：

- 不要把主题目录的 `_config.yml` 删掉
- 以后只需要在 `_config.anzhiyu.yml` 进行配置就行
- 如果使用了 `_config.anzhiyu.yml`，配置主题的 `_config.yml` 将不会有效果

### 1.4. 本地预览与部署

```bash
# 本地预览
hexo cl; hexo s

# 生成并部署
hexo cl; hexo g; hexo d
```

## 2. 创建必要页面

### 2.1. 标签页和分类页

生成标签页：

```bash
hexo new page tags
```

修改 `source/tags/index.md`：

```yaml
---
title: 标签
date: 2025-07-21 12:00:00
type: "tags"
comments: false
top_img: false
---
```

生成分类页：

```bash
hexo new page categories
```

修改 `source/categories/index.md`：

```yaml
---
title: 分类
date: 2025-07-21 12:00:00
type: "categories"
comments: false
top_img: false
---
```

## 3. 配置文章模版

### 3.1. post.md 模版参考

在`scaffolds/post.md`中配置以下内容：

```yaml
---
title: {{ title }}
date: {{ date }}
updated:
tags:
categories:
keywords:
description:
top:
top_img:
comments:
cover: https://img.090227.xyz/file/ae62475a131f3734a201c.png
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
swiper_index: 10
top_group_index: 10
ai:
background: "#fff"
---

<div class="video-container">
[up主专用，视频内嵌代码贴在这]
</div>

<style>
.video-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 aspect ratio (height/width = 9/16 * 100%) */
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
```

### 3.2. page.md 模版参考

在`scaffolds/page.md`中配置以下内容：

```yaml
---
title: { { title } }
date: { { date } }
type:
updated:
comments:
description:
keywords:
top_img: https://img.090227.xyz/file/ae62475a131f3734a201c.png
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
top_single_background:
---
```

## 4. 主题基本配置

### 4.1. 菜单配置

菜单配置决定了网站顶部的导航栏内容，可以根据自己的需求进行调整：

```yaml
menu:
  文章:
    隧道: /archives/ || anzhiyu-icon-box-archive
    分类: /categories/ || anzhiyu-icon-shapes
    标签: /tags/ || anzhiyu-icon-tags
  友链:
    友人帐: /link/ || anzhiyu-icon-link
    朋友圈: /fcircle/ || anzhiyu-icon-artstation
    留言板: /comments/ || anzhiyu-icon-envelope
  我的:
    音乐馆: /music/ || anzhiyu-icon-music
    相册集: /album/ || anzhiyu-icon-images
    小空调: /air-conditioner/ || anzhiyu-icon-fan
  关于:
    关于本人: /about/ || anzhiyu-icon-paper-plane
    闲言碎语: /essay/ || anzhiyu-icon-lightbulb
    随便逛逛: javascript:toRandomPost() || anzhiyu-icon-shoe-prints1
```

格式为：`页面名称: 链接地址 || 图标`，其中图标使用的是 AnZhiYu 主题内置的图标库。

### 4.2. 社交链接配置

在侧边栏展示你的社交媒体链接：

```yaml
social:
  Github: https://github.com/你的用户名 || anzhiyu-icon-github
  BiliBili: https://space.bilibili.com/你的ID || anzhiyu-icon-bilibili
  QQ: tencent://Message/?Uin=你的QQ号 || anzhiyu-icon-qq
  微博: https://weibo.com/你的用户名 || anzhiyu-icon-weibo
  知乎: https://www.zhihu.com/people/你的ID || anzhiyu-icon-zhihu
```

### 4.3. 头像配置

设置你的个人头像：

```yaml
avatar:
  img: /img/avatar/Avatar.jpg
  effect: true
```

### 4.4. 首页封面配置

配置首页顶部的封面图片和标题：

```yaml
banner:
  tips: 个人博客
  title: 我的博客标题
  image: /img/4CB4B9060DB50206C98341C4CD589637.jpg
  link: /
```

### 4.5. 网站图标配置

设置网站的 favicon 图标：

```yaml
favicon: /favicon.ico
```

## 5. 更多功能配置

### 5.1. 新建文章

使用以下命令创建新文章：

```bash
hexo new post "文章标题"
```

### 5.2. 文章封面

AnZhiYu 主题支持为每篇文章设置封面图片，在文章的 Front Matter 中添加：

```yaml
cover: https://your-image-url.jpg
```

### 5.3. 文章置顶

在文章的 Front Matter 中添加：

```yaml
top: true
```

### 5.4. 评论系统

AnZhiYu 主题支持多种评论系统，如 Gitalk、Valine 等。在主题配置文件中进行相应配置。

## 6. 高级配置

### 6.1. 自定义 CSS

创建 `source/css/custom.css` 文件，添加自定义样式：

```css
/* 自定义样式 */
.custom-style {
  color: #333;
  font-size: 16px;
}
```

### 6.2. 自定义 JavaScript

创建 `source/js/custom.js` 文件，添加自定义脚本：

```javascript
// 自定义脚本
console.log("Hello AnZhiYu!");
```

### 6.3. 背景设置

配置网站背景：

```yaml
background:
  url: /img/background.jpg
  opacity: 1
```

## 7. 部署与优化

### 7.1. 生成静态文件

```bash
hexo generate
```

### 7.2. 部署到服务器

```bash
hexo deploy
```

### 7.3. 性能优化

- 压缩图片大小
- 使用 CDN 加速
- 启用缓存机制

## 8. 参考资源

- [安知鱼主题官方文档](https://docs.anheyu.com/initall.html)
- [安知鱼主题 GitHub 仓库](https://github.com/anzhiyu-c/hexo-theme-anzhiyu)
- [博客美化参考](https://www.fomal.cc/posts/4aa2d85f.html)

## 总结

通过本教程，你应该已经成功安装并配置了 AnZhiYu 主题。这个主题提供了丰富的自定义选项，你可以根据自己的喜好进行进一步的个性化设置。

如果你在配置过程中遇到任何问题，欢迎在评论区留言讨论。祝你的博客之旅愉快！
