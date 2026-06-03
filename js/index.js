/**
 * 首页 - 水滴环形交互
 * PC: Hover 暂停圈层 / 点击弹窗预览
 * 移动端: Tap 跳转详情 / 长按拖拽旋转
 */

const RingApp = {
  container: null,
  rings: [],
  allPaused: false,
  isMobile: false,
  longPressTimer: null,
  isDragging: false,
  dragStartAngle: 0,
  dragRingIndex: -1,

  /** 4 圈半径比例（内圈最小，外圈最大） */
  ringRadii: [0.18, 0.30, 0.42, 0.54],

  async init() {
    await BirdApp.loadBirds();
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    this.container = document.getElementById('ring-container');
    if (!this.container) return;

    this.buildRings();
    this.setupScrollFix();
    if (this.isMobile) this.setupMobileInteraction();
    else this.setupDesktopInteraction();
  },

  /** 构建 4 圈水滴环形 */
  buildRings() {
    const birds = BirdApp.birds;
    const size = this.container.offsetWidth;

    for (let r = 0; r < 4; r++) {
      const ringBirds = birds.filter(b => b.ring === r);
      if (!ringBirds.length) continue;

      const ringEl = document.createElement('div');
      ringEl.className = 'ring';
      ringEl.dataset.ring = r;
      const radius = size * this.ringRadii[r];

      ringBirds.forEach((bird, i) => {
        const angle = (360 / ringBirds.length) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        // 水滴尖端朝向圆心：旋转角度 = angle + 90
        const rotDeg = angle + 90;

        const drop = document.createElement('div');
        drop.className = 'drop';
        drop.dataset.id = bird.id;
        drop.dataset.ring = r;
        drop.style.transform = `translate(${x}px, ${y}px) rotate(${rotDeg}deg)`;

        drop.innerHTML = `<div class="drop-inner">${bird.emoji}</div>`;
        ringEl.appendChild(drop);
      });

      this.container.appendChild(ringEl);
      this.rings.push(ringEl);
    }
  },

  /** 页面滚动时环形位置固定 */
  setupScrollFix() {
    const heroRing = document.querySelector('.hero-ring-area');
    if (!heroRing || this.isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        this.container.classList.toggle('fixed-on-scroll', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(heroRing);
  },

  /** PC 端 Hover + 点击交互 */
  setupDesktopInteraction() {
    this.container.addEventListener('mouseover', (e) => {
      const drop = e.target.closest('.drop');
      if (!drop || this.allPaused) return;
      const ringIdx = parseInt(drop.dataset.ring);
      this.rings[ringIdx]?.classList.add('paused');
    });

    this.container.addEventListener('mouseout', (e) => {
      const drop = e.target.closest('.drop');
      if (!drop || this.allPaused) return;
      const ringIdx = parseInt(drop.dataset.ring);
      // 检查鼠标是否还在该圈的某个水滴上
      const ring = this.rings[ringIdx];
      if (ring && !ring.matches(':hover')) {
        ring.classList.remove('paused');
      }
    });

    this.container.addEventListener('click', (e) => {
      const drop = e.target.closest('.drop');
      if (!drop) return;
      e.stopPropagation();
      this.onDropClick(drop);
    });
  },

  /** 点击水滴：停止旋转 → 收拢弹出 → 打开预览弹窗 */
  onDropClick(drop) {
    const birdId = drop.dataset.id;
    const bird = BirdApp.getBirdById(birdId);
    if (!bird) return;

    this.allPaused = true;
    this.rings.forEach(r => r.classList.add('paused'));
    drop.classList.add('active', 'animating-to-center');

    // 收拢到圆心再弹出
    const origTransform = drop.style.transform;
    drop.style.transform = 'translate(0px, 0px) rotate(0deg) scale(0.5)';

    setTimeout(() => {
      drop.style.transform = origTransform;
      drop.classList.remove('animating-to-center');
      this.openPreviewModal(bird);
    }, 600);
  },

  /** 预览弹窗 */
  openPreviewModal(bird) {
    BirdApp.openModal(`
      <div class="preview-modal-body">
        <img src="${bird.image}" alt="${bird.name}">
        <h3>${bird.name}</h3>
        <p>${bird.intro}</p>
        <div class="preview-actions">
          <a href="detail.html?id=${bird.id}" class="btn-primary">查看详情</a>
          <a href="list.html" class="btn-secondary">查看图鉴</a>
        </div>
      </div>
    `, {
      onClose: () => this.resumeRotation()
    });
  },

  /** 关闭弹窗后恢复环形旋转 */
  resumeRotation() {
    this.allPaused = false;
    this.rings.forEach(r => r.classList.remove('paused'));
    this.container.querySelectorAll('.drop').forEach(d => d.classList.remove('active'));
  },

  /** 移动端：Tap 跳转详情 + 长按拖拽 */
  setupMobileInteraction() {
    this.container.addEventListener('touchstart', (e) => {
      const drop = e.target.closest('.drop');
      if (!drop) return;

      this.longPressTimer = setTimeout(() => {
        this.isDragging = true;
        this.dragRingIndex = parseInt(drop.dataset.ring);
        this.rings.forEach(r => r.classList.add('paused'));
        this.allPaused = true;

        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.dragStartAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
        this.dragStartRotation = this.getRingRotation(this.dragRingIndex);
      }, 500);
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
      const delta = (angle - this.dragStartAngle) * (180 / Math.PI);
      const ring = this.rings[this.dragRingIndex];
      if (ring) {
        ring.style.animation = 'none';
        ring.style.transform = `rotate(${this.dragStartRotation + delta}deg)`;
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      clearTimeout(this.longPressTimer);

      if (this.isDragging) {
        this.isDragging = false;
        const ring = this.rings[this.dragRingIndex];
        if (ring) {
          ring.style.animation = '';
          ring.style.transform = '';
        }
        this.allPaused = false;
        this.rings.forEach(r => r.classList.remove('paused'));
        return;
      }

      const drop = e.target.closest('.drop');
      if (drop) {
        drop.classList.add('active');
        setTimeout(() => {
          window.location.href = `detail.html?id=${drop.dataset.id}`;
        }, 300);
      }
    });
  },

  /** 获取当前圈的旋转角度 */
  getRingRotation(ringIdx) {
    const ring = this.rings[ringIdx];
    if (!ring) return 0;
    const st = window.getComputedStyle(ring);
    const matrix = new DOMMatrix(st.transform);
    return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  },

  dragStartRotation: 0
};

document.addEventListener('DOMContentLoaded', () => {
  BirdApp.init().then(() => RingApp.init());
});
