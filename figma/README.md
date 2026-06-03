# 首页 → Figma 导出说明

> 源码：`index.html` + `css/styles.css`（项目无 `custom.css`）  
> 设计规范：`homepage-design-spec.json`  
> 自动导入脚本：`import-to-figma.js`

---

## 方案 A：一键导入 Figma（推荐）

1. 在 Figma 打开或新建 Design 文件  
2. 复制浏览器地址栏中的 **fileKey**：
   ```
   https://www.figma.com/design/【fileKey】/文件名
   ```
3. 在 Cursor 中对 AI 说：
   ```
   用 use_figma 执行 figma/import-to-figma.js，fileKey 是 YOUR_FILE_KEY
   ```
4. 导入完成后，画布会出现 Frame：**「首页 / Homepage — Desktop 1440」**

### 导入后你会看到

| 图层 | 对应 CSS 类 |
|------|-------------|
| Navbar | `.navbar` |
| Logo / Search Box / About Link | `.logo` `.search-input` `.about-btn` |
| Hero Text (1/3) | `.hero-text` |
| Hero Ring Area (2/3) — 可编辑区 | `.hero-ring-area` |
| Ring Container + Ring 0~3 + Drop | `#ring-container` `.ring` `.drop` |

**请在「Hero Ring Area」内修改右侧环形**，左侧文案和导航尽量保持不动。

---

## 方案 B：手动对照 JSON 还原

打开 `homepage-design-spec.json`，按以下顺序在 Figma 搭建：

1. 创建 Frame **1440 × 900**，命名 `首页 / Homepage — Desktop 1440`
2. 应用 `designTokens.colors` 中的色值
3. 按 `layout.navbar` 搭建顶部导航（Logo 32px 圆 + 搜索框 220×40 + 关于我们）
4. 按 `layout.hero` 做 **1:2 横向分栏**（gap 32px，padding-top 96px）
5. 左侧：标题 56px Outfit Bold + 薄荷绿下划线 60×4 + 正文 max-width 360 + 渐变按钮
6. 右侧：832×600 容器，居中放置 **520×520 Ring Container**
7. 按 `layout.hero.children[1].children[0].rings` 放置 12 颗水滴（44×44，圆角 `50% 50% 50% 5%`）

水滴坐标公式（与 `js/index.js` 一致）：

```
angle = (360 / count) * index - 90
x = cos(angle°) * radius
y = sin(angle°) * radius
rotation = angle + 90
centerX = 260 + x   // 520 容器中心
centerY = 260 + y
```

---

## 方案 C：HTML 截图对照（最快视觉对齐）

1. 用 Live Server 打开 `index.html`
2. 浏览器全屏截图 1440 宽
3. Figma → Place image → 锁定为背景参考层
4. 在其上按 `homepage-design-spec.json` 重建矢量图层
5. 完成后删除参考图

---

## 改完 Figma 后如何回写代码

1. 在 Figma 选中整个 **「首页 / Homepage — Desktop 1440」** Frame  
2. 若用 TalkToFigma 插件：告诉我频道名，说「已连接，请读取首页并更新代码」  
3. 若用 Cursor Figma 插件：把 Figma 文件链接发给我

我会重点读取 **Hero Ring Area** 的：

- 容器尺寸与位置
- 各圈半径、水滴数量与角度
- 水滴形状（圆角/渐变/阴影）
- 颜色与间距变更

然后更新 `index.html`、`css/styles.css`、`js/index.js`。

---

## 设计 Token 速查

| Token | 值 |
|-------|-----|
| 薄荷绿 | `#84DB5D` |
| 天空蓝 | `#1C9DE4` |
| 背景 | `#FFFFFF` |
| 标题字体 | Outfit Bold 56px |
| 正文字体 | Nunito Regular 17.6px |
| 内容最大宽 | 1280px |
| 环形容器 | 520 × 520px |
| 水滴尺寸 | 44 × 44px |
| 圈半径比 | 0.18 / 0.30 / 0.42 / 0.54 |
