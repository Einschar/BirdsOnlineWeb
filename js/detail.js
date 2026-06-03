/**
 * 详情页 - 根据 URL ?id= 动态渲染鸟类内容
 */

const DetailApp = {
  async init() {
    await BirdApp.loadBirds();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const bird = BirdApp.getBirdById(id);

    if (!bird) {
      this.renderNotFound();
      return;
    }

    this.renderDetail(bird);
    document.title = `${bird.name} - 鸟类地球Online`;
  },

  /** 渲染完整详情内容 */
  renderDetail(bird) {
    const main = document.getElementById('detail-main');
    if (!main) return;

    const paramsHtml = Object.entries(bird.params)
      .map(([k, v]) => `
        <div class="param-item fade-in">
          <div class="label">${k}</div>
          <div class="value">${v}</div>
        </div>
      `).join('');

    const galleryHtml = (bird.gallery || [])
      .map(src => `
        <div class="gallery-item fade-in" data-src="${src}">
          <img src="${src}" alt="${bird.name}" loading="lazy">
        </div>
      `).join('');

    main.innerHTML = `
      <a href="list.html" class="back-link fade-in">← 返回图鉴</a>

      <div class="detail-hero fade-in" data-parallax="0.05">
        <img src="${bird.image}" alt="${bird.name}">
      </div>

      <h1 class="detail-title fade-in">${bird.name}</h1>

      <div class="detail-meta fade-in">
        <span class="tag">${bird.category}</span>
        ${(bird.alias || []).map(a => `<span class="tag">${a}</span>`).join('')}
      </div>

      <section class="detail-section fade-in">
        <h2>科普介绍</h2>
        <p class="detail-desc">${bird.description}</p>
      </section>

      ${galleryHtml ? `
        <section class="detail-section fade-in">
          <h2>图集</h2>
          <div class="gallery-grid">${galleryHtml}</div>
        </section>
      ` : ''}

      <section class="detail-section fade-in">
        <h2>基础参数</h2>
        <div class="params-grid">${paramsHtml}</div>
      </section>

      ${bird.video ? `
        <section class="detail-section fade-in">
          <h2>相关视频</h2>
          <div class="video-thumb" data-bvid="${bird.video.bvid}">
            <img src="${bird.image}" alt="${bird.name} 视频" data-bvid-cover="${bird.video.bvid}">
            <div class="video-play-btn"><span>▶</span></div>
          </div>
        </section>
      ` : ''}
    `;

    this.bindEvents();
    this.loadBilibiliCovers();
    BirdApp.initScrollReveal();
  },

  /** 绑定图集点击 & 视频播放 */
  bindEvents() {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        BirdApp.openImageModal(item.dataset.src);
      });
    });

    const videoThumb = document.querySelector('.video-thumb');
    if (videoThumb) {
      videoThumb.addEventListener('click', () => {
        BirdApp.openVideoModal(videoThumb.dataset.bvid);
      });
    }
  },

  /** 自动加载 B 站视频封面替换占位图 */
  loadBilibiliCovers() {
    document.querySelectorAll('[data-bvid-cover]').forEach(async (img) => {
      const bvid = img.dataset.bvidCover;
      const cover = await BirdApp.fetchBilibiliCover(bvid);
      if (cover) img.src = cover;
    });
  },

  /** 未找到鸟类时的提示页 */
  renderNotFound() {
    const main = document.getElementById('detail-main');
    if (!main) return;
    main.innerHTML = `
      <div class="not-found fade-in visible">
        <h2>🐦 未找到该鸟类</h2>
        <p style="color:#888;margin:1rem 0 2rem;">请检查链接是否正确，或返回图鉴浏览。</p>
        <a href="list.html" class="btn-primary">返回图鉴</a>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BirdApp.init().then(() => DetailApp.init());
});
