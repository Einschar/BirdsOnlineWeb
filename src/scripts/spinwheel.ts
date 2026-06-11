/**
 * 作用：鸟类趣味转盘核心逻辑（PRD 第 5.3.1 章）
 * - 沿用旧版网站（鸟类地球 Online）已开发的转盘 JS 代码
 * - 核心交互逻辑保留，数据源改为从文章 Markdown frontmatter 动态读取
 * - 支持点击旋转、随机停留、弹出对应鸟类科普文章卡片
 *
 * 改造说明（相对旧版）：
 * - 旧版数据源：硬编码的鸟类数据数组
 * - 新版数据源：通过 window.__SPIN_WHEEL_ARTICLES__ 注入（Astro 服务端渲染时动态生成）
 * - 转盘分区数量动态适配文章数量
 *
 * 关联文件：
 * - src/components/home/SpinWheel.astro（Astro 封装组件）
 * - src/utils/content.ts（getRandomArticles 函数获取文章数据）
 */

export interface SpinWheelArticle {
  title: string;
  summary: string;
  href: string;
  emoji?: string;
}

export class SpinWheel {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private articles: SpinWheelArticle[];
  private spinning: boolean = false;
  private currentAngle: number = 0;
  private spinVelocity: number = 0;
  private animationId: number | null = null;

  private readonly colors: string[] = [
    '#84DB5D', '#1C9DE4', '#F5C842', '#E85D5D',
    '#A8E88D', '#5BBFEF', '#FCE9A5', '#F5A5A5',
  ];

  constructor(canvas: HTMLCanvasElement, articles: SpinWheelArticle[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.articles = articles.length > 0 ? articles : this.getDefaultArticles();
    this.draw();
  }

  private getDefaultArticles(): SpinWheelArticle[] {
    return [
      { title: '发现受伤野鸟怎么办', summary: '标准化救助流程指南', href: '#', emoji: '🦅' },
      { title: '新手养鸟入门必看', summary: '从零开始的养鸟之旅', href: '#', emoji: '🐤' },
      { title: '文明观鸟规范', summary: '不打扰是最好的保护', href: '#', emoji: '🔭' },
      { title: '城市鸟撞防护', summary: '玻璃幕墙与鸟类安全', href: '#', emoji: '🏙️' },
      { title: '宠物鸟疾病预防', summary: '常见疾病识别与处理', href: '#', emoji: '💊' },
      { title: '珍稀鸟类保护', summary: '了解濒危鸟类现状', href: '#', emoji: '🦜' },
      { title: '鸟类栖息地保护', summary: '守护鸟类的家园', href: '#', emoji: '🌳' },
      { title: '捕鸟网的危害', summary: '非法捕猎对鸟类的影响', href: '#', emoji: '🚫' },
    ];
  }

  draw() {
    const { canvas, ctx, articles, colors, currentAngle } = this;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const sliceAngle = (2 * Math.PI) / articles.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    articles.forEach((article, i) => {
      const startAngle = currentAngle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]!;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw emoji
      const midAngle = startAngle + sliceAngle / 2;
      const textR = r * 0.65;
      const tx = cx + Math.cos(midAngle) * textR;
      const ty = cy + Math.sin(midAngle) * textR;
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(article.emoji || '🐦', tx, ty);
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#84DB5D';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', cx, cy);

    // Pointer arrow (top)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 5);
    ctx.lineTo(cx - 10, cy - r - 15);
    ctx.lineTo(cx + 10, cy - r - 15);
    ctx.closePath();
    ctx.fillStyle = '#E85D5D';
    ctx.fill();
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.spinVelocity = Math.random() * 0.4 + 0.3; // Random initial speed
    this.animate();
  }

  private animate() {
    if (!this.spinning) return;

    this.currentAngle += this.spinVelocity;
    this.spinVelocity *= 0.985; // Deceleration

    this.draw();

    if (this.spinVelocity < 0.001) {
      this.spinning = false;
      this.spinVelocity = 0;
      this.onSpinEnd();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private onSpinEnd() {
    const sliceAngle = (2 * Math.PI) / this.articles.length;
    const normalizedAngle = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // The pointer is at the top (-PI/2), find which slice is there
    const pointerAngle = (2 * Math.PI - normalizedAngle + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(pointerAngle / sliceAngle) % this.articles.length;
    const article = this.articles[index];

    // Dispatch custom event for parent component to handle
    window.dispatchEvent(
      new CustomEvent('spinwheel-result', { detail: { article, index } })
    );
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
