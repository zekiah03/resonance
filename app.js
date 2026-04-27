// app.js
// Resonance — メインアプリケーションロジック

// ============================================================
// 状態
// ============================================================
const state = {
  // 設定
  apiKey:      localStorage.getItem('resonance_apiKey') || '',
  model:       localStorage.getItem('resonance_model') || 'claude-sonnet-4-5',
  temperature: parseFloat(localStorage.getItem('resonance_temp') || '0.9'),
  theme:       localStorage.getItem('resonance_theme') || 'light',

  // Compose
  selectedPattern: localStorage.getItem('resonance_lastPattern') || 'laughter',
  style:           'sns',
  length:          'medium',
  lastGeneration:  null,

  // Refine
  refinePattern:   'kandou',
  refineIntensity: 'standard',
  lastRefine:      null,

  // Library
  libraryFilter: 'all',

  // History
  history:       JSON.parse(localStorage.getItem('resonance_history') || '[]'),
  historyFilter: 'all',
};

applyTheme(state.theme);

// ============================================================
// タブ切り替え
// ============================================================
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'library') renderLibrary();
  if (name === 'history') renderHistory();
}
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

// ============================================================
// テーマ
// ============================================================
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  state.theme = t;
  localStorage.setItem('resonance_theme', t);
}
document.getElementById('themeBtn').addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});

// ============================================================
// Compose タブ
// ============================================================
function renderPatternList(filter = '') {
  const container = document.getElementById('patternList');
  const grouped = {};
  for (const id of PATTERN_ORDER) {
    const p = PATTERNS[id];
    if (filter && !p.name.includes(filter) && !p.summary.includes(filter)) continue;
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push({ id, ...p });
  }
  let html = '';
  for (const [cat, list] of Object.entries(grouped)) {
    if (!list.length) continue;
    html += `<div class="pattern-cat">
      <div class="pattern-cat-label">${CATEGORIES[cat].label}</div>`;
    for (const p of list) {
      const active = p.id === state.selectedPattern ? 'active' : '';
      html += `<button class="pattern-item ${active}" data-id="${p.id}">
        <span>${p.name}</span>
        <span class="traj-tag">${p.trajectory}</span>
      </button>`;
    }
    html += '</div>';
  }
  container.innerHTML = html;
  container.querySelectorAll('.pattern-item').forEach(b => {
    b.addEventListener('click', () => {
      state.selectedPattern = b.dataset.id;
      localStorage.setItem('resonance_lastPattern', state.selectedPattern);
      renderPatternList(filter);
      renderSelectedPattern();
    });
  });
}

function renderSelectedPattern() {
  const p = PATTERNS[state.selectedPattern];
  document.getElementById('selectedName').textContent = p.name;
  document.getElementById('selectedTraj').textContent = `Type ${p.trajectory}`;
  document.getElementById('selectedComp').textContent = p.summary;
  document.getElementById('selectedDesc').textContent = p.description;
  document.getElementById('composeHelperDetail').textContent = p.summary;
}

document.getElementById('patternSearch').addEventListener('input', (e) => {
  renderPatternList(e.target.value.trim());
});

// チップグループ汎用ハンドラ
function setupChipGroup(containerId, callback) {
  const c = document.getElementById(containerId);
  c.querySelectorAll('.chip').forEach(b => {
    b.addEventListener('click', () => {
      c.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === b));
      callback(b.dataset.val);
    });
  });
}

setupChipGroup('styleChips',  v => state.style = v);
setupChipGroup('lengthChips', v => state.length = v);

// ============================================================
// プロンプト構築
// ============================================================
function buildComposePrompt(patternId, material, style, length, isVariant = false) {
  const p = PATTERNS[patternId];
  const sh = STYLE_HINTS[style];
  const lh = LENGTH_HINTS[length];

  const variantNote = isVariant
    ? '\n\n# 補足\n前回とは異なる表現の方向性で書く。同じ感情パターンでも、語彙・視点・場面構成を変える。'
    : '';

  return `あなたは「Resonance」という、感情パターンに基づいて文章を生成するライティングツールの中核です。

# ターゲット感情パターン
名前: ${p.name}
カテゴリ: ${CATEGORIES[p.category].label}
理論的記述: ${p.description}

# 時間構造（軌道型 ${p.trajectory}）
${TRAJECTORIES[p.trajectory]}
このパターンの感情は、上記の時間構造として読者に体験される必要がある。

# 制約
${p.constraint}

# 表現の手がかり
${p.promptHints}

# 出力スタイル
形式: ${sh.label}
詳細: ${sh.hint}

# 字数
目安: ${lh.hint}

# 素材（ユーザー入力）
${material}

# 出力ルール
1. 上記素材を膨らませ、ターゲット感情パターンが読者に体験される文章を作る
2. 説明・前置き・解説・タイトル・引用記号・「」での括り出し は一切入れない。本文のみ
3. 出力スタイルと字数を守る
4. 出力は日本語
5. 倫理的に問題のある内容（実在の特定個人への攻撃、差別、児童に関する性的内容、暴力の詳細描写、自傷の手段、違法行為の手順）は出力しない${variantNote}

# 出力（本文のみ）`;
}

function buildRefinePrompt(originalText, patternId, intensity) {
  const p = PATTERNS[patternId];
  const ih = INTENSITY_HINTS[intensity];

  return `あなたは「Resonance」のリライト機能です。既存テキストを、指定された感情パターンに沿って書き換えます。

# ターゲット感情パターン
名前: ${p.name}
カテゴリ: ${CATEGORIES[p.category].label}
理論的記述: ${p.description}

# 時間構造（軌道型 ${p.trajectory}）
${TRAJECTORIES[p.trajectory]}

# リライト強度
${ih.label}: ${ih.hint}

# パターン固有の制約
${p.constraint}

# 表現の手がかり
${p.promptHints}

# 元テキスト
${originalText}

# リライトルール
1. 元テキストの事実関係（誰が・何を・どこで・いつ）は基本的に保持する
2. 感情の質感・テンポ・余白・語彙は、ターゲット感情パターンに沿って大胆に変える
3. 強度に従って、変更の度合いを調整する
4. 説明・前置き・「リライト後:」のような注釈は一切入れない。本文のみ
5. 文字数は元テキストの ±30% 以内
6. 出力は日本語
7. 倫理的に問題のある内容は出力しない

# 出力（本文のみ）`;
}

// ============================================================
// API 呼び出し
// ============================================================
async function callAnthropic(prompt) {
  if (!state.apiKey) throw new Error('API キーが設定されていません');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: state.model,
      max_tokens: 2000,
      temperature: state.temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('API エラー (' + res.status + '): ' + err.slice(0, 200));
  }
  const data = await res.json();
  return data.content[0].text;
}

// ============================================================
// 生成
// ============================================================
async function generate(isVariant = false) {
  const material = document.getElementById('materialInput').value.trim();
  if (!material) { showToast('素材を入力してください'); return; }
  if (!state.apiKey) { openSettings(); showToast('まず API キーを設定してください'); return; }

  const btn = document.getElementById('generateBtn');
  const lbl = document.getElementById('generateLabel');
  btn.disabled = true;
  lbl.innerHTML = '<span class="spinner"></span> 生成中…';

  try {
    const prompt = buildComposePrompt(state.selectedPattern, material, state.style, state.length, isVariant);
    const result = await callAnthropic(prompt);

    state.lastGeneration = {
      type: 'compose',
      id: Date.now(),
      pattern: state.selectedPattern,
      patternName: PATTERNS[state.selectedPattern].name,
      trajectory: PATTERNS[state.selectedPattern].trajectory,
      summary: PATTERNS[state.selectedPattern].summary,
      style: state.style,
      length: state.length,
      material,
      output: result,
      favorite: false,
      timestamp: new Date().toISOString(),
    };

    document.getElementById('outputCard').style.display = 'block';
    document.getElementById('outputText').textContent = result;
    document.getElementById('outputMeta').textContent =
      `${PATTERNS[state.selectedPattern].name} · ${STYLE_HINTS[state.style].label} · ${LENGTH_HINTS[state.length].label}`;
    document.getElementById('favLabel').textContent = 'お気に入り';
    document.getElementById('profileDetail').classList.remove('open');
    pushHistory(state.lastGeneration);
  } catch (e) {
    showToast(e.message);
    document.getElementById('outputCard').style.display = 'block';
    document.getElementById('outputText').innerHTML =
      `<span style="color:var(--danger)">${e.message.replace(/</g, '&lt;')}</span>`;
  } finally {
    btn.disabled = false;
    lbl.textContent = '生成する';
  }
}

document.getElementById('generateBtn').addEventListener('click', () => generate(false));
document.getElementById('regenerateBtn').addEventListener('click', () => generate(false));
document.getElementById('variantBtn').addEventListener('click', () => generate(true));

// コピー
document.getElementById('copyBtn').addEventListener('click', () => {
  if (!state.lastGeneration) return;
  navigator.clipboard.writeText(state.lastGeneration.output);
  showToast('コピーしました');
});

// お気に入り
document.getElementById('favBtn').addEventListener('click', () => {
  if (!state.lastGeneration) return;
  state.lastGeneration.favorite = !state.lastGeneration.favorite;
  document.getElementById('favLabel').textContent = state.lastGeneration.favorite ? 'お気に入り済' : 'お気に入り';
  // 履歴も更新
  const idx = state.history.findIndex(h => h.id === state.lastGeneration.id);
  if (idx >= 0) {
    state.history[idx].favorite = state.lastGeneration.favorite;
    saveHistory();
  }
  showToast(state.lastGeneration.favorite ? 'お気に入りに追加' : 'お気に入りから削除');
});

// 理論プロファイル展開
document.getElementById('profileToggleBtn').addEventListener('click', () => {
  const detail = document.getElementById('profileDetail');
  if (detail.classList.contains('open')) {
    detail.classList.remove('open');
    return;
  }
  const p = PATTERNS[state.selectedPattern];
  const labels = { S: '緊張 S', E: '予測誤差 E', C: '意味再統合 C', B: '良性評価 B', dS: '解放量 ΔS' };
  let html = `<div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">理論成分プロファイル · 軌道型 ${p.trajectory}</div>`;
  for (const [k, lbl] of Object.entries(labels)) {
    const v = p.components[k];
    html += `<div class="profile-row-mini">
      <span class="pname">${lbl}</span>
      <div class="profile-bar"><div class="profile-bar-fill" style="width:${v}%"></div></div>
      <span style="width:30px;text-align:right;color:var(--text-muted);font-family:ui-monospace,monospace;">${v}</span>
    </div>`;
  }
  html += `<div style="margin-top:12px;font-size:11px;color:var(--text-faint);">多次元 S 分解 (S_pred / S_threat / S_social / S_cog) = ${p.s_dim.pred} / ${p.s_dim.threat} / ${p.s_dim.social} / ${p.s_dim.cog}</div>`;
  detail.innerHTML = html;
  detail.classList.add('open');
});

// ============================================================
// Refine タブ
// ============================================================
function populateRefineSelect() {
  const sel = document.getElementById('refinePattern');
  let html = '';
  for (const cat of Object.keys(CATEGORIES)) {
    html += `<optgroup label="${CATEGORIES[cat].label}">`;
    for (const id of PATTERN_ORDER) {
      const p = PATTERNS[id];
      if (p.category !== cat) continue;
      html += `<option value="${id}" ${id === state.refinePattern ? 'selected' : ''}>${p.name} (Type ${p.trajectory})</option>`;
    }
    html += '</optgroup>';
  }
  sel.innerHTML = html;
  sel.addEventListener('change', () => state.refinePattern = sel.value);
}

setupChipGroup('refineIntensity', v => state.refineIntensity = v);

async function refine() {
  const text = document.getElementById('refineInput').value.trim();
  if (!text) { showToast('元テキストを入力してください'); return; }
  if (!state.apiKey) { openSettings(); showToast('まず API キーを設定してください'); return; }

  const btn = document.getElementById('refineBtn');
  const lbl = document.getElementById('refineLabel');
  btn.disabled = true;
  lbl.innerHTML = '<span class="spinner"></span> リライト中…';

  try {
    const prompt = buildRefinePrompt(text, state.refinePattern, state.refineIntensity);
    const result = await callAnthropic(prompt);

    state.lastRefine = {
      type: 'refine',
      id: Date.now(),
      pattern: state.refinePattern,
      patternName: PATTERNS[state.refinePattern].name,
      trajectory: PATTERNS[state.refinePattern].trajectory,
      summary: PATTERNS[state.refinePattern].summary,
      intensity: state.refineIntensity,
      material: text,
      output: result,
      favorite: false,
      timestamp: new Date().toISOString(),
    };

    document.getElementById('refineOutput').textContent = result;
    pushHistory(state.lastRefine);
  } catch (e) {
    document.getElementById('refineOutput').innerHTML =
      `<span style="color:var(--danger)">${e.message.replace(/</g, '&lt;')}</span>`;
    showToast('リライトに失敗しました');
  } finally {
    btn.disabled = false;
    lbl.textContent = 'リライトする';
  }
}

document.getElementById('refineBtn').addEventListener('click', refine);

document.getElementById('refineCopyBtn').addEventListener('click', () => {
  if (!state.lastRefine) return;
  navigator.clipboard.writeText(state.lastRefine.output);
  showToast('コピーしました');
});

document.getElementById('refineSwapBtn').addEventListener('click', () => {
  if (!state.lastRefine) return;
  document.getElementById('refineInput').value = state.lastRefine.output;
  document.getElementById('refineOutput').innerHTML = '<span class="output-empty">右側にリライト結果が表示されます</span>';
  showToast('After を Before に移動しました');
});

// ============================================================
// Library タブ
// ============================================================
function renderLibrary() {
  const grid = document.getElementById('libGrid');
  let html = '';
  for (const id of PATTERN_ORDER) {
    const p = PATTERNS[id];
    if (state.libraryFilter !== 'all' && p.category !== state.libraryFilter) continue;
    html += `<button class="lib-card" data-id="${id}">
      <div class="lib-card-head">
        <h3 class="lib-card-name">${p.name}</h3>
        <span class="tag tag-accent">${p.trajectory}</span>
      </div>
      <div class="lib-card-cat">${CATEGORIES[p.category].label}</div>
      <p class="lib-card-desc">${p.description}</p>
      <div class="lib-card-foot">
        <span class="tag tag-muted">${p.summary}</span>
        <span style="font-size:11px;color:var(--text-faint);">3 例文 →</span>
      </div>
    </button>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll('.lib-card').forEach(c => {
    c.addEventListener('click', () => openLibDetail(c.dataset.id));
  });
}

document.querySelectorAll('#libraryFilter .chip').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#libraryFilter .chip').forEach(x => x.classList.toggle('active', x === b));
    state.libraryFilter = b.dataset.cat;
    renderLibrary();
  });
});

function openLibDetail(id) {
  const p = PATTERNS[id];
  const exHtml = p.examples.map(e => `<div class="example-card">${e.replace(/</g, '&lt;')}</div>`).join('');

  const labels = { S: '緊張 S', E: '予測誤差 E', C: '意味再統合 C', B: '良性評価 B', dS: '解放量 ΔS' };
  let profileHtml = '';
  for (const [k, lbl] of Object.entries(labels)) {
    const v = p.components[k];
    profileHtml += `<div class="profile-row-mini">
      <span class="pname">${lbl}</span>
      <div class="profile-bar"><div class="profile-bar-fill" style="width:${v}%"></div></div>
      <span style="width:30px;text-align:right;color:var(--text-muted);font-family:ui-monospace,monospace;">${v}</span>
    </div>`;
  }

  const html = `
    <div class="modal-h">
      <div>
        <div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${CATEGORIES[p.category].label}</div>
        <h2>${p.name}</h2>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <span class="tag tag-accent">Type ${p.trajectory}</span>
          <span class="tag tag-muted">${p.summary}</span>
        </div>
      </div>
      <button class="icon-btn" id="closeLibDetail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <p style="color:var(--text-muted);font-size:14px;line-height:1.7;margin:0;">${p.description}</p>

    <div class="modal-section">
      <h3>例文</h3>
      ${exHtml}
    </div>

    <div class="modal-section">
      <h3>軌道型 — ${TRAJECTORIES[p.trajectory]}</h3>
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px;">${p.constraint}</p>
      ${profileHtml}
      <div style="margin-top:12px;font-size:11px;color:var(--text-faint);">多次元 S 分解 (S_pred / S_threat / S_social / S_cog) = ${p.s_dim.pred} / ${p.s_dim.threat} / ${p.s_dim.social} / ${p.s_dim.cog}</div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" id="copyExampleBtn">例文をコピー</button>
      <button class="btn btn-primary" id="useThisBtn">この感情で書く</button>
    </div>`;

  document.getElementById('libDetailContent').innerHTML = html;
  document.getElementById('libDetailModal').classList.add('open');

  document.getElementById('closeLibDetail').addEventListener('click', closeLibDetail);
  document.getElementById('copyExampleBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(p.examples.join('\n\n'));
    showToast('例文をコピーしました');
  });
  document.getElementById('useThisBtn').addEventListener('click', () => {
    state.selectedPattern = id;
    localStorage.setItem('resonance_lastPattern', id);
    renderPatternList();
    renderSelectedPattern();
    closeLibDetail();
    switchTab('compose');
  });
}

function closeLibDetail() {
  document.getElementById('libDetailModal').classList.remove('open');
}

document.getElementById('libDetailModal').addEventListener('click', (e) => {
  if (e.target.id === 'libDetailModal') closeLibDetail();
});

// ============================================================
// History タブ
// ============================================================
function pushHistory(entry) {
  state.history.unshift(entry);
  if (state.history.length > 200) state.history = state.history.slice(0, 200);
  saveHistory();
}
function saveHistory() {
  localStorage.setItem('resonance_history', JSON.stringify(state.history));
}

function renderHistory() {
  const list = document.getElementById('historyList');
  document.getElementById('historyCount').textContent = `${state.history.length} 件の生成記録`;

  let items = state.history;
  if (state.historyFilter === 'favorite') items = items.filter(h => h.favorite);
  else if (state.historyFilter === 'compose') items = items.filter(h => h.type === 'compose');
  else if (state.historyFilter === 'refine')  items = items.filter(h => h.type === 'refine');

  if (!items.length) {
    list.innerHTML = '<div class="history-empty">まだ生成記録がありません<br><br><button class="btn btn-secondary" onclick="document.querySelector(\'.tab-btn[data-tab=&quot;compose&quot;]\').click()">Compose で生成する</button></div>';
    return;
  }

  let html = '<div class="history-list">';
  for (const h of items.slice(0, 100)) {
    const dt = new Date(h.timestamp);
    const dateStr = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const typeLabel = h.type === 'refine' ? 'リライト' : '生成';
    const fav = h.favorite ? '<svg style="width:12px;height:12px;color:var(--accent)" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' : '';
    const preview = (h.output || '').substring(0, 80).replace(/</g, '&lt;');
    html += `<div class="history-row" data-id="${h.id}">
      <div class="date">${dateStr}<br><span style="font-size:10px;color:var(--text-faint);">${typeLabel}</span></div>
      <div>
        <div class="pattern-label">
          ${fav}
          <span style="color:var(--text);font-weight:500">${h.patternName}</span>
          <span class="tag tag-accent">Type ${h.trajectory}</span>
        </div>
        <div class="preview">${preview}…</div>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn btn-ghost" data-act="copy" data-id="${h.id}" title="コピー">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <button class="btn btn-ghost" data-act="fav" data-id="${h.id}" title="お気に入り">
          <svg viewBox="0 0 24 24" fill="${h.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button class="btn btn-ghost" data-act="del" data-id="${h.id}" title="削除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`;
  }
  html += '</div>';
  list.innerHTML = html;

  list.querySelectorAll('button[data-act]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(b.dataset.id);
      const idx = state.history.findIndex(h => h.id === id);
      if (idx < 0) return;
      const h = state.history[idx];
      if (b.dataset.act === 'copy') {
        navigator.clipboard.writeText(h.output);
        showToast('コピーしました');
      } else if (b.dataset.act === 'fav') {
        h.favorite = !h.favorite;
        saveHistory();
        renderHistory();
      } else if (b.dataset.act === 'del') {
        if (!confirm('この記録を削除しますか？')) return;
        state.history.splice(idx, 1);
        saveHistory();
        renderHistory();
      }
    });
  });

  // 行クリックで開く
  list.querySelectorAll('.history-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = parseInt(row.dataset.id);
      const h = state.history.find(x => x.id === id);
      if (!h) return;
      // 簡易アラート的に詳細を見せる
      const detail = `${h.patternName} · Type ${h.trajectory}\n${new Date(h.timestamp).toLocaleString()}\n\n--- 素材 ---\n${h.material}\n\n--- 出力 ---\n${h.output}`;
      alert(detail);
    });
  });
}

document.querySelectorAll('#historyFilter .chip').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#historyFilter .chip').forEach(x => x.classList.toggle('active', x === b));
    state.historyFilter = b.dataset.filter;
    renderHistory();
  });
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  if (!state.history.length) return;
  if (!confirm('履歴をすべて削除しますか？')) return;
  state.history = [];
  saveHistory();
  renderHistory();
  showToast('履歴を削除しました');
});

document.getElementById('exportHistoryBtn').addEventListener('click', () => {
  if (!state.history.length) { showToast('履歴がありません'); return; }
  const headers = ['timestamp','type','pattern','patternName','trajectory','summary','style','length','intensity','favorite','material','output'];
  const rows = [headers];
  for (const h of state.history) {
    rows.push([
      h.timestamp || '', h.type || '', h.pattern || '', h.patternName || '',
      h.trajectory || '', h.summary || '', h.style || '', h.length || '',
      h.intensity || '', h.favorite ? '1' : '0', h.material || '', h.output || '',
    ]);
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""').replace(/\n/g,'\\n')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resonance_history_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV を出力しました');
});

// ============================================================
// Settings モーダル
// ============================================================
function openSettings() {
  document.getElementById('apiKeyInput').value = state.apiKey;
  document.getElementById('modelSelect').value = state.model;
  document.getElementById('tempInput').value   = state.temperature;
  document.getElementById('settingsModal').classList.add('open');
}
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

document.getElementById('settingsBtn').addEventListener('click', openSettings);
document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettings);
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  state.apiKey      = document.getElementById('apiKeyInput').value.trim();
  state.model       = document.getElementById('modelSelect').value;
  state.temperature = parseFloat(document.getElementById('tempInput').value) || 0.9;
  localStorage.setItem('resonance_apiKey', state.apiKey);
  localStorage.setItem('resonance_model',  state.model);
  localStorage.setItem('resonance_temp',   String(state.temperature));
  closeSettings();
  showToast('設定を保存しました');
});

document.getElementById('settingsModal').addEventListener('click', (e) => {
  if (e.target.id === 'settingsModal') closeSettings();
});

// ============================================================
// Toast
// ============================================================
let toastTimer = null;
function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ============================================================
// 初期化
// ============================================================
renderPatternList();
renderSelectedPattern();
populateRefineSelect();

// 初回起動時、API キー未設定なら設定ダイアログを開く
if (!state.apiKey) {
  setTimeout(openSettings, 400);
}
