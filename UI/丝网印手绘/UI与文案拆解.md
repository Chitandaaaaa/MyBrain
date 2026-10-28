# 《AI 时间都去哪了》· UI 与文案拆解

> 作品：AI 时间都去哪了（#1575）· 作者 阿酒
> 原站：https://ai-time-where.app.workbuddy.host/?sharecode=35XLQ7EOFS
> 拆解时间：2026-10-26

---

## 一、这是什么 UI

**不是组件库，是纯手写 CSS。** 全站没有一个框架、没有一个 UI 库（没有 Tailwind、没有 shadcn、没有 Bootstrap），
一共 **196 行手写样式、13.5KB CSS**，靠 **5 个颜色 + 3 套字体 + 1 张网格纸底纹** 就把气质做出来了。

风格可以叫「**中文复古印刷海报**」，英文描述用这三个词最准：

| 关键词 | 对应做法 |
|---|---|
| **Risograph**（丝网印） | 低饱和油墨色、只有 5 个主色、色块叠印感 |
| **Grid Paper**（方格稿纸） | 28px 网格纸底纹，墨色 5% |
| **Hand Lettering**（手写批注） | Long Cang 毛笔行楷做分类名和批注 |

一句话：**纸感 → 墨色 → 手写 → 硬投影**，四个动作做完整套视觉。

---

## 二、配色

### 主色板（只有 5 个，克制是高级感来源）

| 名称 | HEX | 用途 |
|---|---|---|
| 纸底 paper | `#fbf8f5` | 全站背景。**不用纯白**，暖一点点 |
| 藏青墨 ink | `#132b69` | 正文 + 所有描边 + KPI 数字。**不用纯黑** |
| 焦橘 orange | `#d04e00` | 唯一行动色：按钮、强调、eyebrow |
| 深枣红 deep | `#a00e00` | 只用来做按钮的「硬投影」和危险提示 |
| 芥末黄 yellow | `#f6c200` | 高亮条、聚焦环、渐变尾 |
| 描边 line | `#132b691a` | 墨色 10% 的分割线 |

### 分类色（9 类，全部是「印刷油墨」式低饱和）

| 分类 | HEX |
|---|---|
| 闲聊 | `#e58aa6` |
| 修复BUG | `#a00e00` |
| 搭建运行环境 | `#d04e00` |
| 测试技能 | `#f6c200` |
| 搜索信息 | `#0086a8` |
| 图片创作 | `#5f8f3e` |
| 视频创作 | `#7b4fa3` |
| 写小说 | `#8a6d3b` |
| 工作 | `#132b69` |

> 关键：**没有一个霓虹色**。9 个颜色饱和度都压在 45–60%，所以并排堆在一条堆叠条上也不打架。

---

## 三、字体（这是最值得抄的一层）

三套字体分工，各管一段，绝不混用：

### 1. Khand — 数字与英文小标
```css
font-family: 'Khand','Bahnschrift','Arial Narrow','Oswald',ui-sans-serif,sans-serif;
```
窄体、方头、带点手写印刷体味道。所有数字、百分比、英文小标都用它。
英文小标还额外加了 `text-transform:uppercase; letter-spacing:.3em` —— 超宽字距的英文小标是复古画册的标配。

### 2. Long Cang 龙藏体 — 手写标签
```css
font-family: 'Long Cang','华文行楷','STXingkai','Xingkai SC','KaiTi','楷体','STKaiti','Kaiti SC',cursive;
```
Google Fonts 上少见的**中文毛笔行楷**。只用在分类名、手写批注上 —— 一下把表格从「仪表盘」拉成「手账」。
不装字体时优雅回退到 macOS 自带的「华文行楷」。

### 3. Noto Sans SC 900 — 中文标题
```css
font-family:'Noto Sans SC',sans-serif; font-weight:900; letter-spacing:-.02em;
```
标题固定 900 字重 + 负字距 −0.02em + 行高 1.05，压得很紧很有海报感。正文则是 Hind + Noto Sans SC 400。

> 四款字体全部来自 Google Fonts，**免费可商用**。

---

## 四、组件细节

### 按钮 · 硬投影
```css
.btn{display:inline-flex;align-items:center;gap:9px;border-radius:999px;font-weight:700;
  padding:15px 26px;font-size:16px;transition:transform .12s,box-shadow .12s,background .12s}
.btn-primary{background:var(--orange);color:var(--paper);box-shadow:0 4px 0 var(--deep)}
.btn-primary:hover{background:#e05600}
.btn-primary:active{transform:translateY(4px);box-shadow:none}
```
橘色 + `box-shadow:0 4px 0` 深枣红做**硬投影**（不是模糊投影）；按下时整体 `translateY(4px)` 且投影归零 —— 像真的按下一块印版。

### 卡片
```css
.card{background:#ffffffd9;border-radius:22px;
  box-shadow:0 1px 0 #132b6922, 0 18px 40px -28px #132b6940;
  padding:26px 26px 24px}
```
圆角很大（22px）但阴影很薄（−28px 扩散），主要靠 `inset` 描边而不是投影，所以轻盈。

### KPI 数字卡
```css
.kpi{background:#ffffffcc;border-radius:16px;padding:16px 18px;box-shadow:inset 0 0 0 1px #132b6914}
.kpi .val{font-size:40px;line-height:1.1;display:flex;align-items:baseline;gap:4px}
.kpi .val small{font-size:15px;font-weight:600;font-family:Hind,sans-serif;opacity:.65}
```
数字用 Khand 40px，单位用 15px 的 Hind 且 `opacity:.65` 压下去 —— **数字和单位必须不同体、不同级**。

### 堆叠条 · 斜纹流动
```css
.seg-i{background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.07) 0 10px,transparent 10px 22px);
  background-size:200% 100%;animation:drift 18s linear infinite;transition:width .5s cubic-bezier(.2,.9,.3,1.2)}
@keyframes drift{to{background-position:-400px 0}}
```
色块上盖一层 7% 白色斜纹并让它缓慢流动，大色块就不闷；整条外层加 `filter:drop-shadow(0 10px 0 #132b6914)` 做纸张厚度感。

> ⚠️ **必踩的坑**：给色块设颜色只能写 `background-color`，**不能写 `background`**。
> `background` 是简写属性，会连带把 `background-image` 重置成 `none` —— 斜纹和流动动画会静默消失，还不报错。
> 原站 JS 里就是 `style="background-color:'+s.color+'"` 这样拼的。
>
> 另外注意：原站的斜纹**故意做得极淡**（白 7%、18 秒才走 400px），它的作用不是「装饰动画」，而是给大色块加一层油墨纹理，让色块看起来是「印上去的」而不是「填色」。
> 所以**看不出流动是正常的**；想明显一点，把透明度提到 `.16`–`.22`、时长缩到 `6s` 左右。

### 签名组件 · 手绘标注层（四层结构）

这条色条之所以让人记住，不是因为颜色，而是因为**分类名在条外、用弧线连回色块**。四层，缺一层就散：

```css
.pcts{position:absolute;inset:0;pointer-events:none}                 /* 2 块内百分比 */
.pct{position:absolute;display:inline-flex;align-items:baseline;gap:5px;white-space:nowrap;
  font-family:var(--numf);font-weight:700;font-size:34px;line-height:1;color:var(--ink)}
.pct i{font-style:normal;font-size:15px;opacity:.85}                  /* % 号降一级 */
.leads{position:absolute;inset:0;pointer-events:none;overflow:visible} /* 3 引线 */
.leads path{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;opacity:.85}
.hand-wrap{position:absolute;top:0;pointer-events:none;will-change:transform} /* 4 标签 */
.hand-wrap .hand-label{display:block;white-space:nowrap;font-family:var(--hand);line-height:1.05}
```

**HTML 契约**：`.stage[data-stacked-bar]` 里放 `.bar > .seg-i`（段上写 `data-name` / `data-pct` / `data-dark`）+ 空的 `.pcts` + 空的 `<svg class="leads">`，剩下交给 `js/stacked-bar.js`。

**四条规则（原站就是这么做对的）**：

1. **数字放不下就不画**。分段宽度 < 数字宽 + 16px 时，块内不出百分比，改拼成「搭建运行环境, 3%」。柱子永远占满整行——这条决定了它在 5% 的小段上也不难看。
2. **双车道避让**。奇数下标走下方车道；同车道从左往右贪心排布，`x = max(自己的中线, 上一个的右边缘 + 间距)`，右边越界整组左推。
3. **实在放不下才缩字号**，等比 ×0.9、最小 17px、最多 8 轮。宁可字小，不可丢标签。
4. **引线是三次贝塞尔，落点=分段中线**。控制点走 55% 纵向距离，所以标签被挤偏了也能斜着连回来，不穿色块。终点用 `centers[i]`（实测），不用 `data-pct` 推算。

**为什么必须带 JS**：纯 CSS 无法「测文字宽度 + 避让 + 把 SVG 端点算到某个 DOM 的中线」。100 行、零依赖；`resize` 和 `document.fonts.ready` 各重排一次（Long Cang 是外链字体，到位后宽度会变，不重排就会错位）。窄屏（<560px）整层隐藏，只留块内百分比。

**适用边界**：5–8 段、占比差异大的构成条。段数再多或各段接近等宽，标签会互相推挤、引线交叉，这时退回「色块 + `.row` 图例表格」更稳。

### 分段控件
```css
.seg{display:inline-flex;background:#132b690d;border-radius:999px;padding:3px}
.seg button[aria-pressed=true]{background:#fff;color:var(--ink);box-shadow:0 1px 3px #132b6926}
```
墨色 5% 胶囊底槽 + 白色滑块，没有边框也不会糊在一起。

### 设置滑块（range）
```css
.sliders{display:grid;gap:26px 40px;grid-template-columns:1fr 1fr}
.slider{background:#132b6908;border-radius:13px;padding:13px 15px}
.slider label{display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:8px}
.slider label span{font-family:var(--numf);font-size:15px;font-weight:700;color:var(--orange)}
input[type=range]{width:100%;accent-color:var(--orange)}
```
**关键：不自绘 thumb。** 一条 `accent-color` 就让原生 range 的填充、圆钮、聚焦环全变成焦橘，还白拿键盘操作与无障碍语义。自己写 `::-webkit-slider-thumb` / `::-moz-range-thumb` 等于跨浏览器重造一遍，费力不讨好。原站用它调统计口径（单段间隔封顶 / 离开判定），数值用 Khand + 焦橘和标签同基线；窄屏 `.sliders` 自动单列。

### 网格纸底纹（整套 UI 的灵魂）
```css
[data-k=paper]{
  background-color:var(--paper);
  background-image:linear-gradient(#132b690d 1px,transparent 1px),
                   linear-gradient(90deg,#132b690d 1px,transparent 1px);
  background-size:28px 28px;
}
```
线宽 1px、墨色 5%、**28px** 一格（不是常见的 24 或 32）。

---

## 五、抄这套 UI 最容易漏掉的 6 个细节

1. **圆角很大但阴影很薄** —— 卡片 22px 圆角，只用 `inset 0 0 0 1px #132b6912` 描边，不用大面积投影。
2. **透明度写死成十六进制** —— 全站没有 `rgba()`，一律 `#132b69cc` / `#132b6980` 这种写法，一个墨色靠 alpha 派生出整条灰阶。
3. **纸底从不纯白** —— 卡片是 `#ffffffd9`（白 85%），让底下的网格纸纹透上来一点点。
4. **网格 28px** —— 线宽 1px、墨色 5%，正好不和常见的 24/32 撞。
5. **数字用 tabular-nums** —— `font-variant-numeric:tabular-nums`，数字跳动时不抖。
6. **手写体只做「标签」不做「正文」** —— Long Cang 只出现在分类名和批注上，正文一律无衬线。手写体一多就土。
7. **斜纹必须用 `background-color` 上色** —— 写 `background` 简写会把斜纹的 `background-image` 一起重置掉，动画静默失效（本项目实测踩过）。

---

## 六、文案（写法本身也值得抄）

### 标题与简介
- **页面标题**：AI 时间都去哪了 · 会话分类统计
- **一句简介**：读取本机 WorkBuddy 会话记录，把 AI 使用时间按闲聊 / 修复BUG / 搭建环境 / 测试Skill&MCP / 搜索信息 / 工作 分类统计。全部在浏览器本地解析，数据不上传。

### 9 个分类名
`闲聊` / `修复BUG` / `搭建运行环境` / `测试技能` / `搜索信息` / `图片创作` / `视频创作` / `写小说` / `工作`

> 命名口径：**动词开头、不缩写**（「搭建运行环境」而不是「环境」），「修复BUG」保留英文大写 —— 这比清一色四字词更像真人写的。

### 口径说明（这段写法最值得学）
> 这里算的不是「窗口开了多久」，而是「你真正在跟它来回折腾了多久」：把相邻两条消息的间隔加起来，单段最多算 **90** 分钟就当你人走了，那段时间不计入。

句式为「**不是 A，而是 B**」+ 具体数字 + 口语化比喻（「当你人走了」）。解释统计口径最怕写成技术文档，这样写反而更可信。

> 分类是**按每一轮分别判**的：一条会话里先装环境、后做视频，时间会分别记到两类名下，不会整条贴一个标签。

> 每天一根柱子，颜色就是当天的分类构成。空白的日子是真没在用（**不是加载失败**）。

括号补一句「不是加载失败」—— **预判了用户的怀疑**。这种小补丁是产品感的关键。

### 诚实声明（提升可信度）
> 分类是本地规则判的，**约 75% 准**。判错了直接下拉改，改完立刻重算，并记在这台电脑上。

主动交代准确率，比吹「智能分类」更让人信。

### 引导语（带路径，可直接照做）
> 想看你自己的？点右上角「选择目录」，选到 `~/.workbuddy/projects`（Windows）或 `~/.workbuddy/projects`。全程本地解析，不上传一个字。

---

## 七、技术栈信息

| 项目 | 情况 |
|---|---|
| 框架 | 无（原生 HTML/CSS/JS，IIFE 单闭包） |
| CSS | 手写，196 行，13.5KB，全内联在 `<style>` |
| 字体 | Google Fonts 外链（Khand / Hind / Long Cang / Noto Sans SC） |
| 体积 | 单文件 73KB（HTML 65KB + 样式内联） |
| 数据 | 本地读取 `.workbuddy/projects` 下的会话 JSON，Canvas 画图，零后端 |
| 图标 | 内联 SVG / data URI favicon |

---

## 八、怎么复用

本目录下：

- `ui-kit.css` —— 提炼好的设计系统，`<link>` 进你自己的页面就能拿到全部样式和令牌（已本地化 Khand/Hind 字体）
- `index.html` —— UI 复制台，色板/字体/组件都能点一下复制代码
- `original.html` —— 原作品完整单文件备份（含全部 HTML/CSS/JS）
- `fonts/` —— Khand、Hind 的本地 woff2（latin 子集，55KB）

最小可用骨架：

```html
<link rel="stylesheet" href="ui-kit.css" />
<body class="paper">
  <div class="wrap">
    <p class="eyebrow">Your Eyebrow</p>
    <h1 class="title-lg">标题</h1>
    <button class="btn btn-primary">开始</button>
  </div>
</body>
```
