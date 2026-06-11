# 🐦 Birds2Online - 鸟类科普自适应网站

> 专注鸟类垂直科普，覆盖宠物鸟饲养护理、文明观鸟规范、野生鸟类救助、鸟类保护四大场景。

## 技术栈

- **框架**: [Astro](https://astro.build) 6.x — 静态站点生成
- **样式**: [Tailwind CSS](https://tailwindcss.com) 4.x — 响应式布局
- **搜索**: [Pagefind](https://pagefind.app) — 构建时静态搜索索引
- **内容**: 本地 Markdown 文件 + Content Collections
- **部署**: Vercel（零服务器成本）

## 项目结构

```
src/
├── content/           # Markdown 文章（4 个专题目录）
├── pages/             # 页面路由（首页/分类/文章）
├── components/        # 可复用组件
│   ├── global/        # 全局组件（导航/搜索/页脚/面包屑）
│   ├── home/          # 首页组件（Hero/专题联动/盲盒/转盘）
│   └── article/       # 文章组件（6 种内容模块）
├── layouts/           # 页面布局
├── styles/            # 全局样式与设计令牌
├── utils/             # 工具函数与常量
└── scripts/           # 客户端 JS（转盘核心逻辑等）
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建（含 Pagefind 搜索索引）
npm run build

# 预览构建结果
npm run preview
```

## 文章内容管理

1. 在 `src/content/[专题]/` 下创建 `.md` 文件
2. 按照 frontmatter 模板填写元信息
3. 推送至 GitHub → Vercel 自动构建上线

```markdown
---
title: 文章标题
category: 专题分类
subcategory: 子分类
tags: [标签1, 标签2]
summary: 一句话简介
publishDate: 2025-06-01
---

正文内容...
```

## 待替换资源

以下资源使用了临时占位符，需要替换为实际设计稿：

- `public/favicon.svg` — 网站 Favicon
- `public/illustrations/*.svg` — 专题插画和 Hero 背景
- `public/images/*/` — 各专题文章配图
- 所有标记 `<!-- TODO: 替换为实际... -->` 的插画/图标资源

## 许可证

MIT
