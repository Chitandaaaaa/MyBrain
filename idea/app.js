// ============ MyBrain 速记工作台 · 单输入框 + AI 自动归类 + 搜索/归档 ============

// ---------- 配置（可本地配置 AI）----------
const CFG_KEY = 'mybrain_ai_config';
let config = loadConfig();
function loadConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CFG_KEY)) || {};
    if (!c.voiceMode) c.voiceMode = 'recorder';
    if (c.jsonMode === undefined) c.jsonMode = true;
    return c;
  } catch { return { voiceMode: 'recorder', jsonMode: true }; }
}
function saveConfig(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); config = c; }

// ---------- 本地存储（IndexedDB）----------
const DB = 'mybrain', STORE = 'entries';
let db;
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('createdAt', 'createdAt');
      }
    };
    r.onsuccess = () => { db = r.result; res(db); };
    r.onerror = () => rej(r.error);
  });
}
function tx(m) { return db.transaction(STORE, m).objectStore(STORE); }
function putEntry(e) {
  return new Promise((res, rej) => { const r = tx('readwrite').put(e); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}
function allEntries() {
  return new Promise((res, rej) => {
    const r = tx('readonly').getAll();
    r.onsuccess = () => res(r.result.sort((a, b) => b.createdAt - a.createdAt));
    r.onerror = () => rej(r.error);
  });
}
function delEntry(id) {
  return new Promise((res, rej) => { const r = tx('readwrite').delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
}

// ---------- 工具 ----------
const uid = () => crypto.randomUUID();
function esc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
const TYPE_LABEL = { idea: '💡 想法', quote: '📖 摘抄', voice: '🎙️ 语音', note: '📝 备忘' };
const VALID_TYPES = ['idea', 'quote', 'voice', 'note'];

// ---------- AI 分类（OpenAI 兼容接口）----------
const SYSTEM_PROMPT = `你是一个个人知识库助手。用户会给你一段想法、摘抄或语音转写文本。请判断它属于哪一类，并提取结构化信息。只输出 JSON，不要任何额外文字。
格式：{"type":"idea|quote|voice|note","title":"简短标题(<=20字)","content":"整理后的正文","tags":["标签"],"source":"来源，无则空字符串"}
说明：idea=用户自己的念头/感悟；quote=来自外部的值得收藏的文字(尽量补全来源)；voice=口语化/零散语音整理；note=其它备忘。`;

async function classify(text) {
  if (!config.apiBase) return localClassify(text); // 未配置 AI → 本地兜底
  const url = config.apiBase.replace(/\/$/, '') + '/chat/completions';
  const body = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text }
    ],
    temperature: 0.3
  };
  if (config.jsonMode) body.response_format = { type: 'json_object' };
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = 'Bearer ' + config.apiKey;
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error('AI 接口返回 ' + resp.status);
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return normalizeAI(raw, text);
}

async function classifyAudio(b64, format) {
  const url = config.apiBase.replace(/\/$/, '') + '/chat/completions';
  const body = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: [{ type: 'input_audio', input_audio: { data: b64, format } }] }
    ]
  };
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = 'Bearer ' + config.apiKey;
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return normalizeAI(raw, '');
}

function normalizeAI(raw, fallbackText) {
  let obj = null;
  try { obj = JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { obj = JSON.parse(m[0]); } catch { obj = null; } }
  }
  if (!obj) return localClassify(fallbackText);
  return {
    type: VALID_TYPES.includes(obj.type) ? obj.type : 'note',
    title: obj.title || (fallbackText || '').slice(0, 20),
    content: obj.content || fallbackText,
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    source: obj.source || ''
  };
}

function localClassify(text) {
  const t = (text || '').trim();
  let type = 'idea';
  if (/https?:\/\/|《|“|"|公众号|微博|推文|书里|文章/.test(t)) type = 'quote';
  const tags = (t.match(/#([^\s#]+)/g) || []).map(x => x.slice(1));
  return { type, title: t.slice(0, 20), content: t, tags, source: '' };
}

// ---------- 视图状态（导航 / 类型 / 标签 / 搜索）----------
const state = { nav: 'inbox', type: 'all', tag: null, q: '' };
const NAV_TITLE = { inbox: '收件箱', all: '全部', archived: '已归档' };

// ---------- 渲染 ----------
const feed = document.getElementById('feed');
const viewTitle = document.getElementById('viewTitle');

async function render() {
  const all = await allEntries();
  const q = state.q.trim().toLowerCase();

  // 构建类型筛选与标签云（基于全部数据）
  buildTypeChips(all);
  buildTagCloud(all);

  // 过滤
  let list = all.filter(e => {
    if (state.nav === 'inbox') { if (e.archived) return false; }
    else if (state.nav === 'archived') { if (!e.archived) return false; }
    if (state.type !== 'all' && e.type !== state.type) return false;
    if (state.tag && !(e.tags || []).includes(state.tag)) return false;
    if (q) {
      const hay = [e.title, e.content, e.source, (e.tags || []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  viewTitle.textContent = state.tag ? `#${state.tag}` : NAV_TITLE[state.nav];

  feed.innerHTML = '';
  if (q || state.type !== 'all' || state.tag) {
    const meta = document.createElement('div');
    meta.className = 'feed-meta';
    meta.textContent = `匹配 ${list.length} 条` + (state.tag ? ` · 标签 #${state.tag}` : '') + (state.type !== 'all' ? ` · ${TYPE_LABEL[state.type]}` : '');
    feed.appendChild(meta);
  }
  if (!list.length) {
    feed.appendChild(emptyState());
    return;
  }
  list.forEach(e => feed.appendChild(entryEl(e)));
}

function emptyState() {
  const d = document.createElement('div');
  d.className = 'empty';
  d.textContent = state.nav === 'archived' ? '归档区还是空的，把不再需要常看的记录点「归档」即可收进来。' : '还没有记录，写一句或说一句试试 ✨';
  return d;
}

function entryEl(e) {
  const el = document.createElement('div');
  el.className = 'entry' + (e.pending ? ' pending' : '');
  const meta = new Date(e.createdAt).toLocaleString('zh-CN');
  const tags = (e.tags || []).map(t => `<span class="tag" data-tag="${esc(t)}">#${esc(t)}</span>`).join('');
  const archBtn = e.archived
    ? `<button class="act unarch" data-id="${e.id}" data-act="unarch">↩ 取消归档</button>`
    : `<button class="act arch" data-id="${e.id}" data-act="arch">📦 归档</button>`;
  el.innerHTML = `
    <div class="ehead"><span class="etype">${TYPE_LABEL[e.type] || e.type}</span><span class="etime">${meta}</span></div>
    <div class="etitle">${esc(e.title || '')}</div>
    <div class="econtent">${esc(e.content || '')}</div>
    ${e.audio ? `<audio controls src="${URL.createObjectURL(e.audio)}" style="width:100%;margin-top:8px"></audio>` : ''}
    ${e.source ? `<div class="esource">来源：${esc(e.source)}</div>` : ''}
    <div class="etags">${tags}</div>
    <div class="eactions">${archBtn}<button class="act del" data-id="${e.id}" data-act="del">删除</button></div>`;

  el.querySelectorAll('.tag').forEach(t => t.onclick = () => {
    state.tag = t.dataset.tag; state.nav = 'all'; state.type = 'all';
    setNav('all'); render();
  });
  el.querySelectorAll('.act').forEach(b => b.onclick = async () => {
    const id = b.dataset.id, act = b.dataset.act;
    if (act === 'del') { if (confirm('删除这条？')) { await delEntry(id); render(); } }
    else if (act === 'arch') { const x = await getEntry(id); x.archived = true; await putEntry(x); render(); }
    else if (act === 'unarch') { const x = await getEntry(id); x.archived = false; await putEntry(x); render(); }
  });
  return el;
}
function getEntry(id) {
  return new Promise((res, rej) => { const r = tx('readonly').get(id); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}

function buildTypeChips(all) {
  const box = document.getElementById('typeChips');
  const types = ['all', ...VALID_TYPES];
  box.innerHTML = types.map(t => {
    const label = t === 'all' ? '全部' : TYPE_LABEL[t];
    const count = t === 'all' ? all.length : all.filter(e => e.type === t).length;
    const active = state.type === t ? ' active' : '';
    return `<span class="chip${active}" data-type="${t}">${label} ${count}</span>`;
  }).join('');
  box.querySelectorAll('.chip').forEach(c => c.onclick = () => { state.type = c.dataset.type; render(); });
}

function buildTagCloud(all) {
  const box = document.getElementById('tagCloud');
  const map = {};
  all.forEach(e => (e.tags || []).forEach(t => map[t] = (map[t] || 0) + 1));
  const tags = Object.keys(map).sort((a, b) => map[b] - map[a]);
  if (!tags.length) { box.innerHTML = '<span class="muted-sm">尚无标签</span>'; return; }
  box.innerHTML = tags.map(t => {
    const active = state.tag === t ? ' active' : '';
    return `<span class="chip${active}" data-tag="${esc(t)}">#${esc(t)} ${map[t]}</span>`;
  }).join('');
  box.querySelectorAll('.chip').forEach(c => c.onclick = () => {
    state.tag = c.dataset.tag; state.nav = 'all'; setNav('all'); render();
  });
}

function setNav(nav) {
  state.nav = nav;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === nav));
}
document.querySelectorAll('.nav-item').forEach(b => b.onclick = () => { state.tag = null; state.type = 'all'; setNav(b.dataset.nav); render(); });

// 搜索（实时）
const searchInput = document.getElementById('search');
const clearSearch = document.getElementById('clearSearch');
searchInput.addEventListener('input', () => {
  state.q = searchInput.value;
  clearSearch.classList.toggle('hidden', !searchInput.value);
  render();
});
clearSearch.onclick = () => { searchInput.value = ''; state.q = ''; clearSearch.classList.add('hidden'); render(); searchInput.focus(); };

// ---------- 提交（文字）----------
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
function autoGrow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; }
input.addEventListener('input', autoGrow);
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });

async function submit() {
  const text = input.value.trim();
  if (!text) return;
  input.value = ''; autoGrow();
  const entry = { id: uid(), type: 'note', title: 'AI 归类中…', content: text, tags: [], source: '', archived: false, createdAt: Date.now(), pending: true };
  await putEntry(entry); render();
  try {
    const info = await classify(text);
    Object.assign(entry, info, { archived: false, pending: false });
    await putEntry(entry); render();
    toast('已入库：' + (TYPE_LABEL[info.type] || info.type));
  } catch (err) {
    const fb = localClassify(text);
    Object.assign(entry, fb, { archived: false, pending: false, title: '（AI 未配置/失败，已本地归类）' });
    await putEntry(entry); render();
    toast('AI 调用失败，已用本地规则归类');
  }
}
sendBtn.onclick = submit;

// ---------- 语音输入 ----------
const micBtn = document.getElementById('micBtn');
const recHint = document.getElementById('recHint');

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej; r.readAsDataURL(blob);
  });
}
function mmss(s) { const m = String(Math.floor(s / 60)).padStart(2, '0'); const ss = String(s % 60).padStart(2, '0'); return m + ':' + ss; }

let recognizing = false, recognition = null;
function setupSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;
  recognition = new SR();
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = e => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
    input.value = txt; autoGrow();
  };
  recognition.onend = () => { recognizing = false; micBtn.classList.remove('on'); recHint.classList.remove('show'); };
  recognition.onerror = () => { recognizing = false; micBtn.classList.remove('on'); recHint.classList.remove('show'); toast('实时语音不可用，已切回录音模式'); };
  return true;
}
setupSpeech();
function toggleSpeech() {
  if (recognizing) { recognition.stop(); return; }
  recognizing = true; micBtn.classList.add('on'); recHint.classList.add('show');
  recHint.textContent = '🎙️ 正在听… 再次点击麦克风结束';
  try { recognition.start(); } catch { recognizing = false; micBtn.classList.remove('on'); recHint.classList.remove('show'); }
}

let rec = null, recChunks = [], recStart = 0, recTimer = 0;
function startRecorder() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('当前环境不支持录音（需 https/localhost 且允许麦克风）'); return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    rec = new MediaRecorder(stream); recChunks = [];
    rec.ondataavailable = e => { if (e.data.size) recChunks.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      clearTimeout(recTimer);
      const blob = new Blob(recChunks);
      await handleRecordedAudio(blob);
    };
    rec.start(); recStart = Date.now(); tickRec();
    micBtn.classList.add('on'); recHint.classList.add('show');
  }).catch(() => toast('无法访问麦克风：请在浏览器允许权限，并用 http://127.0.0.1:8123 打开本页'));
}
function tickRec() {
  const s = Math.floor((Date.now() - recStart) / 1000);
  recHint.textContent = '🎙️ 录音中 ' + mmss(s) + ' · 点击麦克风停止';
  if (rec && rec.state === 'recording') recTimer = setTimeout(tickRec, 500);
}
async function handleRecordedAudio(blob) {
  micBtn.classList.remove('on'); recHint.classList.remove('show');
  if (config.apiBase) {
    const b64 = await blobToBase64(blob);
    const entry = { id: uid(), type: 'voice', title: 'AI 识别中…', content: '', tags: [], source: '', audio: blob, archived: false, createdAt: Date.now(), pending: true };
    await putEntry(entry); render();
    try {
      const info = await classifyAudio(b64, 'webm');
      Object.assign(entry, info, { type: info.type === 'note' ? 'voice' : info.type, audio: blob, archived: false, pending: false });
      await putEntry(entry); render();
      toast('语音已归类入库');
    } catch (err) {
      entry.title = '（音频分类失败，已留存录音）'; entry.content = '可检查 AI 接口是否支持音频'; entry.pending = false;
      await putEntry(entry); render();
      toast('音频分类失败：' + err.message);
    }
  } else {
    const entry = { id: uid(), type: 'voice', title: '🎙️ 语音备忘（待接入 AI 转写）', content: '', tags: [], source: '', audio: blob, archived: false, createdAt: Date.now() };
    await putEntry(entry); render();
    toast('已保存录音；在设置配置支持音频的 AI 后可自动转写归类');
  }
}

micBtn.onclick = () => {
  if (config.voiceMode === 'speech') { toggleSpeech(); return; }
  if (rec && rec.state === 'recording') rec.stop();
  else startRecorder();
};

// ---------- 设置面板 ----------
const modal = document.getElementById('settingsModal');
document.getElementById('settingsBtn').onclick = () => { fillCfg(); modal.classList.remove('hidden'); };
document.getElementById('closeSettings').onclick = () => modal.classList.add('hidden');
function fillCfg() {
  document.getElementById('cfgBase').value = config.apiBase || '';
  document.getElementById('cfgKey').value = config.apiKey || '';
  document.getElementById('cfgModel').value = config.model || '';
  document.getElementById('cfgVoice').value = config.voiceMode || 'recorder';
  document.getElementById('cfgJson').checked = !!config.jsonMode;
}
document.getElementById('saveCfg').onclick = () => {
  const c = {
    apiBase: document.getElementById('cfgBase').value.trim(),
    apiKey: document.getElementById('cfgKey').value.trim(),
    model: document.getElementById('cfgModel').value.trim(),
    voiceMode: document.getElementById('cfgVoice').value,
    jsonMode: document.getElementById('cfgJson').checked
  };
  saveConfig(c);
  document.getElementById('cfgStatus').textContent = c.apiBase
    ? '已保存，AI 已接入，可自动归类。'
    : '已保存，但未填 API 地址：将使用本地规则归类。';
  setTimeout(() => modal.classList.add('hidden'), 800);
};

// ---------- 启动 ----------
openDB().then(render).catch(err => toast('数据库初始化失败：' + err.message));
