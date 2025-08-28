---
title: 我的收藏夹
date: 2025-01-28
type: favorites
updated: 2025-01-28
comments: true
description: 分享我的网站收藏，包含学习资源、开发工具、娱乐网站等精选链接
keywords: 收藏夹,网站分享,学习资源,开发工具,娱乐网站
top_img: https://img.090227.xyz/file/ae62475a131f3734a201c.png
aside: true
---

<div id="favorites-container">
  <!-- 搜索和筛选区域 -->
  <div class="favorites-header">
    <div class="search-container">
      <input type="text" id="search-input" placeholder="搜索网站..." />
      <i class="anzhiyu-icon-search search-icon"></i>
    </div>
    <div class="filter-container">
      <button class="filter-btn active" data-category="all">
        <span>🌟</span>全部
      </button>
      <button class="filter-btn" data-category="学习">
        <span>📚</span>学习充电
      </button>
      <button class="filter-btn" data-category="开发">
        <span>💻</span>开发工具
      </button>
      <button class="filter-btn" data-category="娱乐">
        <span>🎮</span>娱乐休闲
      </button>
      <button class="filter-btn" data-category="工具">
        <span>🛠️</span>效率工具
      </button>
      <button class="filter-btn" data-category="资源">
        <span>📦</span>资源宝库
      </button>
    </div>
    <div class="subcategory-nav" id="subcategory-nav" style="display: none;">
      <div class="subcategory-container">
        <button class="subcategory-btn back-btn" data-action="back">
          <span>←</span>返回
        </button>
        <div class="subcategory-list" id="subcategory-list"></div>
      </div>
    </div>
  </div>

  <div class="favorites-content" id="favorites-content">
    <p style="text-align: center; padding: 50px; color: var(--anzhiyu-secondtext);">正在加载收藏夹数据...</p>
  </div>
</div>

<!-- 引入样式文件 -->
<link rel="stylesheet" href="/favorites/favorites.css">

<!-- 引入数据和脚本文件 -->
<script src="/js/favorites-data-complete.js"></script>
<script src="/favorites/favorites.js"></script>
