/**
 * Admin Dashboard SPA
 * Vanilla JS — no framework. Communicates with /api/* endpoints.
 */

// ── State ─────────────────────────────────────────────────────────
const State = {
  admin:      null,
  view:       'dashboard', // 'dashboard' | 'leads' | 'audit'
  leads:      { data:[], total:0, page:1, pages:1, search:'', program:'', archetype:'' },
  detail:     null,        // currently open lead
  dashboard:  null,
};

// ── API helper ────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.error || res.statusText), { status: res.status });
  return json;
}

// ── Login flow ────────────────────────────────────────────────────
async function login() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const err   = document.getElementById('l-err');
  err.textContent = '';
  try {
    await api('/auth/login', { method:'POST', body:{ email, password: pass } });
    const me = await api('/auth/me');
    State.admin = me;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    renderApp();
  } catch (e) {
    err.textContent = e.message || 'Login failed.';
  }
}

async function logout() {
  await api('/auth/logout', { method:'POST' }).catch(() => {});
  location.reload();
}

// ── Check existing session on load ────────────────────────────────
(async function init() {
  try {
    const me = await api('/auth/me');
    State.admin = me;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    renderApp();
  } catch {
    // Not logged in — show login screen (already visible by default)
  }
})();

// ── Render app shell ──────────────────────────────────────────────
function renderApp() {
  document.getElementById('dashboard-root').innerHTML = `
    <div class="sidebar">
      <div class="sidebar-logo">
        Tejal Desae
        <span>Admin Dashboard</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-item ${State.view==='dashboard'?'active':''}" onclick="setView('dashboard')">
          <span class="nav-icon">◈</span> Overview
        </div>
        <div class="nav-item ${State.view==='leads'?'active':''}" onclick="setView('leads')">
          <span class="nav-icon">◉</span> Leads
        </div>
        <div class="nav-item ${State.view==='audit'?'active':''}" onclick="setView('audit')">
          <span class="nav-icon">◎</span> Audit Log
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-email">${State.admin?.email || ''}</div>
        <button class="btn-logout" onclick="logout()">Sign Out</button>
      </div>
    </div>
    <div class="main">
      <div class="topbar">
        <div class="page-title" id="page-title">Overview</div>
        <button class="btn-export" onclick="exportCSV()">⬇ Export CSV</button>
      </div>
      <div class="content" id="content"></div>
    </div>
    <div id="detail-overlay"></div>
  `;
  loadView();
}

function setView(v) {
  State.view = v;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  renderApp();
}

function loadView() {
  if (State.view === 'dashboard') loadDashboard();
  else if (State.view === 'leads') loadLeads();
  else if (State.view === 'audit') loadAudit();
}

// ── Dashboard overview ────────────────────────────────────────────
async function loadDashboard() {
  document.getElementById('page-title').textContent = 'Overview';
  const el = document.getElementById('content');
  el.innerHTML = '<p style="color:var(--ink-faint);padding:32px">Loading…</p>';
  try {
    const d = await api('/admin/dashboard');
    State.dashboard = d;
    const ARCH = {A:'Guard',B:'Prover',C:'Hider',D:'Giver',E:'Gripper'};
    el.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Leads</div>
          <div class="stat-value">${d.totalLeads}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Assessments</div>
          <div class="stat-value">${d.totalSubmissions}</div>
          <div class="stat-sub">Completed</div>
        </div>
        ${d.byArchetype.map(a => `
        <div class="stat-card">
          <div class="stat-label">${ARCH[a.top_archetype]||a.top_archetype}</div>
          <div class="stat-value">${a.count}</div>
          <div class="stat-sub">Archetype</div>
        </div>`).join('')}
      </div>
      <div class="table-wrap">
        <div class="table-header"><h3>Recent Leads</h3></div>
        <table>
          <thead><tr>
            <th>Name</th><th>Email</th><th>Program</th>
            <th>Archetype</th><th>Score</th><th>Date</th>
          </tr></thead>
          <tbody>
            ${d.recentLeads.map(l => `<tr onclick="openLead('${l.id||''}')">
              <td class="name">${esc(l.name)}</td>
              <td>${esc(l.email)}</td>
              <td class="program">${esc(l.program||'')}</td>
              <td>${l.top_archetype
                ? `<span class="badge badge-${l.top_archetype}">${ARCH[l.top_archetype]}</span>`
                : '<span style="color:var(--ink-faint);font-size:.75rem">—</span>'}</td>
              <td>${l.expansion_score != null ? l.expansion_score+'%' : '—'}</td>
              <td>${fmtDate(l.created_at)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">⚠</div><p>${esc(e.message)}</p></div>`;
  }
}

// ── Leads list ────────────────────────────────────────────────────
async function loadLeads(page = State.leads.page) {
  document.getElementById('page-title').textContent = 'Leads';
  const el = document.getElementById('content');
  const { search, program, archetype } = State.leads;
  const ARCH = {A:'Guard',B:'Prover',C:'Hider',D:'Giver',E:'Gripper'};

  el.innerHTML = `
    <div class="table-wrap">
      <div class="table-header">
        <h3>All Leads <span id="lead-count" style="font-family:var(--sans);font-size:.8rem;font-weight:400;color:var(--ink-faint);margin-left:8px"></span></h3>
        <div class="search-row">
          <input class="search-input" placeholder="Search name or email…"
            value="${esc(search)}" oninput="debounceSearch(this.value)" id="search-input">
          <select class="filter-select" onchange="filterProgram(this.value)">
            <option value="">All Programs</option>
            <option value="money-energetics" ${program==='money-energetics'?'selected':''}>Money Energetics</option>
            <option value="wealth-oracle"    ${program==='wealth-oracle'?'selected':''}>Wealth Oracle</option>
            <option value="divine-wealth"    ${program==='divine-wealth'?'selected':''}>Divine Wealth</option>
            <option value="sovereign-mentor" ${program==='sovereign-mentor'?'selected':''}>Sovereign Mentor</option>
            <option value="inner-sanctum"    ${program==='inner-sanctum'?'selected':''}>Inner Sanctum</option>
          </select>
          <select class="filter-select" onchange="filterArchetype(this.value)">
            <option value="">All Archetypes</option>
            <option value="A" ${archetype==='A'?'selected':''}>The Guard</option>
            <option value="B" ${archetype==='B'?'selected':''}>The Prover</option>
            <option value="C" ${archetype==='C'?'selected':''}>The Hider</option>
            <option value="D" ${archetype==='D'?'selected':''}>The Giver</option>
            <option value="E" ${archetype==='E'?'selected':''}>The Gripper</option>
          </select>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Name</th><th>Email</th><th>Phone</th><th>Program</th>
          <th>Archetype</th><th>Score</th><th>Signed Up</th>
        </tr></thead>
        <tbody id="leads-body">
          <tr class="loading-row"><td colspan="7">Loading…</td></tr>
        </tbody>
      </table>
      <div class="pagination" id="pagination"></div>
    </div>`;

  try {
    const params = new URLSearchParams({
      page, limit: 25,
      ...(search   ? { search }   : {}),
      ...(program  ? { program }  : {}),
      ...(archetype? { archetype }: {}),
    });
    const d = await api('/admin/leads?' + params);
    State.leads = { ...State.leads, data: d.data, total: d.total, page: d.page, pages: d.pages };
    document.getElementById('lead-count').textContent = `(${d.total})`;
    document.getElementById('leads-body').innerHTML = d.data.length === 0
      ? `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ink-faint)">No leads found.</td></tr>`
      : d.data.map(l => `
          <tr onclick="openLead('${l.id}')">
            <td class="name">${esc(l.name)}</td>
            <td>${esc(l.email)}</td>
            <td>${esc(l.phone||'—')}</td>
            <td class="program">${esc(l.program||'')}</td>
            <td>${l.top_archetype
              ? `<span class="badge badge-${l.top_archetype}">${ARCH[l.top_archetype]}</span>`
              : '<span style="color:var(--ink-faint);font-size:.75rem">—</span>'}</td>
            <td>${l.expansion_score != null ? l.expansion_score+'%' : '—'}</td>
            <td>${fmtDate(l.created_at)}</td>
          </tr>`).join('');

    // Pagination
    document.getElementById('pagination').innerHTML = `
      <button class="page-btn" onclick="loadLeads(${d.page-1})" ${d.page<=1?'disabled':''}>← Prev</button>
      <span class="page-info">Page ${d.page} of ${d.pages}</span>
      <button class="page-btn" onclick="loadLeads(${d.page+1})" ${d.page>=d.pages?'disabled':''}>Next →</button>`;
  } catch (e) {
    document.getElementById('leads-body').innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--danger)">${esc(e.message)}</td></tr>`;
  }
}

let searchTimer;
function debounceSearch(v) {
  State.leads.search = v;
  State.leads.page = 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadLeads(1), 350);
}
function filterProgram(v)  { State.leads.program   = v; State.leads.page = 1; loadLeads(1); }
function filterArchetype(v){ State.leads.archetype  = v; State.leads.page = 1; loadLeads(1); }

// ── Lead detail panel ─────────────────────────────────────────────
async function openLead(id) {
  if (!id) return;
  const overlay = document.getElementById('detail-overlay');
  overlay.innerHTML = `<div class="detail-panel"><div class="detail-body" style="padding:40px;color:var(--ink-faint)">Loading…</div></div>`;
  overlay.style.display = 'flex';
  overlay.onclick = e => { if (e.target === overlay) closeDetail(); };

  try {
    const d = await api('/admin/leads/' + id);
    const ARCH_NAMES = {A:'The Guard',B:'The Prover',C:'The Hider',D:'The Giver',E:'The Gripper'};
    const ARCH_THEME = {A:'Safety',B:'Worthiness',C:'Visibility',D:'Receiving',E:'Ease'};
    const latest = d.submissions?.[0];

    // Category bars for latest submission
    let bars = '';
    if (latest?.category_scores) {
      const scores = typeof latest.category_scores === 'string'
        ? JSON.parse(latest.category_scores) : latest.category_scores;
      const max = Math.max(...Object.values(scores), 1);
      ['A','B','C','D','E'].forEach(c => {
        const pct = Math.round((scores[c]||0)/max*100);
        bars += `<div class="cat-bar-row">
          <span class="cat-bar-label">${ARCH_THEME[c]}</span>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
          <span class="cat-bar-pct">${pct}%</span>
        </div>`;
      });
    }

    overlay.innerHTML = `
      <div class="detail-panel">
        <div class="detail-head">
          <div>
            <h2>${esc(d.lead.name)}</h2>
            <div style="font-size:.78rem;color:var(--ink-faint);margin-top:2px">${esc(d.lead.email)}</div>
          </div>
          <button class="close-btn" onclick="closeDetail()">✕</button>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4>Lead Information</h4>
            ${detailRow('Email',    d.lead.email)}
            ${detailRow('Phone',    d.lead.phone||'—')}
            ${detailRow('Program',  d.lead.program)}
            ${detailRow('Source',   d.lead.source||'assessment')}
            ${detailRow('Signed up',fmtDate(d.lead.created_at))}
          </div>

          ${latest ? `
          <div class="detail-section">
            <h4>Latest Assessment</h4>
            ${detailRow('Archetype', `<span class="badge badge-${latest.top_archetype}">${ARCH_NAMES[latest.top_archetype]||latest.top_archetype}</span>`)}
            ${detailRow('Score', latest.expansion_score+'%')}
            ${detailRow('Submitted', fmtDate(latest.submitted_at))}
            <div style="margin-top:16px">${bars}</div>
            <div style="margin-top:12px">
              <button class="btn-save" style="background:rgba(21,66,48,.1);color:var(--forest);font-size:.75rem;padding:7px 16px"
                onclick="openSubmission('${latest.id}')">
                View Full Submission (Admin) →
              </button>
            </div>
          </div>` : ''}

          ${d.submissions?.length > 1 ? `
          <div class="detail-section">
            <h4>Assessment History (${d.submissions.length})</h4>
            ${d.submissions.map((s,i) => i===0 ? '' : `
              <div class="detail-row">
                <span class="dk">${fmtDate(s.submitted_at)}</span>
                <span class="dv"><span class="badge badge-${s.top_archetype}">${ARCH_NAMES[s.top_archetype]}</span> ${s.expansion_score}%</span>
              </div>`).join('')}
          </div>` : ''}

          <div class="detail-section">
            <h4>Coaching Notes</h4>
            <textarea class="notes-area" id="notes-input" placeholder="Internal notes (not visible to client)…">${esc(d.lead.notes||'')}</textarea>
            <button class="btn-save" style="margin-top:10px" onclick="saveNotes('${d.lead.id}')">Save Notes</button>
          </div>

          ${d.reportViews?.length ? `
          <div class="detail-section">
            <h4>Report Views (${d.reportViews.length})</h4>
            ${d.reportViews.slice(0,5).map(v => `
              <div class="detail-row">
                <span class="dk">${fmtDate(v.viewed_at)}</span>
                <span class="dv" style="font-size:.72rem">${esc(v.ip_address||'—')}</span>
              </div>`).join('')}
          </div>` : ''}
        </div>
      </div>`;
  } catch (e) {
    overlay.innerHTML = `<div class="detail-panel">
      <div class="detail-head"><div><h2>Error</h2></div><button class="close-btn" onclick="closeDetail()">✕</button></div>
      <div class="detail-body"><p style="color:var(--danger)">${esc(e.message)}</p></div>
    </div>`;
  }
}

function closeDetail() {
  const o = document.getElementById('detail-overlay');
  o.style.display = 'none';
  o.innerHTML = '';
}

function detailRow(label, value) {
  return `<div class="detail-row"><span class="dk">${esc(label)}</span><span class="dv">${value}</span></div>`;
}

async function saveNotes(id) {
  const notes = document.getElementById('notes-input')?.value || '';
  try {
    await api('/admin/leads/'+id+'/notes', { method:'PATCH', body:{ notes } });
    toast('Notes saved ✦');
  } catch (e) { toast(e.message, true); }
}

// ── Full submission detail (admin — shows coaching notes) ─────────
async function openSubmission(id) {
  const overlay = document.getElementById('detail-overlay');
  overlay.innerHTML = `<div class="detail-panel"><div class="detail-body" style="padding:40px;color:var(--ink-faint)">Loading full submission…</div></div>`;
  overlay.style.display = 'flex';
  overlay.onclick = e => { if (e.target === overlay) closeDetail(); };

  try {
    const s = await api('/admin/submissions/' + id);
    const ARCH_NAMES = {A:'The Guard',B:'The Prover',C:'The Hider',D:'The Giver',E:'The Gripper'};
    const scores = typeof s.category_scores === 'string'
      ? JSON.parse(s.category_scores) : s.category_scores || {};
    const flags  = typeof s.internal_flags === 'string'
      ? JSON.parse(s.internal_flags) : s.internal_flags || {};
    const answers = typeof s.raw_answers === 'string'
      ? JSON.parse(s.raw_answers) : s.raw_answers || [];

    const flagsList = Object.entries(flags)
      .filter(([,v]) => v === true)
      .map(([k]) => `<span style="display:inline-block;background:rgba(192,57,43,.1);color:var(--danger);border-radius:3px;padding:2px 8px;font-size:.7rem;margin:2px 2px 0 0">${k.replace(/_/g,' ')}</span>`)
      .join('');

    overlay.innerHTML = `
      <div class="detail-panel">
        <div class="detail-head">
          <div>
            <h2>${esc(s.name)} — Full Submission</h2>
            <div style="font-size:.72rem;color:var(--ink-faint);margin-top:2px">Admin view · Confidential</div>
          </div>
          <button class="close-btn" onclick="closeDetail()">✕</button>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4>Result</h4>
            ${detailRow('Archetype', `<span class="badge badge-${s.top_archetype}">${ARCH_NAMES[s.top_archetype]}</span>`)}
            ${detailRow('Expansion Score', s.expansion_score+'%')}
            ${detailRow('Program', s.program)}
            ${detailRow('Submitted', fmtDate(s.submitted_at))}
            ${detailRow('IP Address', s.ip_address||'—')}
          </div>

          <div class="detail-section">
            <h4>Raw Answers</h4>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              ${answers.map((a,i) => `<span style="padding:4px 10px;background:${a===s.top_archetype?'var(--forest)':'rgba(21,66,48,.08)'};color:${a===s.top_archetype?'var(--gold)':'var(--ink)'};border-radius:4px;font-size:.78rem;font-weight:500">Q${i+1}: ${a}</span>`).join('')}
            </div>
          </div>

          <div class="detail-section">
            <h4>Category Scores</h4>
            ${['A','B','C','D','E'].map(c => {
              const THEME = {A:'Safety (A)',B:'Worthiness (B)',C:'Visibility (C)',D:'Receiving (D)',E:'Ease (E)'};
              const max = Math.max(...Object.values(scores),1);
              const pct = Math.round((scores[c]||0)/max*100);
              return `<div class="cat-bar-row">
                <span class="cat-bar-label">${THEME[c]}</span>
                <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
                <span class="cat-bar-pct">${scores[c]||0} pts</span>
              </div>`;
            }).join('')}
          </div>

          <div class="detail-section">
            <h4>Internal Flags</h4>
            ${flagsList || '<span style="color:var(--ink-faint);font-size:.8rem">None</span>'}
          </div>

          <div class="detail-section">
            <h4>Coaching Notes (Auto-Generated)</h4>
            <div style="background:rgba(21,66,48,.05);border-left:3px solid var(--gold-deep);padding:14px 18px;border-radius:0 4px 4px 0;font-size:.88rem;color:var(--ink-soft);line-height:1.75">
              ${esc(s.coaching_notes || 'No coaching notes.')}
            </div>
          </div>

          <div class="detail-section">
            <h4>Custom Coaching Notes</h4>
            <textarea class="notes-area" id="coaching-notes-input" placeholder="Add your own coaching observations…">${esc(s.coaching_notes||'')}</textarea>
            <button class="btn-save" style="margin-top:10px" onclick="saveCoachingNotes('${s.id}')">Save</button>
          </div>
        </div>
      </div>`;
  } catch (e) {
    overlay.innerHTML = `<div class="detail-panel">
      <div class="detail-head"><div><h2>Error</h2></div><button class="close-btn" onclick="closeDetail()">✕</button></div>
      <div class="detail-body"><p style="color:var(--danger)">${esc(e.message)}</p></div>
    </div>`;
  }
}

async function saveCoachingNotes(id) {
  const notes = document.getElementById('coaching-notes-input')?.value || '';
  try {
    await api('/admin/submissions/'+id+'/notes', { method:'PATCH', body:{ coaching_notes: notes } });
    toast('Coaching notes saved ✦');
  } catch (e) { toast(e.message, true); }
}

// ── Audit log ─────────────────────────────────────────────────────
async function loadAudit() {
  document.getElementById('page-title').textContent = 'Audit Log';
  const el = document.getElementById('content');
  el.innerHTML = '<p style="color:var(--ink-faint);padding:32px">Loading…</p>';
  try {
    const rows = await api('/admin/audit?limit=100');
    el.innerHTML = `
      <div class="table-wrap">
        <div class="table-header"><h3>Audit Log <span style="font-size:.8rem;font-weight:400;color:var(--ink-faint)">(last 100)</span></h3></div>
        <table>
          <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead>
          <tbody>
            ${rows.length === 0
              ? '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink-faint)">No audit entries yet.</td></tr>'
              : rows.map(r => `<tr>
                  <td>${fmtDate(r.created_at)}</td>
                  <td>${esc(r.admin_email||'system')}</td>
                  <td><code style="font-size:.75rem;background:var(--forest-light);padding:2px 6px;border-radius:3px;color:var(--forest)">${esc(r.action)}</code></td>
                  <td style="font-size:.75rem;color:var(--ink-faint)">${esc(r.entity||'')}</td>
                  <td style="font-size:.75rem;color:var(--ink-faint)">${esc(r.ip_address||'—')}</td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">⚠</div><p>${esc(e.message)}</p></div>`;
  }
}

// ── CSV Export ────────────────────────────────────────────────────
async function exportCSV() {
  try {
    const res = await fetch('/api/admin/export/csv', { credentials: 'include' });
    if (!res.ok) { toast('Export failed', true); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `tejal-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV downloaded ✦');
  } catch { toast('Export failed', true); }
}

// ── Utilities ─────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function toast(msg, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  if (isError) t.style.background = 'var(--danger)';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
