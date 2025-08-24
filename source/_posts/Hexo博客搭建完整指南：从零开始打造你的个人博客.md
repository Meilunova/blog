---
title: Hexo博客搭建完整指南：从零开始打造你的个人博客
cover: https://pub-56bf4aab86514a6684f7dc2b7b994a1f.r2.dev/E457C9CABAC56F731806EBE74B9CFEEF.jpg
swiper_index: 1
top_group_index: 1
background: "#FAF0E6"
date: 2025-07-21 18:06:21
updated: 2025-07-21 18:06:21
tags:
  - Hexo
  - 博客搭建
  - GitHub Pages
  - Cloudflare Pages
  - 技术教程
categories:
  - 技术分享
keywords: Hexo,博客搭建,GitHub Pages,静态博客,个人网站,免费博客
description: 详细的Hexo博客搭建教程，从环境配置到部署上线，手把手教你打造属于自己的个人博客。完全免费，无需服务器，适合新手入门。
top: false
top_img: https://pub-56bf4aab86514a6684f7dc2b7b994a1f.r2.dev/E457C9CABAC56F731806EBE74B9CFEEF.jpg
comments: true
toc: true
toc_number: true
toc_style_simple: false
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

aside: true
ai: false
---

{% note info modern flat %}
💡 **写在前面**
大家好，我是奶茶味的香草！今天为大家带来一篇超详细的 Hexo 博客搭建教程。作为一个热爱分享的技术爱好者，我希望通过这篇文章帮助更多朋友拥有属于自己的个人博客。这个教程完全免费，不需要购买服务器，跟着我一步步来，你也能拥有一个漂亮的个人网站！
{% endnote %}

## 🌟 什么是 Hexo？

Hexo 是一个快速、简洁且高效的博客框架，基于 Node.js 开发。它使用 Markdown 语法来编写文章，能够快速生成静态网页，并且可以轻松部署到 GitHub Pages、Cloudflare Pages 等免费平台。

{% tabs hexo-features %}

<!-- tab 🚀 快速生成 -->

Hexo 拥有超快的生成速度，数百个页面在几秒内瞬间完成渲染

<!-- endtab -->

<!-- tab 📝 Markdown 支持 -->

支持 GitHub Flavored Markdown 的所有功能，甚至可以使用大多数的 Octopress 插件

<!-- endtab -->

<!-- tab 🎨 丰富主题 -->

拥有强大的主题系统，一键切换主题，轻松定制外观

<!-- endtab -->

<!-- tab 🔌 插件丰富 -->

强大的插件系统，支持 Jade、CoffeeScript 等多种模板引擎

<!-- endtab -->

{% endtabs %}

## 📋 事前准备

在开始搭建博客前，我们需要准备以下几项：

- ✅ 域名（非必须，可以使用免费域名，或者 GitHub.io 或 Pages.dev 分配的域名）
- ✅ GitHub 账号（必须，需要注册一个 GitHub 帐号用于托管博客）
- ⭕ Cloudflare 账号（非必须，可以用于 CDN 加速，也可以直接使用 GitHub.io 分配的域名）

## 💻 软件支持

进行 Hexo 博客搭建，我们需要以下软件：

{% note success flat %}
**必须安装的软件**

- Node.js（JavaScript 运行环境）
- Git（版本控制工具）
  {% endnote %}

{% note info flat %}
**推荐安装的软件**

- VSCode（轻量型代码编辑器，有助于养成良好编程习惯）
  {% endnote %}

### 🟢 安装 Node.js

1. 前往 [Node.js 官网](https://nodejs.org/en) 下载与系统相匹配的安装程序
2. 安装时使用默认目录 `C:/Program Files/nodejs/`
3. 安装完成后，验证安装：按 `Win+R` 打开 CMD 窗口，执行以下命令：

```bash
node -v
npm -v
```

4. 修改 npm 源以加快下载速度：

```bash
npm config set registry https://mirrors.huaweicloud.com/repository/npm/
```

### 🟠 安装 Git

1. 前往 [Git 官网](https://git-scm.com/downloads) 下载适合当前系统的版本
2. 按默认设置安装，推荐使用默认目录 `C:/Program Files/Git`
3. 安装完成后，可以在开始菜单找到以下三个程序：
   - `Git CMD`：Windows 命令行风格
   - `Git Bash`：Linux 系统命令风格（**推荐使用**）
   - `Git GUI`：图形界面（不建议新手使用）

## 🔑 配置 Git 密钥并连接至 GitHub

### 👤 配置用户名和邮箱

打开 Git Bash（从开始菜单或右键菜单中选择），输入以下命令配置用户名和邮箱：

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

### 🔐 配置公钥连接 GitHub

**第一步：生成 SSH 密钥**

在 Git Bash 中生成 SSH 密钥：

```bash
ssh-keygen -t rsa -C "你的邮箱"
```

按三次回车即可生成密钥（默认保存位置、无密码保护）

**第二步：查看公钥**

在 Git Bash 中查看公钥：

```bash
cat ~/.ssh/id_rsa.pub
```

或在 Windows 资源管理器中打开文件 `C:\Users\你的用户名\.ssh\id_rsa.pub`

**第三步：添加公钥到 GitHub**

复制公钥内容，登录 GitHub 网站，进入 `Settings` → `SSH and GPG keys` → `New SSH key`，将公钥粘贴进去，点击 `Add SSH key`

**第四步：验证连接**

在 Git Bash 中验证连接：

```bash
ssh -T git@github.com
```

如果是首次连接，会出现以下提示：

```
The authenticity of host 'github.com (20.205.243.166)' can't be established.
ECDSA key fingerprint is SHA256:p2QAMXNIC1TJYWeIOttrVc98/R1BUFWu3/LiyKgUfQM.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

输入 `yes` 并按回车继续。随后如果看到类似以下信息：

```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

则表示 SSH 连接验证成功！

### 📁 创建 GitHub.io 仓库

{% note warning flat %}
**重要提醒**
仓库名称必须严格按照 `用户名.github.io` 的格式，否则无法正常访问！
{% endnote %}

1. 在浏览器中登录 GitHub，点击右上角 "+"，选择 "New repository"
2. 仓库名称必须为 `用户名.github.io`（例如：`username.github.io`）
3. 选择 Public 可见性，不需要添加 README 文件
4. 点击 "Create repository" 完成创建

## 🚀 初始化 Hexo 博客

现在开始正式搭建我们的博客！

### 📦 安装 Hexo

**第一步：安装 Hexo**

全局安装 Hexo 命令行工具：

```bash
npm install -g hexo-cli
```

**第二步：初始化博客**

创建博客目录并初始化：

```bash
mkdir blog
cd blog
hexo init
npm install
```

**第三步：安装部署插件**

安装 Git 部署插件：

```bash
npm install hexo-deployer-git --save
```

### ⚙️ 配置 Hexo

1. 使用 VSCode 或任何文本编辑器打开博客根目录下的 `_config.yml` 文件
2. 找到 deploy 部分并修改为：

```yaml
deploy:
  type: git
  repo: git@github.com:你的用户名/你的用户名.github.io.git
  branch: main
```

{% note warning flat %}
**注意**：根据 GitHub 的最新政策，新创建的仓库默认分支名可能是 `main` 而不是 `master`。请确认你的 GitHub 仓库默认分支名称，并相应地设置 `branch` 值。
{% endnote %}

### 👀 本地预览博客

在博客根目录下执行以下命令：

```bash
# 生成静态文件
hexo generate
# 或简写为
hexo g

# 启动本地服务器
hexo server
# 或简写为
hexo s
```

然后在浏览器访问 `http://localhost:4000` 查看效果！

{% note success flat %}
🎉 **恭喜！** 如果你能看到 Hexo 的默认页面，说明博客已经成功搭建了！
{% endnote %}

## 🌐 部署到 GitHub Pages

### 📤 部署博客

在博客根目录下执行以下命令：

```bash
# 清理缓存
hexo clean

# 生成静态文件
hexo generate

# 部署到 GitHub
hexo deploy
# 或简写为
hexo d

# 也可以一键生成并部署
hexo g -d
```

### 🎯 访问你的博客

部署完成后，等待几分钟，然后访问 `https://你的用户名.github.io` 查看你的博客！

{% note info flat %}
💡 **小贴士**：首次部署可能需要等待 5-10 分钟才能访问，这是正常现象。
{% endnote %}

## ☁️ 部署到 Cloudflare Pages（可选）

除了 GitHub Pages，你还可以将博客部署到 Cloudflare Pages，这样可以获得更好的访问速度和更多的功能。

1. 在浏览器中注册并登录 Cloudflare 账号
2. 在 Cloudflare 控制面板中，点击 "Pages"
3. 点击 "Create a project"，选择 "Connect to Git"
4. 授权并选择你的 GitHub 仓库
5. 配置构建设置：
   - 项目名称：自定义（如 `my-blog`）
   - 生产分支：main（或你的默认分支名）
   - 构建命令：`npm run build` 或 `hexo generate`
   - 构建输出目录：`public`
6. 点击 "Save and Deploy" 开始部署
7. 部署完成后，Cloudflare 会提供一个 `*.pages.dev` 域名访问你的博客

## 📝 如何使用 Hexo

### ✍️ 新建一篇博文

在博客根目录下执行以下命令创建一篇新文章：

```bash
hexo new "文章标题"
```

这会在 `source/_posts` 目录下创建一个新的 Markdown 文件，可以使用 VSCode 或其他编辑器打开编辑。

### 👀 本地预览

编辑完文章后，执行以下命令在本地预览效果：

```bash
# 清理缓存
hexo clean

# 生成静态文件
hexo g

# 启动本地服务器
hexo s
```

然后在浏览器访问 `http://localhost:4000` 查看效果。

### 🚀 发布文章

确认无误后，执行以下命令将本地文章推送至 GitHub 仓库：

```bash
# 清理缓存
hexo clean

# 一键生成并部署
hexo g -d

# 或者分步执行
hexo generate --deploy
```

## 🛠️ 常见问题解决

### ❌ VSCode 终端首次执行报错

如果在 VSCode 终端中执行 Hexo 命令时出现错误，可能是因为 PowerShell 的执行策略限制。

**解决方案：**

1. 以管理员身份运行 PowerShell（在开始菜单中右键点击 PowerShell，选择"以管理员身份运行"）
2. 执行以下命令：

```powershell
Set-ExecutionPolicy RemoteSigned
```

3. 输入 "Y" 确认更改
4. 重新打开 VSCode 尝试执行 Hexo 命令

## 📋 常用 Hexo 命令汇总

以下所有命令都需要在博客根目录下的终端中执行：

{% tabs hexo-commands %}

<!-- tab 📝 文章管理 -->

```bash
# 新建文章
hexo new "文章标题"

# 新建页面
hexo new page "页面名称"
```

<!-- endtab -->

<!-- tab 🔧 生成与服务 -->

```bash
# 生成静态文件
hexo generate
hexo g

# 启动本地服务器
hexo server
hexo s

# 清理缓存
hexo clean
```

<!-- endtab -->

<!-- tab 🚀 部署 -->

```bash
# 部署到远程
hexo deploy
hexo d

# 一键生成并部署
hexo g -d
```

<!-- endtab -->

<!-- tab ℹ️ 其他 -->

```bash
# 查看版本
hexo version

# 查看帮助
hexo help
```

<!-- endtab -->

{% endtabs %}

## 💡 实用技巧

### 🗂️ 自动生成目录页面

为了让博客更加完整，你可能需要创建分类页面、标签页面和关于页面：

```bash
hexo new page categories
hexo new page tags
hexo new page about
```

然后分别编辑这些页面的 Markdown 文件，添加相应的 Front Matter 配置。

### 🔗 添加文章永久链接

为了让你的文章链接更加稳定，可以安装永久链接插件：

```bash
npm install hexo-abbrlink --save
```

然后在 `_config.yml` 中修改永久链接设置：

```yaml
permalink: posts/:abbrlink/
abbrlink:
  alg: crc32
  rep: hex
```

### 🔍 添加本地搜索功能

安装搜索插件：

```bash
npm install hexo-generator-searchdb --save
```

然后在 `_config.yml` 中添加配置：

```yaml
search:
  path: search.xml
  field: post
  content: true
  format: html
```

## ⚠️ 注意事项

{% note warning flat %}
**重要提醒**

1. **终端位置很重要**：所有 Hexo 命令都必须在博客根目录下执行，否则会报错
2. **命令执行环境**：
   - Node.js 和 npm 相关命令可在 CMD、PowerShell 或 Git Bash 中执行
   - Git 配置和 SSH 密钥生成推荐在 Git Bash 中执行
   - Hexo 命令可在任何终端中执行，但必须确保在博客根目录下
3. **路径问题**：Windows 系统中，如果路径包含空格或特殊字符，可能需要使用引号括起来
4. **权限问题**：如果遇到权限错误，可以尝试以管理员身份运行终端
   {% endnote %}

## 🎉 总结

通过本教程，我们完成了基于 Hexo 框架的个人博客搭建。从环境配置、初始化到部署，每一步都有详细的说明。我们还介绍了如何将博客部署到 GitHub Pages 和 Cloudflare Pages，以及一些常见问题的解决方法和实用技巧。

{% note success flat %}
🌟 **恭喜你！** 现在你已经拥有了一个完全属于自己的博客！这种方式搭建的博客：

- ✅ **完全免费** - 无需购买服务器
- ✅ **简单易用** - 只需要一些基础的编程知识
- ✅ **高度可定制** - 支持各种主题和插件
- ✅ **稳定可靠** - 基于成熟的技术栈
  {% endnote %}

在下一篇文章中，我们将介绍如何安装和配置美观的 AnZhiYu 主题，让你的博客更加个性化和美观。

{% note info flat %}
💬 **互动时间**
如果在搭建过程中遇到任何问题，欢迎在评论区留言讨论。也欢迎分享你的博客链接，让我们一起交流学习！

记得关注我的博客，获取更多技术分享和教程。祝你的博客之旅愉快！☕️
{% endnote %}
