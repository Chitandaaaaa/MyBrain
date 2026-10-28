# 《AI 时间都去哪了》· 设计系统使用规范（标准档）

> 基于 `ui-kit.css` 的设计令牌，扩展出通用组件层 `ui-components.css`。
> 本文档定义「怎么用这套规范」，而不是「原站怎么做的」。
> 视觉语言：中文复古印刷 / Risograph —— 纸底、藏青墨、唯一焦橘行动色、网格纸、手写标签、硬投影。

---

## 一、怎么引用

一个标准 web 页面，按顺序引入：

```html
<!-- 字体（见第二节策略） -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Long+Cang&family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">

<!-- 设计系统：先令牌层，后组件层 -->
<link rel="stylesheet" href="ui-kit.css" />
<link rel="stylesheet" href="ui-components.css" />

<!-- 只有用到「堆叠条 + 手绘标注」时才需要；其余组件全是纯 CSS -->
<script src="js/stacked-bar.js"></script>
```

最小页面骨架：

```html
<body class="paper">
  <div class="wrap">
    <p class="eyebrow">Section</p>
    <h1 class="title-lg">标题</h1>
    <button class="btn btn-primary">开始</button>
  </div>
</body>
```

---

## 二、字体策略（务必统一，否则跨平台会漂移）

四款字体，两套来源：

| 字体 | 角色 | 来源 | 状态 |
|---|---|---|---|
| **Khand** | 数字 / 英文小标 | `fonts/` 本地 woff2（latin 子集，已随包） | ✅ 已本地化 |
| **Hind** | 中文正文兜底 / 单位 | `fonts/` 本地 woff2（latin 子集，已随包） | ✅ 已本地化 |
| **Long Cang** | 手写中文标签 | Google Fonts 外链（见上） | ⚠️ 未本地化，走外链 |
| **Noto Sans SC** | 中文标题 900 | Google Fonts 外链（见上） | ⚠️ 未本地化，走外链 |

**为什么 Long Cang / Noto Sans SC 不本地化**：中文字体 woff2 体积大（数 MB 起），且非商业风险——全部来自 Google Fonts，免费可商用。统一走外链，全站一致；离线时优雅回退到系统字体（macOS 华文行楷 / 各平台无衬线），不报错。

**回退链**（已在令牌里写好，无需改）：
- 手写：`'Long Cang','华文行楷','STXingkai','KaiTi','楷体',cursive`
- 中文标题/正文：`'Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`

---

## 三、令牌速查（复用，不要新建颜色）

**主色（克制，最多用这 5 个）**
`--paper #fbf8f5` / `--ink #132b69` / `--orange #d04e00`（唯一行动色）/ `--deep #a00e00`（硬投影/危险）/ `--yellow #f6c200`（高亮/聚焦环）

**语义状态色（新增，仅用于状态表达）**
`--ok #3f7d3a` / `--warn #f6c200` / `--info #0086a8` / `--err #a00e00`
> 状态色≠行动色。按钮主色永远用 `--orange`；红 `--err` 只用于危险/错误，不用于普通按钮。

**字体变量**：`--numf`（Khand 数字）/ `--hand`（手写）/ `--sc`（中文正文标题）

**圆角**：`--r-card 22` / `--r-panel 20` / `--r-kpi 16` / `--r-row 13` / `--r-pill 999`

**间距尺度**：`--s1..--s8` = 4/8/12/16/24/32/48/64 px。组件内外边距一律引用它，**不要写裸像素**。

---

## 四、组件清单（标准档已覆盖）

### 基础（来自 ui-kit.css）
`eyebrow` `title-xl/L` `sub` `lede` `note` · `btn` `btn-primary` `btn-ghost` `btn-danger` `btn-sm` · `card` `panel` · `chips` · `seg` 分段控件 · `icon-btn` · `kpis`/`kpi` · `stage`/`bar`/`seg-i` 堆叠条（**标注层见本节末尾「图表」**） · `legend`/`row` 图例行 · `bar-track`/`bar-fill` 进度条 · `alert`/`stem`/`badge` · `topbar` · `link` 链接（hover 橘色下划线） · `footer` 页脚

### 表单（ui-components.css 新增）
| 类 | 用途 |
|---|---|
| `.field` | label + 输入 + hint 的纵向容器 |
| `.input` `textarea.input` `.select` | 输入框（聚焦有黄色聚焦环） |
| `.check` `.check.radio` | 自定义复选 / 单选（隐藏原生 input） |
| `.switch` | 开关（开=焦橘） |
| `.sliders` `.slider` + `input[type=range]` | 设置滑块：原生 range + `accent-color:var(--orange)`（不自绘 thumb）；label 左、数值右；≤860px 单列 |

### 反馈（新增）
| 类 | 用途 |
|---|---|
| `.alert-ok` `.alert-warn` `.alert-info` | 在原 `.alert`（危险）基础上的状态变体 |
| `.modal-backdrop` `.modal` `.m-foot` | 居中弹窗（`<details>`/JS 控制显隐） |
| `.toast` | 底部居中轻提示 |
| `.tip` + `data-tip="…"` | 纯 CSS 悬浮提示 |

### 导航结构（新增）
| 类 | 用途 |
|---|---|
| `.tabs` `.tab[aria-selected]` | 标签页（下划线式） |
| `.breadcrumb` `.sep` `.cur` | 面包屑 |
| `.pager` `.pg[aria-current]` | 分页 |
| `.menu` `.menu-item` `.menu-sep` `.danger` | 下拉/列表菜单 |
| `.acc-item` `.acc-head` `.chev` `.acc-body` | 手风琴（用原生 `<details>`） |

### 数据展示（新增）
| 类 | 用途 |
|---|---|
| `.table` `th/td` `.num` | 通用表格（不是原站定制 row） |
| `.empty` `.ico` `.sub` | 空状态 |
| `.skeleton` | 加载占位条 |
| `.tag` `tag-soft/ink/orange/ok/warn/info` | 标签/徽章变体 |
| `.avatar` `.o/.i/.g` | 头像方块 |
| `.list` `.list-item` `.list-detail` | 列表行：可展开明细（从原站会话列表提炼的通用件；点击整行切 `.open` 展开 `.list-detail`） |

### 布局系统（新增）
| 类 | 用途 |
|---|---|
| `.wrap-wide`(1320) `.wrap-narrow`(760) | 容器宽度变体（默认 `.wrap`=1120） |
| `.grid` `.c2/.c3/.c4/.auto` | 栅格（≤860px 自动单列） |
| `.stack` `.s2..s6` | 纵向间距组合 |
| `.cluster` `.s2..s5` `.between` | 横向换行间距组合 |
| `.bar-chart` `.col` `.fill` `.lab` | 通用迷你柱图（纯 CSS，无需 JS；区别于签名堆叠条） |
| `.hide-sm` | 窄屏（≤560px）隐藏工具类 |

### 图表 · 堆叠条 + 手绘标注（签名组件，新增）

这套 UI 真正被记住的不是按钮，是这条「色条 + 手写批注」。它**四层**叠出来，缺一层就不是这个味道：

| 层 | 类 | 职责 |
|---|---|---|
| 1 色块 | `.stage` > `.bar` > `.seg-i` | 横向 100% 构成；宽度=占比；首尾分段各带单边 14px 圆角 |
| 2 块内数值 | `.pcts` > `.pct` | Khand 34px + `%` 降级到 15px；**放得下才画** |
| 3 引线 | `.leads`（一个 `<svg>`） | 每个标签一条三次贝塞尔，落点 = 分段中线 |
| 4 条外标签 | `.hand-wrap` > `.hand-label` | Long Cang 36px；双车道（上/下）；整层 `pointer-events:none` |

**HTML 契约**（`.stage` 上 `data-stacked-bar`，分段上三个 data）：

```html
<div class="stage" data-stacked-bar style="height:340px">
  <div class="bar">
    <div class="seg-i" style="width:28%;background-color:#132b69"
         data-name="工作" data-pct="28" data-dark="1"></div>
  </div>
  <div class="pcts"></div>
  <svg class="leads"></svg>
</div>
```

| 属性 | 必填 | 说明 |
|---|---|---|
| `data-name` | ✅ | 手写标签文字（也用于降级文案） |
| `data-pct` | ✅ | 整数百分比，只用于显示；**中线位置按实测宽度算，不信这个数** |
| `data-dark` | ⬜ | `1` = 深色块，块内百分比用纸白 `#fbf8f5`；黄色/浅色不要写 |

**四条硬规则（都是踩过的坑）**：
1. **放不下就降级，绝不缩字号硬塞**——分段宽 < 数字宽+16px 时不画块内百分比，改拼成「搭建运行环境, 3%」。柱子永远占满整行，不被数字撑破。
2. **奇数下标走下方车道**（0/2/4/6 上，1/3/5/7 下）；同车道从左往右贪心排布，优先贴自己分段的中线，右边越界整组左推，左推过头再顶回来。
3. **整条车道放不下才缩字号**，等比 ×0.9、最小 17px、最多 8 轮——宁可字小，不可丢标签。
4. **引线是弧线不是直线**：控制点走 55% 纵向距离，才能斜着连又不穿色块；`stroke:var(--ink)`、2.2px、`linecap:round`、`.85` 透明。

**为什么这层必须带 JS**：纯 CSS 无法「测量标签宽度 + 避让 + 把引线端点算到某个 DOM 的中线上」。100 行、零依赖、`window.resize` + `document.fonts.ready` 各重排一次（手写体是外链，字体到位宽度会变）。窄屏（<560px）整层隐藏，只留块内百分比——手写标签在手机上没有不打架的排法。

**别乱用**：这套标注只适合 5–8 段、占比差异大的构成条。超过 8 段或各段差不多宽，标签会互相推挤、引线交叉，不如退回「色块 + 图例表格（`.row`）」。

---

## 五、禁止项（don'ts）

1. **不要新增主色**。要新颜色，先从 5 主色 + 9 分类色里借，借不到再提。
2. **不要用纯白/纯黑背景或文字**。纸底 `#fbf8f5`、墨 `#132b69`。
3. **不要给色块用 `background` 简写设色**——会清掉斜纹的 `background-image`，动画静默失效。用 `background-color`。
4. **手写体（Long Cang）只做标签/批注，不做正文**。一多就土。
5. **阴影要薄**：靠 `inset 0 0 0 1px` 描边，不要大面积模糊投影。只有按钮用 `0 4px 0` 硬投影。
6. **间距用 `--s*` 令牌**，不要到处写 `margin:13px` 这种裸像素。
7. **数字一律 Khand + tabular-nums**，跳动不抖。
8. **不要为了"好看"加渐变/阴影/发光**。Risograph 的灵魂是"印上去的平色块"。
9. **不要让数字撑破柱子**。放不下就降级到标签后（「名, 3%」），别缩字号硬塞、别让数字盖到隔壁色块。
10. **引线不要穿过色块、也不要横平竖直硬拐**。必须从条外落点起弧，终点对准分段中线；引线颜色只准用墨色，不用分类色。
11. **标注层必须是"可摘掉"的**：`.pcts`/`.leads`/`.hand-wrap` 三层都不参与布局，删掉后应退回一根干净的色条。这是判断有没有写对的唯一标准。

---

## 六、可访问性基线
- 所有可点元素有 `:focus-visible` 黄色聚焦环（已内置）。
- 标签页用 `role="tab"` + `aria-selected`；手风琴用原生 `<details>` 自带键盘可达。
- `prefers-reduced-motion` 下动画自动关闭（ui-kit.css 已处理）。
- 颜色不作为唯一信息载体：状态除颜色外配文字/图标。

---

## 七、技术路线说明
当前是**纯手写 CSS + 设计令牌**，零框架、零构建。适合单页 / 小工具 / 内容站。
若项目膨胀到 10+ 页面，建议把这套令牌迁成 Tailwind preset 或 CSS Modules，类名不变即可平滑过渡。
