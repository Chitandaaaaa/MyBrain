# MyBrain · UI 资产库标准（STANDARD）

> 本文是「个人 UI 参考资产库」的总标准。所有放进 `ui/` 下的风格资产，**必须**按本文组织，后续借鉴、检索、复用才不乱。
> 配套脚手架见 `ui/_template/`，新增资产直接复制它改名即可。

---

## 0. 这个库是什么 / 定位

- **性质**：个人 UI 参考资产库，**不是**要发布给别人的组件库，是给你自己"沉淀风格、抄结构、借配色"用的。
- **形态**：以**静态 HTML/CSS** 为主（因为很多是从别的网页"抄"来的片段，可能只有一部分）。也允许放原件截图 / 源文件备份。
- **核心原则**：
  1. **每个资产必须可溯源**——从哪来、谁做的、抄了哪部分、能不能商用，一眼能查。
  2. **结构一致**——所有资产内部文件清单、命名、文档格式统一，换谁加都一样。
  3. **提炼而非搬运**——存下来的应是"设计令牌 + 组件写法 + 拆解说明"，不是一坨不能看的源码。

---

## 1. 目录结构与命名

### 1.1 顶层
```
ui/
├── README.md          # 资产总览索引（资产表 + 标签 + 如何新增）
├── STANDARD.md        # 本文件（总标准）
├── _template/         # 脚手架模板（复制它来新建资产，不要直接改）
└── <asset-id>/        # 每个风格一个文件夹
```

### 1.2 单个资产文件夹
```
ui/<asset-id>/
├── meta.json          # 【必填】溯源与元数据（机器可读，可被索引生成画廊）
├── index.html         # 【必填】展示台：可视化预览 + 一键复制代码
├── tokens.css         # 【必填】设计令牌（颜色/字体/字阶/间距/圆角/阴影）
├── components.css     # 【必填】组件样式（基于令牌的具体组件）
├── notes.md           # 【必填】拆解与说明文档（按第 6 节写）
├── cover.png          # 【必填】预览缩略图（总览页快速浏览用，建议 1200×750）
├── original/          # 【必填】原件备份（原站 HTML / 截图 / 源文件）
│   └── README.md       #   说明原件来源与存放内容
└── fonts/             # 【可选】本地化字体（woff2），离线也能用
```

### 1.3 命名规则
- **文件夹名 `asset-id`**：全小写 `kebab-case`，英文或拼音，见名知意。
  好：`ai-time-where` / `bilibili-dashboard` / `glassmorphism-landing` / `neumorphism-card`
  差：`我的UI1` / `测试` / `UI-新`
- **中文名**放在 `meta.json` 的 `name` 字段，**不要**写进文件夹名（文件夹名要能当变量/路径用）。
- 资产内部文件**严格使用上表文件名**，不要自由发挥（如别把 `tokens.css` 叫 `ui-kit.css`、别把 `notes.md` 叫 `说明.md`）。这样总览页和将来的脚本才能统一读取。
- 已有资产（`ai-time-where`）可保留原名至下次编辑；新资产一律遵守。

---

## 2. meta.json 字段规范（溯源是重点）

JSON 不支持注释，字段含义见下。复制 `_template/meta.json` 后按实填写。

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 与文件夹名一致，kebab-case |
| `name` | ✅ | 中文名 / 可读名 |
| `summary` | ✅ | 一句话：什么风格、适合做什么 |
| `styleTags` | ✅ | 风格标签数组（见第 7 节枚举，可多选） |
| `useCases` | ✅ | 适用场景数组（见第 7 节枚举） |
| `sourceUrl` | ⚠️ | 原页面地址；纯自研填 `"self"` |
| `author` | ⚠️ | 原作者；自研填 `"self"`；未知填 `"unknown"` |
| `capturedAt` | ✅ | 抄录 / 创建日期 `YYYY-MM-DD` |
| `scope` | ✅ | `"full"`（完整）或 `"partial"`（只抄了一部分） |
| `scopeNote` | ⚠️ | `scope=partial` 时必填：抄了哪些区块、漏了哪些 |
| `license` | ✅ | 许可：`学习参考` / `可商用(注明出处)` / `self(自研)` / `unknown` |
| `adapted` | ✅ | 是否二次改动（bool） |
| `techStack` | ✅ | 如 `原生 HTML/CSS/JS，无框架` / `React+Tailwind` |
| `colors` | ✅ | 主色板 HEX 数组（前 5 个为主色） |
| `fonts` | ⚠️ | 用到的字体名数组 |
| `componentsCovered` | ✅ | 本资产覆盖的组件 id 数组（见第 4 节 id，如 `["button","card","kpi"]`） |
| `thumbnail` | ✅ | 预览图文件名，固定 `"cover.png"` |
| `notes` | ✅ | 拆解文档文件名，固定 `"notes.md"` |

> **为什么要有 `scope` / `scopeNote`**：你明确说过有些 UI 是"从别的页面抄的、可能只有一部分"。这两个字段就是为了防止以后翻出来以为是一整套，结果缺了弹窗、缺了表单。`partial` 必须写清楚抄了哪几块。

---

## 3. 组件分类总览（UI 库应该有哪些组件）

> **这是本库的核心词汇表。** 每当你保存一套新 UI，先在 `meta.json` 的 `componentsCovered` 里勾出它覆盖了哪些；总览页和未来的检索都靠这套统一 id。
> ✅=几乎必做的基础件；其余按需。每个组件给一行定义 + 关键设计点提示。

### 3.1 基础 Foundation
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `color-tokens` | 颜色系统 | 主色 + 语义色（成功/警告/危险/信息），统一用 CSS 变量 |
| `typography` | 排版 | 标题字阶（h1–h6）、正文、链接、引用、列表的统一规则 |
| `font-strategy` | 字体策略 | 每款字体的角色、来源（外链/本地）、回退链 |
| `icon` | 图标 | 线性/面性风格统一；内联 SVG 优先，避免引外部图标库碎文件 |
| `theme` | 主题（亮/暗） | 暗色模式如何用令牌切换（`[data-theme=dark]`） |

### 3.2 通用 General
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `button` ✅ | 按钮 | primary/secondary/ghost/danger；尺寸 sm/md/lg；loading、icon 按钮；hover/active 态 |
| `link` | 链接 | 默认/visited/hover/下划线策略 |
| `tag` / `badge` | 标签 / 徽章 | 状态色变体（soft/ink/orange/ok/warn/info） |
| `chip` | 芯片 | 可选中标签（筛选、多选） |
| `avatar` | 头像 | 方形/圆形、首字母占位、状态点 |
| `icon-button` | 图标按钮 | 仅图标的方形按钮，含 tooltip |

### 3.3 表单 Form
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `input` | 输入框 | 聚焦态（聚焦环/边框变色）、错误态、前后缀 |
| `textarea` | 文本域 | 自适应高度、计数 |
| `select` | 选择器 | 原生 / 自定义下拉 |
| `checkbox` | 复选框 | 自定义样式、 indeterminate 半选态 |
| `radio` | 单选 | 自定义样式 |
| `switch` | 开关 | 开/关态、品牌色 |
| `slider` | 滑块 | 单/双值、刻度 |
| `date-picker` | 日期选择 | 简单日期 / 区间 |
| `field` | 表单域 | label + 控件 + hint/error 的纵向容器布局 |

### 3.4 数据展示 Data Display
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `table` | 表格 | 通用表格（不是某站定制行）；斑马纹、hover、排序、固定表头 |
| `list` | 列表 | 单行/多行列表项、前后操作 |
| `card` ✅ | 卡片 | 图文卡、统计卡；圆角/描边/阴影策略 |
| `description` | 描述列表 | 键值对（详情页常用） |
| `accordion` | 手风琴 | 折叠面板（优先用原生 `<details>` 保键盘可达） |
| `tabs` | 标签页 | 下划线式 / 卡片式；`role=tab` + `aria-selected` |
| `empty` | 空状态 | 图标 + 文案 + 操作引导 |
| `skeleton` | 骨架屏 | 加载占位 |
| `progress` | 进度条 | 线性/环形；确定性/不确定 |
| `kpi` / `statistic` | 统计数值 | 大数字 + 单位 + 同比；数字用等宽数字 `tabular-nums` |
| `timeline` | 时间线 | 纵向步骤/事件 |
| `tree` | 树 | 层级展开 |
| `carousel` | 轮播 | 图片/卡片轮播 |

### 3.5 导航 Navigation
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `topbar` / `navbar` | 顶部导航 | 品牌 + 菜单 + 操作区；滚动行为 |
| `sidebar` | 侧边栏 | 多级菜单、折叠 |
| `breadcrumb` | 面包屑 | 分隔符、当前项 |
| `pagination` | 分页 | 页码 + 上/下页 + 省略 |
| `steps` | 步骤条 | 横向流程指示 |
| `menu` / `dropdown` | 下拉菜单 | 列表菜单、危险项分隔 |
| `toc` | 目录 / 锚点 | 长文侧栏导航 |

### 3.6 反馈 Feedback
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `modal` | 弹窗 | 居中/底部弹；遮罩、焦点陷阱、ESC 关闭 |
| `drawer` | 抽屉 | 左右/底部滑出 |
| `toast` | 轻提示 | 底部/顶部居中，自动消失 |
| `alert` | 警告条 | ok/warn/info/danger 四态 |
| `tooltip` / `popover` | 悬浮提示 / 气泡 | 纯 CSS 或 JS 控制显隐 |
| `loading` | 加载 | spinner / 骨架 / 按钮内 loading |
| `result` | 结果页 | 成功/失败/空 结果展示 |

### 3.7 布局 Layout
| id | 组件 | 定义 / 关键点 |
|---|---|---|
| `container` | 容器 | 宽度变体（narrow/wide，如 760/1120/1320） |
| `grid` | 栅格 | 响应式列（c2/c3/c4，断点自动单列） |
| `spacing` | 间距系统 | 用 `--s1..--s8` 尺度变量，**禁止裸像素** |
| `divider` | 分割线 | 横/纵分割 |
| `stack` / `cluster` | 间距组合 | 纵向 `stack`、横向换行 `cluster`，统一间距 |

### 3.8 业务区块 Sections（落地页/官网常用）
| id | 组件 | 定义 |
|---|---|---|
| `hero` | 首屏 | 大标题 + 副文案 + 主行动按钮 |
| `features` | 功能区 | 3–4 列特性卡 |
| `pricing` | 定价 | 套餐对比卡 |
| `faq` | 问答 | 折叠 FAQ |
| `cta` | 行动召唤 | 底部转化区 |
| `footer` | 页脚 | 多列链接 + 版权 |
| `error-page` | 404/错误 | 趣味空状态 |

> **覆盖度建议**：一套 UI 不一定全有。保存时**只勾它真实有的**，并优先把"它做得特别好"的那几个组件写细（见第 6 节）。

---

## 4. 设计令牌标准（每个资产至少提炼出这些）

`tokens.css` 用 CSS 自定义属性集中管理，组件层一律引用变量，不写死值。

```
:root{
  /* 颜色：主色（克制，先定 3–5 个）+ 语义色 */
  --paper:#fbf8f5; --ink:#132b69; --brand:#d04e00; --deep:#a00e00; --accent:#f6c200;
  --ok:#3f7d3a; --warn:#f6c200; --info:#0086a8; --err:#a00e00;
  --line: color-mix(in srgb, var(--ink) 10%, transparent); /* 分割线用主色派生 */

  /* 字体：数字体 / 手写体 / 正文体 各自的 font-family 变量 */
  --numf:'Khand',...; --hand:'Long Cang',...; --sc:'Noto Sans SC',...;

  /* 字阶：1.25 比例阶梯，h1–h6 + 正文 + 小字 */
  --fs-display:40px; --fs-h1:32px; --fs-h2:24px; ... --fs-sm:13px;

  /* 间距尺度：4 的倍数 */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:64px;

  /* 圆角 */
  --r-card:22px; --r-panel:20px; --r-kpi:16px; --r-row:13px; --r-pill:999px;

  /* 阴影/描边：薄阴影优先，靠 inset 描边 */
  --shadow-card: 0 18px 40px -28px rgba(0,0,0,.25);

  /* 动效时长 */
  --t-fast:120ms; --t-base:200ms; --ease: cubic-bezier(.2,.9,.3,1.2);

  /* 层级 */
  --z-modal:100; --z-toast:200; --z-tooltip:300;
}
```

> 暗色模式：在 `[data-theme="dark"]` 下只覆盖颜色变量，组件样式一行不改。

---

## 5. 文档标准（notes.md 必须写什么）

按 `_template/notes.md` 的骨架写，至少包含：

1. **这是什么风格**：一句话 + 3 个英文关键词（如 Risograph / Grid Paper / Hand Lettering）。
2. **配色**：主色板（HEX + 用途）、语义状态色，注明"是否用纯白/纯黑"（通常不该用）。
3. **字体**：每款字体名 + 角色 + 来源（外链/本地）+ 回退链。
4. **组件细节**：覆盖到的每个组件，给核心 CSS 片段 + "为什么这样写"。
5. **最容易漏掉的 N 个细节**：把踩过的坑、看不出但要有的处理（如极淡斜纹、tabular-nums）列出来。
6. **文案**（若值得抄）：好用的标题/口径说明/诚实声明原文与写法分析。
7. **技术栈**：框架、CSS 量、数据来源、图标方式、体积。
8. **怎么复用**：最小可用 HTML 骨架（`<link>` 引入 + body 类 + 几个示例组件）。
9. **溯源与许可**：来源链接、作者、抄录日期、`scope` 说明、可否商用。

---

## 6. 风格 / 场景标签体系（枚举，避免每次乱起名）

### 6.1 styleTags（风格，可多选）
`risograph`(丝网印/复古印刷) · `minimal`(极简) · `glassmorphism`(玻璃拟态) · `neumorphism`(新拟物) · `brutalism`(粗野主义) · `swiss`(瑞士国际主义) · `dark`(暗黑) · `gradient`(渐变) · `3d`(3D/立体) · `illustration`(插画风) · `cute`(可爱卡通) · `guochao`(国潮) · `tech`(科技感) · `retro`(复古) · `handdrawn`(手绘) · `editorial`(杂志排版)

### 6.2 useCases（适用场景）
`dashboard`(数据看板) · `landing`(落地页) · `admin`(后台管理) · `blog`(内容博客) · `h5`(移动端 H5) · `tool`(小工具) · `portfolio`(作品集) · `ecommerce`(电商) · `docs`(文档站) · `onboarding`(引导) · `report`(报告/长图)

---

## 7. 复用 / 禁止项（通用 don'ts）

1. **不要新增主色**——先借现有色板，借不到再提。
2. **不要用纯白/纯黑**做背景或正文（除非该风格本就如此，且写进 notes）。
3. **色块上色用 `background-color`**，别用 `background` 简写——会清掉 `background-image`（斜纹/渐变）且不报错。
4. **手写/装饰字体只做标签/批注，不做正文**——一多就土。
5. **阴影要薄**：靠 `inset 0 0 0 1px` 描边为主；大面积模糊投影慎用。
6. **间距用 `--s*` 令牌**，不要到处写 `margin:13px` 裸像素。
7. **数字一律等宽** `font-variant-numeric:tabular-nums`，跳动不抖。
8. **不要为"好看"无脑加渐变/发光/大阴影**——先想清楚这套风格的语言。
9. **组件可访问性基线**：可点元素有 `:focus-visible` 聚焦环；`prefers-reduced-motion` 下关动画；颜色不作为唯一信息载体（状态配文字/图标）。
10. **溯源必须诚实**：抄来的标 `sourceUrl` + `author` + `scope`，别冒充自研。

---

## 8. 新增资产流程（照做即可）

1. 复制 `ui/_template/` → 改名为 `ui/<asset-id>/`。
2. 填 `meta.json`（按第 2 节；`scope=partial` 必写 `scopeNote`）。
3. 把**原件**放进 `original/`：原站 HTML、截图、或源文件；写 `original/README.md` 说明。
4. 提炼 `tokens.css`（颜色/字体/间距/圆角/阴影令牌）。
5. 写 `components.css`（具体组件，引用令牌）。
6. 做 `index.html` 展示台：能预览 + 点一下复制代码。
7. 写 `notes.md`（按第 5 节）。
8. 截一张 `cover.png`（1200×750 左右）放根目录。
9. 在 `ui/README.md` 的**资产表**登记一行。
10. 自检（见第 9 节）通过后再提交。

---

## 9. 存之前评审清单（自检）

- [ ] 文件夹名是 kebab-case，见名知意
- [ ] `meta.json` 字段齐全，`scope=partial` 已写 `scopeNote`
- [ ] `index.html` 能正常打开预览，组件可复制
- [ ] `tokens.css` 集中管理，组件无裸色值/裸像素
- [ ] `notes.md` 含风格关键词、配色、字体、组件细节、坑、溯源
- [ ] `original/` 有原件或截图 + 说明
- [ ] `cover.png` 已截
- [ ] 已在 `ui/README.md` 资产表登记
- [ ] 字体/图片许可允许你保存与后续借鉴（注意商用边界）
