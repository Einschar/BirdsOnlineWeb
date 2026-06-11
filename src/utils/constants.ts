/**
 * 作用：全站常量定义
 * - 四大专题分类的元信息（名称、slug、简介、图标等）
 * - 被多个组件引用：NavBar、HeroSection、PurposeSection、CategoryPage
 *
 * 关联文件：
 * - src/components/global/NavBar.astro（导航栏使用专题列表）
 * - src/components/home/PurposeSection.astro（首页联动区使用）
 * - src/pages/category/[slug].astro（分类页使用 getTopicBySlug 查找专题信息）
 */

export interface TopicInfo {
  slug: string;
  name: string;
  icon: string;
  shortIntro: string;
  longIntro: string;
  /** TODO: 替换为实际专题插画资源路径 */
  illustration: string;
}

export const TOPICS: TopicInfo[] = [
  {
    slug: 'yangniaorichang',
    name: '养鸟日常',
    icon: '/images/icon/玄凤.png',
    shortIntro: '宠物鸟饲养护理全攻略',
    longIntro:
      '从新手入门到资深养护，覆盖宠物鸟日常饲养、疾病预防、繁殖管理等全方位知识。帮你科学养鸟，给鸟儿一个健康幸福的家。',
    illustration: '/illustrations/topic-yangniao.svg',
  },
  {
    slug: 'guanniaozhinan',
    name: '观鸟指南',
    icon: '/images/icon/暗绿绣眼.png',
    shortIntro: '文明观鸟，探索自然',
    longIntro:
      '学习正确的观鸟方式，了解观鸟礼仪与规范。带你走进鸟类世界，在不打扰它们的前提下，享受观察与发现的乐趣。',
    illustration: '/illustrations/topic-guanniao.svg',
  },
  {
    slug: 'niaoleijiuzhu',
    name: '鸟类救助',
    icon: '/images/icon/夜鹭.png',
    shortIntro: '受伤野鸟紧急救助指南',
    longIntro:
      '偶遇受伤野鸟时的标准化救助流程，从观察评估到安全转运。掌握正确的急救知识，在关键时刻为鸟儿争取生存机会。',
    illustration: '/illustrations/topic-jiuzhu.svg',
  },
  {
    slug: 'niaoleibaohu',
    name: '鸟类保护',
    icon: '/images/icon/红隼.png',
    shortIntro: '守护鸟类，保护生态',
    longIntro:
      '了解鸟类面临的威胁——栖息地破坏、非法捕猎、环境污染等。学习如何参与鸟类保护行动，为生物多样性贡献力量。',
    illustration: '/illustrations/topic-baohu.svg',
  },
];

/**
 * 根据 slug 查找专题信息
 * 作用：供分类页等页面使用，通过 URL slug 获取对应的专题元数据
 */
export function getTopicBySlug(slug: string): TopicInfo | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/**
 * 站点全局信息
 * TODO: 替换为实际网站名称和描述
 */
export const SITE_NAME = '鸟类科普网';
export const SITE_DESCRIPTION = '专注鸟类科普，探索羽翼世界的奇妙';
