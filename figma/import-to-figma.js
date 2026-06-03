/**
 * 鸟类地球Online — 首页导入 Figma 脚本
 *
 * 用法（在 Cursor 中对 AI 说）：
 * 「用 use_figma 执行 figma/import-to-figma.js，fileKey 是 xxx」
 *
 * fileKey 从 Figma URL 获取：
 * https://www.figma.com/design/{fileKey}/文件名
 *
 * 注意：Figma Plugin API 颜色为 0–1 范围
 */

// ===== 设计 Token（与 css/styles.css :root 一致）=====
const C = {
  white: { r: 1, g: 1, b: 1 },
  mint: { r: 0.518, g: 0.859, b: 0.365 },
  sky: { r: 0.11, g: 0.616, b: 0.894 },
  textPrimary: { r: 0.133, g: 0.133, b: 0.133 },
  textSecondary: { r: 0.467, g: 0.467, b: 0.467 },
  textMuted: { r: 0.333, g: 0.333, b: 0.333 },
};

const SHADOW_SOFT = [{
  type: 'DROP_SHADOW',
  color: { r: 0, g: 0, b: 0, a: 0.06 },
  offset: { x: 0, y: 8 },
  radius: 32,
  spread: 0,
  visible: true,
  blendMode: 'NORMAL',
}];

// ===== 环形水滴数据（与 js/index.js + data/bird.json 一致）=====
const RING_DATA = [
  { ring: 0, radiusRatio: 0.18, drops: [
    { id: 'magpie', emoji: '🐦' }, { id: 'kingfisher', emoji: '💎' },
  ]},
  { ring: 1, radiusRatio: 0.30, drops: [
    { id: 'swan', emoji: '🦢' }, { id: 'eagle', emoji: '🦅' }, { id: 'parrot', emoji: '🦜' },
  ]},
  { ring: 2, radiusRatio: 0.42, drops: [
    { id: 'flamingo', emoji: '🦩' }, { id: 'owl', emoji: '🦉' }, { id: 'peacock', emoji: '🦚' },
  ]},
  { ring: 3, radiusRatio: 0.54, drops: [
    { id: 'penguin', emoji: '🐧' }, { id: 'crane', emoji: '🕊️' },
    { id: 'hummingbird', emoji: '🐤' }, { id: 'woodpecker', emoji: '🪶' },
  ]},
];

const CONTAINER_SIZE = 520;
const DROP_SIZE = 44;
const FRAME_W = 1440;
const FRAME_H = 900;

// ===== 工具函数 =====
function solid(color, opacity = 1) {
  return [{ type: 'SOLID', color, opacity }];
}

function gradientMintSky() {
  return [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0.707, 0.707, 0], [-0.707, 0.707, 0.5]],
    gradientStops: [
      { position: 0, color: { ...C.mint, a: 1 } },
      { position: 1, color: { ...C.sky, a: 1 } },
    ],
  }];
}

function dropGradient() {
  return [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0.707, 0.707, 0], [-0.707, 0.707, 0.5]],
    gradientStops: [
      { position: 0, color: { ...C.mint, a: 0.15 } },
      { position: 1, color: { ...C.sky, a: 0.15 } },
    ],
  }];
}

async function loadFonts() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
}

function placeAwayFromExisting() {
  const page = figma.currentPage;
  let maxX = 0;
  for (const n of page.children) {
    maxX = Math.max(maxX, n.x + n.width);
  }
  return { x: maxX + 120, y: 0 };
}

// ===== 主流程 =====
await loadFonts();
const origin = placeAwayFromExisting();
const createdNodeIds = [];

// 根 Frame（垂直 Auto Layout，挂载到当前页）
const root = figma.createAutoLayout('VERTICAL', { name: '首页 / Homepage — Desktop 1440' });
root.resize(FRAME_W, FRAME_H);
root.x = origin.x;
root.y = origin.y;
root.fills = solid(C.white);
root.clipsContent = false;
root.primaryAxisSizingMode = 'FIXED';
root.counterAxisSizingMode = 'FIXED';
figma.currentPage.appendChild(root);
createdNodeIds.push(root.id);

// --- Navbar ---
const navbar = figma.createAutoLayout('HORIZONTAL', { name: 'Navbar' });
navbar.resize(FRAME_W, 72);
navbar.paddingTop = 16;
navbar.paddingBottom = 16;
navbar.paddingLeft = 32;
navbar.paddingRight = 32;
navbar.primaryAxisAlignItems = 'CENTER';
navbar.counterAxisAlignItems = 'CENTER';
navbar.primaryAxisSizingMode = 'FIXED';
navbar.counterAxisSizingMode = 'AUTO';
navbar.fills = [];
root.appendChild(navbar);
navbar.layoutSizingHorizontal = 'FILL';
createdNodeIds.push(navbar.id);

// Logo
const logoRow = figma.createAutoLayout('HORIZONTAL', { name: 'Logo', itemSpacing: 8 });
const logoIcon = figma.createEllipse();
logoIcon.name = 'Logo Icon';
logoIcon.resize(32, 32);
logoIcon.fills = gradientMintSky();
logoRow.appendChild(logoIcon);
const logoText = figma.createText();
logoText.name = 'Logo Text';
logoText.characters = '鸟类地球Online';
logoText.fontSize = 20;
logoText.fontName = { family: 'Inter', style: 'Bold' };
logoText.fills = solid(C.textPrimary);
logoRow.appendChild(logoText);
navbar.appendChild(logoRow);
createdNodeIds.push(logoRow.id);

// Nav spacer
const navSpacer = figma.createFrame();
navSpacer.name = 'Spacer';
navSpacer.layoutGrow = 1;
navSpacer.fills = [];
navbar.appendChild(navSpacer);

// Search
const searchBox = figma.createAutoLayout('HORIZONTAL', { name: 'Search Box' });
searchBox.resize(220, 40);
searchBox.cornerRadius = 999;
searchBox.paddingLeft = 16;
searchBox.paddingRight = 16;
searchBox.primaryAxisAlignItems = 'CENTER';
searchBox.fills = [{ type: 'SOLID', color: C.white, opacity: 0.9 }];
searchBox.effects = SHADOW_SOFT;
const searchText = figma.createText();
searchText.characters = '🔍  搜索鸟类...';
searchText.fontSize = 14;
searchText.fontName = { family: 'Inter', style: 'Regular' };
searchText.fills = solid(C.textMuted);
searchBox.appendChild(searchText);
navbar.appendChild(searchBox);
createdNodeIds.push(searchBox.id);

// About
const aboutText = figma.createText();
aboutText.name = 'About Link';
aboutText.characters = '关于我们';
aboutText.fontSize = 14;
aboutText.fontName = { family: 'Inter', style: 'Regular' };
aboutText.fills = solid(C.textMuted);
navbar.appendChild(aboutText);
createdNodeIds.push(aboutText.id);

// --- Hero ---
const hero = figma.createAutoLayout('HORIZONTAL', { name: 'Hero Section', itemSpacing: 32 });
hero.paddingTop = 96;
hero.paddingLeft = 32;
hero.paddingRight = 32;
hero.paddingBottom = 32;
hero.primaryAxisAlignItems = 'CENTER';
hero.counterAxisAlignItems = 'CENTER';
hero.fills = [];
root.appendChild(hero);
hero.layoutSizingHorizontal = 'FILL';
hero.layoutGrow = 1;
createdNodeIds.push(hero.id);

// Hero Text (1/3)
const heroText = figma.createAutoLayout('VERTICAL', { name: 'Hero Text (1/3)', itemSpacing: 16 });
heroText.layoutGrow = 1;
heroText.fills = [];

const title = figma.createText();
title.name = 'Hero Title';
title.characters = '鸟类地球\nOnline';
title.fontSize = 56;
title.fontName = { family: 'Inter', style: 'Bold' };
title.fills = solid(C.textPrimary);
title.lineHeight = { unit: 'PERCENT', value: 120 };
heroText.appendChild(title);

const underline = figma.createRectangle();
underline.name = 'Title Underline';
underline.resize(60, 4);
underline.cornerRadius = 2;
underline.fills = solid(C.mint);
heroText.appendChild(underline);

const desc = figma.createText();
desc.name = 'Hero Description';
desc.characters = '点击右侧环形中的水滴，探索天空与大地上的飞羽朋友。每一颗水滴，都是一段自然故事。';
desc.fontSize = 18;
desc.fontName = { family: 'Inter', style: 'Regular' };
desc.fills = solid(C.textSecondary);
desc.resize(360, desc.height);
desc.textAutoResize = 'HEIGHT';
heroText.appendChild(desc);

const cta = figma.createAutoLayout('HORIZONTAL', { name: 'CTA Button' });
cta.paddingTop = 12;
cta.paddingBottom = 12;
cta.paddingLeft = 24;
cta.paddingRight = 24;
cta.cornerRadius = 999;
cta.fills = gradientMintSky();
cta.effects = SHADOW_SOFT;
const ctaText = figma.createText();
ctaText.characters = '查看全部图鉴';
ctaText.fontSize = 15;
ctaText.fontName = { family: 'Inter', style: 'Semi Bold' };
ctaText.fills = solid(C.white);
cta.appendChild(ctaText);
heroText.appendChild(cta);
hero.appendChild(heroText);
createdNodeIds.push(heroText.id);

// Hero Ring Area (2/3) — 可编辑区
const ringArea = figma.createFrame();
ringArea.name = 'Hero Ring Area (2/3) — 可编辑区';
ringArea.resize(832, 600);
ringArea.layoutGrow = 1;
ringArea.fills = [{ type: 'SOLID', color: C.sky, opacity: 0.03 }];
ringArea.cornerRadius = 24;
ringArea.clipsContent = false;
hero.appendChild(ringArea);
createdNodeIds.push(ringArea.id);

// Ring Container
const ringContainer = figma.createFrame();
ringContainer.name = 'Ring Container';
ringContainer.resize(CONTAINER_SIZE, CONTAINER_SIZE);
ringContainer.x = (832 - CONTAINER_SIZE) / 2;
ringContainer.y = (600 - CONTAINER_SIZE) / 2;
ringContainer.fills = [];
ringContainer.clipsContent = false;
ringArea.appendChild(ringContainer);
createdNodeIds.push(ringContainer.id);

const cx = CONTAINER_SIZE / 2;
const cy = CONTAINER_SIZE / 2;

for (const ringDef of RING_DATA) {
  const radius = CONTAINER_SIZE * ringDef.radiusRatio;
  const ringFrame = figma.createFrame();
  ringFrame.name = `Ring ${ringDef.ring}`;
  ringFrame.resize(CONTAINER_SIZE, CONTAINER_SIZE);
  ringFrame.x = 0;
  ringFrame.y = 0;
  ringFrame.fills = [];
  ringContainer.appendChild(ringFrame);
  createdNodeIds.push(ringFrame.id);

  ringDef.drops.forEach((drop, i) => {
    const angle = (360 / ringDef.drops.length) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    const dropFrame = figma.createFrame();
    dropFrame.name = `Drop / ${drop.id}`;
    dropFrame.resize(DROP_SIZE, DROP_SIZE);
    dropFrame.x = cx + x - DROP_SIZE / 2;
    dropFrame.y = cy + y - DROP_SIZE / 2;
    dropFrame.rotation = angle + 90;
    dropFrame.cornerRadius = 22;
    dropFrame.fills = dropGradient();
    dropFrame.effects = SHADOW_SOFT;
    ringFrame.appendChild(dropFrame);

    const emoji = figma.createText();
    emoji.characters = drop.emoji;
    emoji.fontSize = 22;
    emoji.fontName = { family: 'Inter', style: 'Regular' };
    emoji.x = (DROP_SIZE - emoji.width) / 2;
    emoji.y = (DROP_SIZE - emoji.height) / 2;
    dropFrame.appendChild(emoji);
    createdNodeIds.push(dropFrame.id);
  });
}

// 标注可编辑区
const label = figma.createText();
label.name = 'Edit Hint';
label.characters = '← 请在此区域内修改水滴环形';
label.fontSize = 12;
label.fontName = { family: 'Inter', style: 'Regular' };
label.fills = solid(C.sky);
label.x = ringArea.x + 16;
label.y = ringArea.y + ringArea.height - 28;
root.appendChild(label);
createdNodeIds.push(label.id);

figma.currentPage.selection = [root];
figma.viewport.scrollAndZoomIntoView([root]);

return {
  success: true,
  frameName: root.name,
  frameId: root.id,
  createdNodeIds,
  note: '首页已导入。请编辑「Hero Ring Area」内的环形，完成后选中根 Frame 让我读取并更新代码。',
};
