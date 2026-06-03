/**
 * 图鉴页 - 卡片网格 + 弹性入场动画
 */

const ListApp = {
  async init() {
    await BirdApp.loadBirds();
    this.renderCards();
    this.playEnterAnimation();
  },

  /** 渲染鸟类卡片，支持 URL 搜索过滤 */
  renderCards() {
    const grid = document.getElementById('bird-grid');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    let birds = BirdApp.birds;

    if (query) {
      birds = BirdApp.searchBirds(query);
      const subtitle = document.getElementById('list-subtitle');
      if (subtitle) subtitle.textContent = `搜索「${query}」共找到 ${birds.length} 种鸟类`;
    }

    if (!birds.length) {
      grid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;">暂无匹配的鸟类</p>';
      return;
    }

    grid.innerHTML = birds.map(bird => `
      <div class="bird-card" data-id="${bird.id}">
        <img src="${bird.image}" alt="${bird.name}" loading="lazy">
        <div class="bird-card-body">
          <h3>${bird.name}</h3>
          <div class="category">${bird.category}</div>
          <p class="intro">${bird.intro}</p>
          <a href="detail.html?id=${bird.id}" class="btn-primary" style="width:100%;">查看详情</a>
        </div>
      </div>
    `).join('');
  },

  /** 从首页水滴位置弹性展开入场 */
  playEnterAnimation() {
    const cards = document.querySelectorAll('.bird-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('entered'), 80 * i);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BirdApp.init().then(() => ListApp.init());
});
