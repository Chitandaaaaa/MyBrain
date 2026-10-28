# MyBrain · UI 资产库

> 个人 UI 参考资产库：沉淀风格化的 UI 片段，后续借鉴（抄结构、配色、组件写法）。
> **总标准见 [STANDARD.md](./STANDARD.md)**；**新增资产用 [_template](./_template/) 脚手架**。

---

## 资产表

| 资产 | 中文名 | 风格标签 | 场景 | 来源 | 范围 | 许可 | 组件覆盖 |
|---|---|---|---|---|---|---|---|
| [丝网印手绘](./丝网印手绘/) | AI 时间都去哪了 | risograph / handdrawn / retro | dashboard / tool | [原站](https://ai-time-where.app.workbuddy.host/?sharecode=35XLQ7EOFS) · 阿酒 | partial（提炼版，非全站） | 学习参考 | **stacked-bar + annotation（签名）**, button, card, kpi, segmented, slider, tag, alert, topbar, link, footer, list, bar-chart |

> 组件覆盖列里**加粗的是签名组件**（这套 UI 最独特、最值得抄的那一个），完整 id 与定义见 STANDARD.md 第 3 节，尤其 3.9 图表。

> 新增资产后，在此表**追加一行**（字段含义见 STANDARD.md 第 2 节 `meta.json`）。

---

## 怎么用这个库

1. **借鉴某套 UI**：进对应资产文件夹，看 `index.html`（展示台，可复制代码）、`tokens.css`（配色/字体令牌）、`notes.md`（拆解与坑）。
2. **新增一套 UI**：复制 `_template/` → 改名 → 按 [STANDARD.md 第 8 节](./STANDARD.md#8-新增资产流程照做即可) 填完 → 在上方资产表登记。
3. **检索**：按 `styleTags`（风格）和 `useCases`（场景）过滤；每套的 `meta.json` 都可机器读取，未来可自动化生成画廊。

## 风格 / 场景标签体系
- **风格**：risograph / minimal / glassmorphism / neumorphism / brutalism / swiss / dark / gradient / 3d / illustration / cute / guochao / tech / retro / handdrawn / editorial
- **场景**：dashboard / landing / admin / blog / h5 / tool / portfolio / ecommerce / docs / onboarding / report

> 完整枚举与"组件应该有哪些"清单见 [STANDARD.md](./STANDARD.md)。

## 存之前自检（评审清单）
文件夹 kebab-case · meta.json 齐全（partial 写 scopeNote）· index.html 可预览可复制 · tokens 集中无裸值 · notes.md 含风格/配色/字体/坑/溯源 · original/ 有原件 · 有 cover.png · 已登记资产表 · 许可边界清楚。
