/**
 * 作用：Astro 内容集合查询工具函数
 * - 封装所有对内容集合的查询操作
 * - 被各页面和组件引用，统一数据获取逻辑
 *
 * 关联文件：
 * - src/content.config.ts（内容集合定义）
 * - src/pages/category/[slug].astro（分类页查询文章列表）
 * - src/pages/article/[...slug].astro（文章页查询单篇文章）
 * - src/components/home/BlindBox.astro（盲盒随机获取文章）
 * - src/components/home/SpinWheel.astro（转盘随机获取文章）
 * - src/components/article/RelatedArticles.astro（相关推荐）
 */

import { getCollection, type CollectionEntry } from 'astro:content';

/** 所有内容集合名称 */
export const COLLECTIONS = [
  'yangniaorichang',
  'guanniaozhinan',
  'niaoleijiuzhu',
  'niaoleibaohu',
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

/** 联合类型：涵盖所有文章集合 */
type ArticleEntry = CollectionEntry<'yangniaorichang' | 'guanniaozhinan' | 'niaoleijiuzhu' | 'niaoleibaohu'>;

/**
 * 获取指定专题的所有文章，按发布日期倒序排列
 * 作用：用于分类列表页展示
 * 注意：使用字面量字符串调用 getCollection，确保 Astro 类型推断正确
 */
export async function getArticlesByCategory(category: string): Promise<ArticleEntry[]> {
  let articles: ArticleEntry[] = [];

  switch (category) {
    case 'yangniaorichang':
      articles = await getCollection('yangniaorichang') as any;
      break;
    case 'guanniaozhinan':
      articles = await getCollection('guanniaozhinan') as any;
      break;
    case 'niaoleijiuzhu':
      articles = await getCollection('niaoleijiuzhu') as any;
      break;
    case 'niaoleibaohu':
      articles = await getCollection('niaoleibaohu') as any;
      break;
    default:
      return [];
  }

  return articles
    .filter((a) => !a.data.draft)
    .sort(
      (a, b) => {
        var da = a.data.publishDate ? new Date(a.data.publishDate).getTime() : 0;
        var db = b.data.publishDate ? new Date(b.data.publishDate).getTime() : 0;
        return db - da;
      }
    );
}

/**
 * 获取全站所有文章（排除草稿）
 * 作用：用于全站搜索、首页随机推荐等场景
 */
export async function getAllArticles(): Promise<ArticleEntry[]> {
  const articles1 = await getCollection('yangniaorichang');
  const articles2 = await getCollection('guanniaozhinan');
  const articles3 = await getCollection('niaoleijiuzhu');
  const articles4 = await getCollection('niaoleibaohu');

  const allArticles: ArticleEntry[] = [
    ...articles1,
    ...articles2,
    ...articles3,
    ...articles4,
  ];

  return allArticles
    .filter((a) => !a.data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.publishDate).getTime() -
        new Date(a.data.publishDate).getTime()
    );
}

/**
 * 随机获取 N 篇文章
 * 作用：供首页盲盒模块、转盘模块使用
 */
export async function getRandomArticles(count: number = 8): Promise<ArticleEntry[]> {
  const all = await getAllArticles();
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 根据分类获取相关文章（排除当前文章）
 * 作用：供文章底部相关推荐组件使用
 */
export async function getRelatedArticles(
  category: string,
  currentSlug: string,
  count: number = 3
): Promise<ArticleEntry[]> {
  const articles = await getArticlesByCategory(category);
  return articles
    .filter((a) => a.id !== currentSlug)
    .slice(0, count);
}

/**
 * 搜索文章（客户端用简化版本）
 * 作用：Pagefind 未覆盖场景的 fallback 搜索
 */
export async function searchArticles(query: string): Promise<ArticleEntry[]> {
  const all = await getAllArticles();
  const lower = query.toLowerCase();
  return all.filter(
    (a) =>
      a.data.title.toLowerCase().includes(lower) ||
      a.data.summary.toLowerCase().includes(lower) ||
      a.data.tags?.some((t: string) => t.toLowerCase().includes(lower))
  );
}
