/**
 * 作用：Astro 内容集合配置文件
 * - 定义四大专题的内容集合（Content Collections）
 * - 每个集合对应一个 content 子目录
 * - 使用 glob loader 加载 Markdown 文件
 * - 定义 frontmatter schema（必填字段与可选字段）
 *
 * Astro 构建时自动根据此配置：
 * 1. 扫描各目录下的 .md 文件
 * 2. 验证所有 Markdown 文件的 frontmatter 是否符合 schema
 * 3. 生成类型定义（.astro/types.d.ts），提供 TypeScript 类型支持
 * 4. 自动生成文章页面路由（配合 getStaticPaths）
 *
 * 关联文件：
 * - src/content/ 下的所有 .md 文件
 * - src/utils/content.ts（使用 getCollection() 查询）
 * - src/pages/article/[...slug].astro（动态路由渲染文章）
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 通用文章 frontmatter schema
 * 作用：所有四大专题共用同一 schema，保证文章数据结构统一
 */
const articleSchema = z.object({
  /** 文章标题（必填） */
  title: z.string(),
  /** 所属专题分类（必填，用于分类页筛选） */
  category: z.string(),
  /** 二级分类（可选，用于专题内部的子分类） */
  subcategory: z.string().optional(),
  /** 标签数组（可选，用于搜索和关联推荐） */
  tags: z.array(z.string()).optional().default([]),
  /** 一句话简介（必填，用于卡片列表展示和 SEO description） */
  summary: z.string(),
  /** 发布日期（必填，用于排序） */
  publishDate: z.date(),
  /** 是否为草稿（可选，草稿不显示在列表和搜索中） */
  draft: z.boolean().optional().default(false),
  /** 封面配图路径（可选，用于文章卡片） */
  coverImage: z.string().optional(),
  /** 文章作者（可选，显示"文 / xxx"） */
  articleAuthor: z.string().optional().default(''),
  /** 图片/配图作者（可选，显示"图 / xxx"） */
  coverAuthor: z.string().optional().default(''),
});

/**
 * 四大专题内容集合定义
 * 每个集合使用 glob loader 从对应目录加载 .md 文件
 */
export const collections = {
  yangniaorichang: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/yangniaorichang' }),
    schema: articleSchema,
  }),
  guanniaozhinan: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/guanniaozhinan' }),
    schema: articleSchema,
  }),
  niaoleijiuzhu: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/niaoleijiuzhu' }),
    schema: articleSchema,
  }),
  niaoleibaohu: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/niaoleibaohu' }),
    schema: articleSchema,
  }),
};
