/**
 * 首页 — BirdsCircle 水滴环形交互
 * 精确匹配 Figma 设计 (node-id=342:479 BirdsCircle / Drop / Bird_Style)
 *
 * PC: hover Drop → 放大 ×1.5 + 暂停对应 Ring → click 预览弹窗
 * 移动端: click Drop → 跳转鸟类详情页
 */

const OrbitApp = {
  container: null,
  rings: [],
  isMobile: false,

  /* 每圈 Drop 宽度 (px)，随圈层递增 */
  ringDropSize: [52, 63, 74, 84],

  /* 每圈 Drop 个数 — 改这里控制各圈 SVG 数量 */
  ringDropCounts: [3, 3, 8, 8],

  /* 圈半径比例（占容器尺寸的比例） */
  ringRadii: [0.16, 0.28, 0.40, 0.52],

  async init() {
    await BirdApp.loadBirds();
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    this.container = document.getElementById('ring-container');
    if (!this.container) return;

    this.injectSVGGradients();
    this.buildRings();
    this.setupScrollFix();

    if (this.isMobile) {
      this.setupMobileInteraction();
    } else {
      this.setupDesktopInteraction();
    }
  },

  /** 图片 fallback（bird.json 的 svg 字段加载失败时的兜底） */
  DROP_IMG_FALLBACK: 'data/pic/wudong.svg',

  /** 不再需要注入渐变 defs */
  injectSVGGradients() {
    /* 使用 <img> 加载外部 SVG，无需渐变注入 */
  },

  /** 构建各圈 Ring + Drop（按 ringDropCounts 分配，循环复用全部鸟类） */
  buildRings() {
    const birds = BirdApp.birds;
    if (!birds.length) return;
    const size = this.container.offsetWidth || 520;
    const scale = size / 520;
    let birdIdx = 0;

    for (let r = 0; r < 4; r++) {
      const count = this.ringDropCounts[r];
      if (!count) continue;

      const ringEl = document.createElement('div');
      ringEl.className = 'ring';
      ringEl.dataset.ring = r;
      ringEl.style.zIndex = 4 - r; /* 内圈覆外圈 */

      const radius = size * this.ringRadii[r];
      const dropW = this.ringDropSize[r] * scale;

      for (let i = 0; i < count; i++) {
        const bird = birds[birdIdx % birds.length];
        birdIdx++;
        const angle = (360 / count) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        /* 鸟喙朝向圆心 → rotate(angle+180) */
        const rotDeg = angle + 180;

        const drop = document.createElement('div');
        drop.className = 'drop';
        drop.dataset.id = bird.id;
        drop.dataset.ring = r;
        const dropH = dropW;
        drop.style.width  = dropW + 'px';
        drop.style.height = dropH + 'px';
        drop.style.marginLeft = (-dropW / 2) + 'px';
        drop.style.marginTop  = (-dropH / 2) + 'px';
        drop.style.transform =
          `translate(${x}px, ${y}px) rotate(${rotDeg}deg)`;

        drop.innerHTML = this.buildDropInner(bird, dropW);
        ringEl.appendChild(drop);
      }

      this.container.appendChild(ringEl);
      this.rings.push(ringEl);
    }
  },

  /** 生成单个 Drop — 读 bird.svg 字段，优先 .svg → .png → fallback */
  buildDropInner(bird, w) {
    const svg = bird.svg;                               // data/pic/xxx.svg
    const png = bird.svg.replace(/\.svg$/i, '.png');    // data/pic/xxx.png
    const fb  = this.DROP_IMG_FALLBACK;
    // onerror: .svg 失败→试 .png，.png 失败→fallback
    const errFn = `if(this.src.endsWith('.svg')){this.src='${png}'}else{this.onerror=null;this.src='${fb}'}`;
    return `<img class="drop-img" src="${svg}" alt="${bird.name}"
             width="${w}" height="${w}" onerror="${errFn}" />`;
  },

  /** 滚动时环形吸附固定 */
  setupScrollFix() {
    const heroRing = document.querySelector('.hero-ring-area');
    if (!heroRing || this.isMobile) return;
    const obs = new IntersectionObserver(
      ([e]) => this.container.classList.toggle('fixed-on-scroll', !e.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(heroRing);
  },

  /* ══════ PC 端交互 ══════ */
  setupDesktopInteraction() {
    this.container.addEventListener('mouseover', e => {
      const drop = e.target.closest('.drop');
      if (!drop) return;
      const ri = parseInt(drop.dataset.ring, 10);
      if (this.rings[ri]) this.rings[ri].classList.add('paused');
    });

    this.container.addEventListener('mouseout', e => {
      const drop = e.target.closest('.drop');
      if (!drop) return;
      const ri = parseInt(drop.dataset.ring, 10);
      if (this.rings[ri]) this.rings[ri].classList.remove('paused');
    });

    this.container.addEventListener('click', e => {
      const drop = e.target.closest('.drop');
      if (!drop) return;
      e.stopPropagation();
      this.openPreview(drop);
    });
  },

  /** 预览弹窗（全部 Ring 暂停 + 关闭后恢复） */
  openPreview(drop) {
    const bird = BirdApp.getBirdById(drop.dataset.id);
    if (!bird) return;

    this.rings.forEach(r => r.classList.add('paused'));

    BirdApp.openModal(`
      <div class="preview-modal-body">
        <img src="${bird.image}" alt="${bird.name}" class="preview-bird-img" />
        <h3>${bird.name}</h3>
        <p>${bird.intro}</p>
        <div class="preview-actions">
          <a href="detail.html?id=${bird.id}" class="btn-primary">查看详情</a>
        </div>
      </div>
    `, {
      onClose: () => this.rings.forEach(r => r.classList.remove('paused'))
    });
  },

  /* ══════ 移动端交互 ══════ */
  setupMobileInteraction() {
    this.container.addEventListener('click', e => {
      const drop = e.target.closest('.drop');
      if (!drop) return;
      e.stopPropagation();
      const birdId = drop.dataset.id;
      drop.classList.add('active');
      setTimeout(() => {
        window.location.href = `detail.html?id=${birdId}`;
      }, 200);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BirdApp.init().then(() => OrbitApp.init());
});
