'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0c10; --surface: #111318; --surface2: #181b22;
    --border: rgba(255,255,255,0.07); --accent: #00e5a0; --accent2: #0077ff;
    --accent3: #ff6b35; --text: #f0f2f5; --muted: #6b7280;
    --afro: #00e5a0; --sharq: #0077ff; --tezkor: #ff6b35; --yolovchi: #a78bfa;
    --radius: 12px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }
  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px; border-bottom: 1px solid var(--border);
    background: rgba(10,12,16,0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .header-brand { display: flex; align-items: center; gap: 12px; }
  .header-logo {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800;
  }
  .header-title { font-size: 16px; font-weight: 700; }
  .header-sub { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; margin-top: 1px; }
  .sync-badge {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px;
    background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2);
    font-size: 11px; font-family: 'DM Mono', monospace; color: var(--accent);
  }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .main { display: flex; flex: 1; }
  .sidebar {
    width: 220px; border-right: 1px solid var(--border); padding: 24px 16px;
    display: flex; flex-direction: column; gap: 4px; background: var(--surface);
    min-height: calc(100vh - 65px);
  }
  .sidebar-section { font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 8px 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
    cursor: pointer; font-size: 13px; font-weight: 600; color: var(--muted);
    transition: all .15s; border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: rgba(0,229,160,0.1); color: var(--accent); }
  .content { flex: 1; padding: 28px 32px; overflow-x: auto; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.green::before { background: var(--accent); }
  .stat-card.blue::before { background: var(--accent2); }
  .stat-card.orange::before { background: var(--accent3); }
  .stat-card.purple::before { background: var(--yolovchi); }
  .stat-label { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: .5px; margin-bottom: 8px; }
  .stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .stat-icon { position: absolute; right: 16px; top: 16px; font-size: 22px; opacity: .25; }
  .filters-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-group { display: flex; align-items: center; gap: 8px; }
  .filter-label { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; white-space: nowrap; }
  .filter-select, .filter-input {
    background: var(--surface); border: 1px solid var(--border); color: var(--text);
    padding: 8px 12px; border-radius: 8px; font-size: 13px; font-family: 'Syne', sans-serif;
    outline: none; cursor: pointer; transition: border-color .15s;
  }
  .filter-select:focus, .filter-input:focus { border-color: var(--accent); }
  .filter-input { width: 160px; }
  .btn {
    padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
    font-family: 'Syne', sans-serif; cursor: pointer; border: none; transition: all .15s;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: #00ffb3; }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .btn-ghost { background: var(--surface); border: 1px solid var(--border); color: var(--text); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .ml-auto { margin-left: auto; }
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .table-title { font-size: 14px; font-weight: 700; }
  .table-count { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; margin-left: 8px; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left; padding: 10px 16px; font-size: 10px; font-family: 'DM Mono', monospace;
    color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
    border-bottom: 1px solid var(--border); background: var(--surface2); white-space: nowrap;
  }
  tbody tr { border-bottom: 1px solid var(--border); transition: background .1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--surface2); }
  tbody td { padding: 11px 16px; font-size: 13px; }
  .route-cell { display: flex; align-items: center; gap: 8px; }
  .route-from { font-weight: 700; }
  .route-arrow { color: var(--muted); font-size: 11px; }
  .route-to { color: var(--muted); }
  .bar-wrap { display: flex; align-items: center; gap: 8px; width: 120px; }
  .bar-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 2px; background: var(--accent); }
  .bar-num { font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; min-width: 20px; text-align: right; }
  .pill { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }
  .pill-afro { background: rgba(0,229,160,.12); color: var(--afro); }
  .pill-sharq { background: rgba(0,119,255,.12); color: var(--sharq); }
  .pill-tezkor { background: rgba(255,107,53,.12); color: var(--tezkor); }
  .pill-yolo { background: rgba(167,139,250,.12); color: var(--yolovchi); }
  .pill-zero { opacity: .25; }
  .hub-badge { display: inline-block; padding: 2px 7px; border-radius: 4px; background: rgba(0,229,160,.08); color: var(--accent); font-size: 10px; font-family: 'DM Mono', monospace; margin-left: 4px; }
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--border); }
  .page-info { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .page-btns { display: flex; gap: 6px; }
  .page-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: var(--surface2); border: 1px solid var(--border); color: var(--text); cursor: pointer; transition: all .15s; }
  .page-btn:hover { border-color: var(--accent); color: var(--accent); }
  .page-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .page-btn:disabled { opacity: .35; cursor: not-allowed; }
  .empty { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; margin-bottom: 8px; }
  .empty-sub { font-size: 12px; font-family: 'DM Mono', monospace; }
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; background: var(--accent); color: #000; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; box-shadow: 0 8px 32px rgba(0,229,160,.3); animation: slideUp .3s ease; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .info-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; }
  .info-panel-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--accent); }
  .step { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: #000; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .step-content { flex: 1; }
  .step-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .step-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }
  code { background: var(--surface2); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 11px; color: var(--accent); }
  pre { background: var(--surface2); border: 1px solid var(--border); padding: 14px; border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 11px; color: #a0aec0; overflow-x: auto; line-height: 1.7; margin-top: 8px; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .loading-row td { text-align: center; padding: 40px; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; vertical-align: middle; margin-right: 8px; }
`

const HUBS = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan']
const PAGE_SIZE = 15

function timeAgo(iso) {
  if (!iso) return 'Hech qachon'
  const diff = Date.now() - new Date(iso)
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "Hozirgina"
  if (h < 24) return `${h} soat oldin`
  return `${Math.floor(h / 24)} kun oldin`
}

function downloadCSV(routes) {
  const header = ['Dan', 'Ga', 'Jami', 'Afrosiyob', 'Sharq', 'Tezkor', "Yo'lovchi"]
  const rows = routes.map(r => [r.from_station, r.to_station, r.total_count, r.afrosiyob, r.sharq, r.tezkor, r.yolovchi])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `rail-intel-${new Date().toISOString().split('T')[0]}.csv`; a.click()
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function Overview({ routes, weekStart, lastSync, onManualSync, syncing }) {
  const [fromFilter, setFromFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')

  const hasData = routes.length > 0
  const maxTotal = hasData ? Math.max(...routes.map(r => r.total_count)) : 1

  const filtered = routes.filter(r => {
    if (fromFilter !== 'All' && r.from_station !== fromFilter) return false
    if (typeFilter === 'Afrosiyob' && r.afrosiyob === 0) return false
    if (typeFilter === 'Sharq' && r.sharq === 0) return false
    if (typeFilter === 'Tezkor' && r.tezkor === 0) return false
    if (search && !r.from_station.toLowerCase().includes(search.toLowerCase()) && !r.to_station.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalReyses = routes.reduce((s, r) => s + r.total_count, 0)
  const totalAfro = routes.reduce((s, r) => s + r.afrosiyob, 0)
  const totalSharq = routes.reduce((s, r) => s + r.sharq, 0)

  const handleExport = () => {
    downloadCSV(filtered)
    setToast('✅ CSV fayl yuklab olindi!')
    setTimeout(() => setToast(''), 2500)
  }

  const handleSync = async () => {
    await onManualSync()
    setToast('🔄 Sinxronlash boshlandi!')
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <>
      <div className="stats-grid">
        {[
          { label: 'JAMI REYLAR', value: totalReyses, sub: `${routes.length} marshrut`, cls: 'green', icon: '🚂', color: 'var(--accent)' },
          { label: 'AFROSIYOB', value: totalAfro, sub: hasData ? `${((totalAfro / Math.max(totalReyses, 1)) * 100).toFixed(1)}% jami` : '—', cls: 'blue', icon: '⚡', color: 'var(--accent2)' },
          { label: 'SHARQ', value: totalSharq, sub: 'poezdlar', cls: 'orange', icon: '🚄', color: 'var(--accent3)' },
          { label: 'MARSHRUTLAR', value: routes.length, sub: `${HUBS.length} asosiy tugun`, cls: 'purple', icon: '📍', color: 'var(--yolovchi)' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">VOKZAL</span>
          <select className="filter-select" value={fromFilter} onChange={e => { setFromFilter(e.target.value); setPage(1) }}>
            <option>All</option>
            {HUBS.map(h => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">POYEZD TURI</span>
          <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
            <option>All</option>
            <option>Afrosiyob</option>
            <option>Sharq</option>
            <option>Tezkor</option>
          </select>
        </div>
        <input className="filter-input" placeholder="🔍  Izlash..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <div className="ml-auto" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={handleExport}>📥 CSV</button>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? <><span className="spinner" />Sinxronlanmoqda...</> : '🔄 Hozir sinxronlash'}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <div>
            <span className="table-title">Marshrut ma'lumotlari</span>
            <span className="table-count">{filtered.length} ta marshrut</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
            {weekStart ? `Hafta: ${weekStart}` : 'Ma\'lumot yo\'q'} · Yangilangan: {timeAgo(lastSync)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>MARSHRUT</th>
              <th>JAMI REYLAR</th>
              <th>AFROSIYOB</th>
              <th>SHARQ</th>
              <th>TEZKOR</th>
              <th>YO'LOVCHI</th>
            </tr>
          </thead>
          <tbody>
            {!hasData ? (
              <tr><td colSpan={6}>
                <div className="empty">
                  <div className="empty-icon">🚉</div>
                  <div className="empty-text">Ma'lumot hali yo'q</div>
                  <div className="empty-sub">Birinchi sinxronlashni boshlash uchun "Hozir sinxronlash" tugmasini bosing</div>
                </div>
              </td></tr>
            ) : paged.map((r, i) => (
              <tr key={i}>
                <td>
                  <div className="route-cell">
                    <span className="route-from">{r.from_station}</span>
                    {HUBS.includes(r.from_station) && <span className="hub-badge">HUB</span>}
                    <span className="route-arrow">→</span>
                    <span className="route-to">{r.to_station}</span>
                  </div>
                </td>
                <td>
                  <div className="bar-wrap">
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.total_count / maxTotal) * 100}%` }} /></div>
                    <span className="bar-num">{r.total_count}</span>
                  </div>
                </td>
                <td><span className={`pill pill-afro ${r.afrosiyob === 0 ? 'pill-zero' : ''}`}>{r.afrosiyob}</span></td>
                <td><span className={`pill pill-sharq ${r.sharq === 0 ? 'pill-zero' : ''}`}>{r.sharq}</span></td>
                <td><span className={`pill pill-tezkor ${r.tezkor === 0 ? 'pill-zero' : ''}`}>{r.tezkor}</span></td>
                <td><span className={`pill pill-yolo ${r.yolovchi === 0 ? 'pill-zero' : ''}`}>{r.yolovchi}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {hasData && (
          <div className="pagination">
            <span className="page-info">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
            <div className="page-btns">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

// ─── Setup Guide Tab ──────────────────────────────────────────────────────────
function SetupGuide() {
  const [copied, setCopied] = useState('')
  const copy = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000) }

  return (
    <div>
      <div className="info-panel">
        <div className="info-panel-title">🚀 Ishga tushirish bo'yicha qo'llanma</div>

        {[
          {
            title: "Neon DB jadvallarini yarating",
            desc: "Terminalda quyidagi buyruqni ishga tushiring:",
            code: "npm run db:push"
          },
          {
            title: "Vercel muhit o'zgaruvchilarini qo'shing",
            desc: "Vercel Dashboard → Settings → Environment Variables sahifasiga o'ting va quyidagilarni qo'shing:",
            code: "DATABASE_URL=postgresql://...\nCRON_SECRET=your-random-secret"
          },
          {
            title: "Birinchi sinxronlashni ishga tushiring",
            desc: "Dashboard'dagi \"Hozir sinxronlash\" tugmasini bosing yoki quyidagi curl buyrug'ini ishga tushiring:",
            code: 'curl -X POST https://your-app.vercel.app/api/sync \\\n  -H "Authorization: Bearer your-secret"'
          },
          {
            title: "Avtomatik haftalik sinxronlash",
            desc: "vercel.json faylidagi cron sozlamasi har dushanba soat 06:00 da sinxronlashni avtomatik ishga tushiradi. Hech qanday qo'shimcha sozlash talab etilmaydi.",
            code: null
          },
        ].map((step, i) => (
          <div key={i} className="step">
            <div className="step-num">{i + 1}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              {step.code && (
                <div style={{ position: 'relative' }}>
                  <pre>{step.code}</pre>
                  <button
                    className="btn btn-ghost"
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, padding: '3px 8px' }}
                    onClick={() => copy(step.code, i)}
                  >{copied === i ? '✅' : '📋'}</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="info-panel">
        <div className="info-panel-title">📊 Database Schema</div>
        <pre>{`-- Haftalik marshrut snapshotlari
CREATE TABLE route_snapshots (
  id           SERIAL PRIMARY KEY,
  from_station TEXT NOT NULL,
  to_station   TEXT NOT NULL,
  total_count  INT  NOT NULL DEFAULT 0,
  afrosiyob    INT  NOT NULL DEFAULT 0,
  sharq        INT  NOT NULL DEFAULT 0,
  tezkor       INT  NOT NULL DEFAULT 0,
  yolovchi     INT  NOT NULL DEFAULT 0,
  week_start   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sinxronlash loglari
CREATE TABLE sync_logs (
  id             SERIAL PRIMARY KEY,
  status         TEXT NOT NULL,
  routes_fetched INT,
  error_msg      TEXT,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ
);`}</pre>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Dashboard({ initialData }) {
  const [activeNav, setActiveNav] = useState('overview')
  const [data, setData] = useState(initialData)
  const [syncing, setSyncing] = useState(false)

  const handleManualSync = useCallback(async () => {
    setSyncing(true)
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` }
      })
      // Refetch data after sync
      const res = await fetch('/api/routes')
      const fresh = await res.json()
      setData(prev => ({ ...prev, routes: fresh.routes || prev.routes, weekStart: fresh.weekStart || prev.weekStart }))
    } catch (e) {
      console.error('Sync failed:', e)
    } finally {
      setSyncing(false)
    }
  }, [])

  const navItems = [
    { id: 'overview', icon: '📊', label: "Umumiy ko'rinish" },
    { id: 'setup', icon: '⚙️', label: 'Sozlash' },
  ]

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🚄</div>
          <div>
            <div className="header-title">Rail Intel</div>
            <div className="header-sub">O'zbekiston Temir Yo'llari · Monitoring tizimi</div>
          </div>
        </div>
        <div className="sync-badge">
          <div className="sync-dot" />
          Har dushanba 06:00 da avtomatik yangilanadi
        </div>
      </header>

      <div className="main">
        <nav className="sidebar">
          <div className="sidebar-section">Navigatsiya</div>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="sidebar-section" style={{ marginTop: 20 }}>Tizim holati</div>
          <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
            <div style={{ color: 'var(--muted)', marginBottom: 6 }}>MA'LUMOTLAR</div>
            <div style={{ color: data.routes.length > 0 ? 'var(--accent)' : 'var(--accent3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: data.routes.length > 0 ? 'var(--accent)' : 'var(--accent3)', display: 'inline-block' }} />
              {data.routes.length > 0 ? `${data.routes.length} marshrut` : "Bo'sh"}
            </div>
            <div style={{ color: 'var(--muted)', marginTop: 8, marginBottom: 4 }}>HAFTA</div>
            <div style={{ color: 'var(--text)' }}>{data.weekStart || '—'}</div>
          </div>
        </nav>

        <main className="content">
          {activeNav === 'overview' && (
            <Overview
              routes={data.routes || []}
              weekStart={data.weekStart}
              lastSync={data.lastSync}
              onManualSync={handleManualSync}
              syncing={syncing}
            />
          )}
          {activeNav === 'setup' && <SetupGuide />}
        </main>
      </div>
    </div>
  )
}
