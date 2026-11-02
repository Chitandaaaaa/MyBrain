// ai-match.mjs —— 自然语言描述 → 服装品类匹配
// 用法：node ai-match.mjs "到膝盖下面毛茸茸的长外套"
// 前置：cp config/ai-config.json .env 无需；key 通过环境变量注入，如：
//        export LLM_API_KEY=sk-xxx && node ai-match.mjs "描述"
// 未配置 key 时自动走本地关键词兜底，保证流程可跑通。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(__dir, p), 'utf8'));

const config = read('config/ai-config.json');
const taxonomy = read('data/categories.json');

// 扁平化品类，便于匹配与兜底
const FLAT = taxonomy.flatMap((c) =>
  c.items.map((it) => ({
    cat: c.cat,
    sub: it.name,
    en: it.en,
    lead: it.lead,
    fabric: it.fabric || [],
    length: it.length || [],
    style: it.style || [],
    season: it.season || []
  }))
);

function buildUserMsg(description) {
  const taxText = JSON.stringify(
    taxonomy.map((c) => ({ cat: c.cat, items: c.items.map((i) => i.name) })),
    null,
    2
  );
  return config.prompts.userTemplate
    .replace('{{TAXONOMY}}', taxText)
    .replace('{{DESCRIPTION}}', description);
}

// 解析 LLM 返回（容错：去掉 ```json 围栏）
function parseLLM(text) {
  let t = (text || '').trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) t = m[1].trim();
  try {
    const arr = JSON.parse(t);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const knownCats = new Set(taxonomy.map((c) => c.cat));
const knownSubs = new Set(FLAT.map((f) => f.sub));

function validate(list) {
  return list
    .filter((x) => x && knownCats.has(x.cat) && knownSubs.has(x.sub))
    .map((x) => ({
      cat: x.cat,
      sub: x.sub,
      confidence: Math.max(0, Math.min(1, Number(x.confidence) || 0.5)),
      reason: String(x.reason || '')
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.matching.topK);
}

// 口语同义词 → 大类 的轻量映射，弥补中文无空格分词导致的漏匹配
const SYNONYMS = [
  { kw: ['袜', '袜子'], cat: '袜类' },
  { kw: ['裤', '裤子'], cat: '下装' },
  { kw: ['裙'], cat: '裙装' },
  { kw: ['内衣', '内搭', '打底'], cat: '内衣' },
  { kw: ['外套', '大衣', '外衣', '夹克'], cat: '外套' },
  { kw: ['上衣', '衣服'], cat: '上装' }
];

// 口语词 → 精确子类 的别名映射（兜底最后一层，LLM 接入后由模型处理）
const SUB_ALIASES = { '毛衣': '针织衫（毛衣）', '西服': '西装（西服）' };

// 本地关键词兜底：把每个品类的类名/属性值当作关键词，反查是否出现在描述中
function keywordFallback(description) {
  const desc = description.toLowerCase();
  const hit = (kw) => kw && desc.includes(kw.toLowerCase());
  // 大类命中集合（同义词）
  const catBoost = new Set();
  for (const s of SYNONYMS) if (s.kw.some((k) => hit(k))) catBoost.add(s.cat);

  const scored = FLAT.map((f) => {
    let score = 0;
    // 类名、子类名、各属性值直接子串命中
    for (const t of [f.cat, f.sub, ...f.fabric, ...f.length, ...f.style, ...f.season]) {
      if (hit(t)) score += 2;
    }
    if (catBoost.has(f.cat)) score += 2; // 同义词命中大类
    for (const [k, subName] of Object.entries(SUB_ALIASES)) {
      if (hit(k) && f.sub === subName) score += 3; // 口语词 → 精确子类
    }
    // 常见语义加权（弥补同义词，仅用不易跨类串味的信号）
    if (hit('长') && (f.length || []).some((l) => l === '长款' || l === '超长款')) score += 2;
    if (hit('脚踝') && (f.lead || '').includes('脚踝')) score += 3; // 脚踝袜 → 短袜
    if (f.sub === description || f.cat === description) score += 5;
    return { f, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, config.matching.topK);
  return scored.map((x) => ({
    cat: x.f.cat,
    sub: x.f.sub,
    confidence: Math.min(0.9, 0.4 + x.score * 0.1),
    reason: '本地关键词兜底匹配（未调用 LLM）'
  }));
}

async function callLLM(description) {
  const key = process.env[config.llm.apiKeyEnv];
  if (!key) return null; // 无 key → 走兜底
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.llm.timeoutMs);
  try {
    const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: config.llm.model,
        temperature: config.llm.temperature,
        max_tokens: config.llm.maxTokens,
        messages: [
          { role: 'system', content: config.prompts.system },
          { role: 'user', content: buildUserMsg(description) }
        ]
      }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return parseLLM(content);
  } catch (e) {
    console.warn('[ai-match] LLM 调用失败，转关键词兜底：', e.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function matchClothing(description) {
  const raw = (await callLLM(description)) ?? keywordFallback(description);
  const filtered = raw.filter((x) => x.confidence >= config.matching.minConfidence);
  return filtered.length ? filtered : raw.slice(0, config.matching.topK);
}

// CLI 入口
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const desc = process.argv.slice(2).join(' ').trim() || '到膝盖下面毛茸茸的长外套';
  const results = await matchClothing(desc);
  console.log(`\n描述：「${desc}」\n匹配到 ${results.length} 个品类：`);
  for (const r of results) {
    console.log(`  • ${r.cat} / ${r.sub}  (置信度 ${r.confidence.toFixed(2)})  ${r.reason}`);
  }
}
