# <风格名> · 设计系统文档

> 风格：<一句话，如「中文复古印刷海报」>
> 英文关键词：<Risograph> / <Grid Paper> / <Hand Lettering>
> 来源：<sourceUrl> · 作者 <author> · 抄录 <capturedAt> · 范围 <full/partial>
> 许可：<学习参考 / 可商用(注明出处) / self / unknown>

---

## 1. 设计令牌（层 1 · 见 `ui-kit.css`）

> 颜色 / 字体 / 字阶 / 间距 / 圆角 / 阴影全部集中在 `ui-kit.css` 的 `:root` 里，组件层一律引用变量，不写死值。

### 1.1 颜色
| 名称 | HEX | 用途 |
|---|---|---|
| 纸底 | `#fbf8f5` | 全站背景（不用纯白） |
| 墨 | `#132b69` | 正文 + 描边（不用纯黑） |
| 品牌 | `#d04e00` | 唯一行动色 |

### 1.2 语义状态色
| 状态 | HEX |
|---|---|
| 成功 ok | `#3f7d3a` |
| 警告 warn | `#f6c200` |
| 信息 info | `#0086a8` |
| 危险 err | `#a00e00` |

### 1.3 字体（最值得抄的一层）
| 字体 | 角色 | 来源 | 回退链 |
|---|---|---|---|
| Khand | 数字/英文小标 | 本地 `fonts/` | `'Khand',Arial Narrow,sans-serif` |
| Long Cang | 手写标签 | 外链 | `'Long Cang','华文行楷',cursive` |
| Noto Sans SC | 中文标题 | 外链 | `'Noto Sans SC','PingFang SC',sans-serif` |

### 1.4 字阶 / 间距 / 圆角 / 阴影
（直接引用 `ui-kit.css` 里的 `--fs-*` / `--s*` / `--r-*` / `--shadow-*`，不要裸写像素值）

---

## 2. 组件层（层 2 · 见 `ui-components.css`）

> 组件 `id` 一律对齐 `STANDARD.md` 第 3 节「组件注册表」。本资产**没覆盖的不要写**；遇到新的通用组件，先在注册表追加 id，再在此登记。

### 2.1 组件清单（id → 本资产类名 → 是否签名）
| STANDARD id | 本资产使用的类名 | 签名 |
|---|---|---|
| `button` | `.btn` / `.btn-primary` / `.btn-ghost` / `.btn-danger` | |
| `card` | `.card` | |
| `kpi` | `.kpi` / `.kpis` | |
| `<新通用件>` | `.xxx` | |

### 2.2 关键组件写法（给核心 CSS + 为什么这么写）
#### 按钮 · 硬投影
```css
.btn-primary{background:var(--brand);color:var(--paper);box-shadow:0 4px 0 var(--deep)}
.btn-primary:active{transform:translateY(4px);box-shadow:none}
```
<为什么这样写……>

---

## 3. 签名组件（若有，必填）

> 本资产最独特、最值得抄的 1–2 个。它的 `id` 要同时写进 `meta.json` 的 `signature` 字段，并在 `index.html` 展示台里真跑一遍。
> 纯通用件（按钮/卡片/输入…）**不要**写进这一节——它们不属于签名。

### <签名组件名> · `<id>`
- **结构**：<四层结构 / 参数>
- **参数（data-\*）**：<构造参数走 data 属性，方便换数据>
- **降级规则**：<放不下时怎么降级，如 pct-in-bar>
- **移动端策略**：<窄屏怎么处理，如 annotation 整层隐藏>

---

## 4. 最容易漏掉的 N 个细节（坑）
1. <如：色块上色必须用 `background-color`，用 `background` 简写会清掉斜纹>
2. <如：数字用 `tabular-nums` 跳动不抖>

---

## 5. 文案（若值得抄）
- <好用的标题 / 口径说明 / 诚实声明，原文 + 写法分析>

---

## 6. 怎么复用
```html
<link rel="stylesheet" href="ui-kit.css" />
<link rel="stylesheet" href="ui-components.css" />
<body class="paper">
  <div class="wrap">
    <p class="eyebrow">Section</p>
    <h1 class="title-lg">标题</h1>
    <button class="btn btn-primary">开始</button>
  </div>
</body>
```

---

## 7. 溯源与许可
- 来源链接：<sourceUrl>
- 原作者：<author>
- 抄录日期：<capturedAt>
- 范围：<full 完整 / partial 部分——抄了哪几块、漏了哪几块>
- 可否商用：<说明边界，避免侵权>
