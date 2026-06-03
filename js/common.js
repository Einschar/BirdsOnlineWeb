/**
 * 鸟类地球Online - 全局通用模块
 * 数据加载、导航栏、模态框、搜索、滚动渐显
 */

const BirdApp = {
  birds: [],
  dataLoaded: false,

  /** 异步加载鸟类 JSON 数据 */
  async loadBirds() {
    if (this.dataLoaded) return this.birds;
    try {
      const res = await fetch('data/bird.json');
      if (!res.ok) throw new Error('数据加载失败');
      const data = await res.json();
      this.birds = data.birds || [];
      this.dataLoaded = true;
      return this.birds;
    } catch (err) {
      console.error('加载 bird.json 失败:', err);
      this.showToast('数据加载失败，请使用 Live Server 运行项目');
      return [];
    }
  },

  /** 根据 ID 查找鸟类 */
  getBirdById(id) {
    return this.birds.find(b => b.id === id);
  },

  /** 模糊搜索：匹配名称、别名、分类、简介 */
  searchBirds(keyword) {
    if (!keyword.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    return this.birds.filter(bird => {
      const fields = [
        bird.name,
        bird.category,
        bird.intro,
        ...(bird.alias || [])
      ].join(' ').toLowerCase();
      return fields.includes(kw);
    });
  },

  /** 吸顶导航栏：滚动时添加模糊背景 */
  initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  /** 搜索框：匹配成功跳转详情页，无结果 Toast 提示 */
  initSearch() {
    const form = document.querySelector('.search-form');
    const input = document.querySelector('.search-input');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = input.value.trim();
      if (!keyword) return;

      const results = this.searchBirds(keyword);
      if (results.length === 1) {
        window.location.href = `detail.html?id=${results[0].id}`;
      } else if (results.length > 1) {
        window.location.href = `list.html?q=${encodeURIComponent(keyword)}`;
      } else {
        this.showToast('未找到匹配的鸟类，请换个关键词试试 🐦');
      }
    });
  },

  /** Toast 友好提示 */
  showToast(message, duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  },

  /** 打开模态框，锁定页面滚动 */
  openModal(contentHtml, options = {}) {
    const { large = false, onClose = null } = options;

    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" aria-label="关闭">&times;</button>
          <div class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
      overlay.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    }

    overlay.querySelector('.modal-content').classList.toggle('modal-lg', large);
    overlay.querySelector('.modal-body').innerHTML = contentHtml;
    overlay._onClose = onClose;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('active'));
  },

  /** 关闭模态框，恢复滚动 */
  closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (overlay._onClose) {
      setTimeout(overlay._onClose, 400);
      overlay._onClose = null;
    }
  },

  /** 图片大图预览 */
  openImageModal(src, alt = '') {
    this.openModal(
      `<div style="padding:1rem;"><img src="${src}" alt="${alt}" style="width:100%;border-radius:16px;display:block;"></div>`,
      { large: true }
    );
  },

  /** B站视频弹窗播放 */
  openVideoModal(bvid) {
    this.openModal(
      `<div style="padding:1.5rem;"><div class="video-wrapper">
        <iframe src="https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=1"
          allowfullscreen scrolling="no" frameborder="0"></iframe>
      </div></div>`,
      {
        large: true,
        onClose: () => {
          const iframe = document.querySelector('.modal-overlay iframe');
          if (iframe) iframe.src = '';
        }
      }
    );
  },

  /** 关于我们弹窗 */
  initAbout() {
    const aboutBtn = document.querySelector('.about-btn');
    if (!aboutBtn) return;
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openModal(`
        <div class="about-content">
          <h2 class="font-display">关于鸟类地球Online</h2>
          <p>鸟类地球Online 是一个清新有趣的鸟类科普网站，致力于用轻盈柔和的方式，带你认识天空与大地上的飞羽朋友。</p>
          <p>探索环形水滴中的每一只鸟，发现自然之美 🌿</p>
          <button class="btn-primary" onclick="BirdApp.closeModal()">开始探索</button>
        </div>
      `);
    });
  },

  /** 滚动渐显动画 */
  initScrollReveal() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach(el => observer.observe(el));
  },

  /** 轻微视差 */
  initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  },

  /** 全局初始化入口 */
  async init() {
    await this.loadBirds();
    this.initNavbar();
    this.initSearch();
    this.initAbout();
    this.initScrollReveal();
    this.initParallax();
  }
};

// 各页面脚本自行调用 BirdApp.init()，避免重复初始化
