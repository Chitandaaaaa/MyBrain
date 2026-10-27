# <资产名> · UI 拆解与说明

> 风格：<一句话，如「中文复古印刷海报」>
> 英文关键词：<Risograph> / <Grid Paper> / <Hand Lettering>
> 来源：<sourceUrl> · 作者 <author> · 抄录 <capturedAt> · 范围 <full/partial>
> 许可：<学习参考 / 可商用(注明出处) / self / unknown>

---

## 一、这是什么风格
<一段话：纸感→墨色→手写→硬投影 这类"四个动作"的概括。>

## 二、配色
### 主色板（克制，先定 3–5 个）
| 名称 | HEX | 用途 |
|---|---|---|
| 纸底 | `#fbf8f5` | 全站背景（不用纯白） |
| 墨 | `#132b69` | 正文 + 描边（不用纯黑） |

### 语义状态色
| 状态 | HEX |
|---|---|
| 成功 ok | `#3f7d3a` |
| 警告 warn | `#f6c200` |
| 信息 info | `#0086a8` |
| 危险 err | `#a00e00` |

## 三、字体（最值得抄的一层）
| 字体 | 角色 | 来源 | 回退链 |
|---|---|---|---|
| Khand | 数字/英文小标 | 本地 fonts/ | `'Khand',Arial Narrow,sans-serif` |
| Long Cang | 手写标签 | 外链 | `'Long Cang','华文行楷',cursive` |
| Noto Sans SC | 中文标题 | 外链 | `'Noto Sans SC','PingFang SC',sans-serif` |

## 四、组件细节（只写本资产真实覆盖的，给核心 CSS + 为什么）
### 按钮 · 硬投影
```css
.btn-primary{background:var(--brand);color:var(--paper);box-shadow:0 4px 0 var(--deep)}
.btn-primary:active{transform:translateY(4px);box-shadow:none}
```
<为什么这样写……>

## 五、最容易漏掉的 N 个细节（坑）
1. <如：色块上色必须用 background-color，用 background 简写会清掉斜纹>
2. <如：数字用 tabular-nums 跳动不抖>

## 六、文案（若值得抄）
- <好用的标题 / 口径说明 / 诚实声明，原文 + 写法分析>

## 七、技术栈
| 项 | 情况 |
|---|---|
| 框架 | 无（原生 HTML/CSS/JS） |
| CSS | 手写，约 N 行 |
| 字体 | Google Fonts 外链 / 本地 |
| 体积 | 单文件 N KB |
| 数据 | 本地 / 无 |
| 图标 | 内联 SVG |

## 八、怎么复用
```html
<link rel="stylesheet" href="tokens.css" />
<link rel="stylesheet" href="components.css" />
<body class="paper">
  <div class="wrap">
    <p class="eyebrow">Section</p>
    <h1 class="title-lg">标题</h1>
    <button class="btn btn-primary">开始</button>
  </div>
</body>
```

## 九、溯源与许可
- 来源链接：<sourceUrl>
- 原作者：<author>
- 抄录日期：<capturedAt>
- 范围：<full 完整 / partial 部分——抄了哪几块、漏了哪几块>
- 可否商用：<说明边界，避免侵权>
