'use client'

import { useState, useCallback } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0c10; --surface: #111318; --surface2: #181b22;
    --border: rgba(255,255,255,0.07); --accent: #00e5a0; --accent2: #0077ff;
    --accent3: #ff6b35; --text: #f0f2f5; --muted: #6b7280;
    --afro: #00e5a0; --sharq: #0077ff; --tezkor: #ff6b35; --yolo: #a78bfa;
    --radius: 12px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }
  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-bottom: 1px solid var(--border); background: rgba(10,12,16,0.95); position: sticky; top: 0; z-index: 100; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 17px; }
  .brand-name { font-size: 15px; font-weight: 700; }
  .brand-sub { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .live-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); font-size: 10px; font-family: 'DM Mono', monospace; color: var(--accent); }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .main { display: flex; flex: 1; }
  .sidebar { width: 200px; border-right: 1px solid var(--border); padding: 18px 12px; background: var(--surface); display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
  .sidebar-label { font-size: 9px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; padding: 10px 8px 5px; }
  .hub-btn { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--muted); transition: all .15s; border: none; background: none; width: 100%; text-align: left; }
  .hub-btn:hover { background: var(--surface2); color: var(--text); }
  .hub-btn.active { background: rgba(0,229,160,0.1); color: var(--accent); }
  .hub-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .status-box { margin-top: 14px; padding: 10px; background: var(--surface2); border-radius: 8px; font-size: 10px; font-family: 'DM Mono', monospace; }
  .status-row { display: flex; justify-content: space-between; padding: 3px 0; }
  .status-key { color: var(--muted); }
  .status-val { font-weight: 500; }
  .status-val.ok { color: var(--accent); }
  .status-val.warn { color: var(--accent3); }
  .content { flex: 1; padding: 24px 28px; overflow-x: auto; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; position: relative; overflow: hidden; }
  .stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat.c0::before { background: var(--accent); }
  .stat.c1::before { background: var(--accent2); }
  .stat.c2::before { background: var(--accent3); }
  .stat.c3::before { background: var(--yolo); }
  .stat-icon { position: absolute; right: 14px; top: 12px; font-size: 20px; opacity: .2; }
  .stat-lbl { font-size: 9px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: .5px; margin-bottom: 7px; }
  .stat-val { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .stat-sub { font-size: 10px; color: var(--muted); margin-top: 3px; }
  .progress-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; text-align: center; margin-bottom: 20px; }
  .train-anim { font-size: 32px; display: inline-block; animation: trainMove 1.2s ease-in-out infinite; margin-bottom: 12px; }
  @keyframes trainMove { 0%,100%{transform:translateX(-8px)} 50%{transform:translateX(8px)} }
  .progress-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .progress-sub { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; margin-bottom: 16px; }
  .progress-bar { width: 300px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin: 0 auto 8px; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width .3s ease; }
  .progress-pct { font-size: 11px; color: var(--accent); font-family: 'DM Mono', monospace; font-weight: 700; }
  .route-progress { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; margin-top: 4px; }
  .filters { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-lbl { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }
  select, .search-input { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 7px 11px; border-radius: 7px; font-size: 12px; font-family: 'Syne', sans-serif; outline: none; transition: border-color .15s; cursor: pointer; }
  select:focus, .search-input:focus { border-color: var(--accent); }
  .search-input { width: 160px; }
  .ml { margin-left: auto; display: flex; gap: 7px; }
  .btn { padding: 7px 14px; border-radius: 7px; font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; border: none; transition: all .15s; display: flex; align-items: center; gap: 5px; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover:not(:disabled) { background: #00ffb3; }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .btn-ghost { background: var(--surface); border: 1px solid var(--border); color: var(--text); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .table-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-bottom: 1px solid var(--border); }
  .table-title { font-size: 13px; font-weight: 700; }
  .table-meta { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; padding: 9px 14px; font-size: 9px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid var(--border); background: var(--surface2); white-space: nowrap; cursor: pointer; }
  thead th:hover { color: var(--text); }
  thead th.sorted { color: var(--accent); }
  tbody tr { border-bottom: 1px solid var(--border); transition: background .1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--surface2); }
  td { padding: 9px 14px; font-size: 12px; }
  .route { display: flex; align-items: center; gap: 6px; }
  .route-from { font-weight: 700; }
  .route-arrow { color: var(--muted); font-size: 10px; }
  .route-to { color: var(--muted); }
  .hub-tag { padding: 1px 5px; border-radius: 3px; background: rgba(0,229,160,.08); color: var(--accent); font-size: 8px; font-family: 'DM Mono', monospace; }
  .bar-cell { display: flex; align-items: center; gap: 7px; }
  .bar-track { width: 70px; height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 2px; background: var(--accent); }
  .bar-num { font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace; min-width: 20px; }
  .pill { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; font-family: 'DM Mono', monospace; }
  .pill-a { background: rgba(0,229,160,.12); color: var(--afro); }
  .pill-s { background: rgba(0,119,255,.12); color: var(--sharq); }
  .pill-t { background: rgba(255,107,53,.12); color: var(--tezkor); }
  .pill-y { background: rgba(167,139,250,.12); color: var(--yolo); }
  .dim { opacity: .25; }
  .pager { display: flex; align-items: center; justify-content: space-between; padding: 11px 18px; border-top: 1px solid var(--border); }
  .pager-info { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .pager-btns { display: flex; gap: 4px; }
  .pager-btn { padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 600; background: var(--surface2); border: 1px solid var(--border); color: var(--text); cursor: pointer; transition: all .15s; }
  .pager-btn:hover { border-color: var(--accent); color: var(--accent); }
  .pager-btn.on { background: var(--accent); color: #000; border-color: var(--accent); }
  .pager-btn:disabled { opacity: .3; cursor: not-allowed; }
  .toast { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: var(--accent); color: #000; padding: 10px 18px; border-radius: 9px; font-size: 12px; font-weight: 700; box-shadow: 0 8px 28px rgba(0,229,160,.3); animation: slideUp .3s ease; }
  .toast.err { background: var(--accent3); }
  @keyframes slideUp { from{transform:translateY(14px);opacity:0} to{transform:none;opacity:1} }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`

const HUBS = ['Barcha', 'Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan']
const PAGE_SIZE = 12

const TRACKED_ROUTES = [
  ['Toshkent','Samarqand'], ['Toshkent','Buxoro'],   ['Toshkent','Xiva'],
  ['Toshkent','Urganch'],   ['Toshkent','Nukus'],     ['Toshkent','Navoiy'],
  ['Toshkent','Andijon'],   ['Toshkent','Qarshi'],    ['Toshkent','Jizzax'],
  ['Toshkent','Termiz'],    ['Toshkent','Namangan'],  ['Toshkent',"Qo'qon"],
  ['Toshkent','Margilon'],  ['Toshkent','Guliston'],
  ['Samarqand','Toshkent'], ['Samarqand','Buxoro'],   ['Samarqand','Navoiy'],
  ['Samarqand','Andijon'],  ['Samarqand','Qarshi'],   ['Samarqand','Termiz'],
  ['Buxoro','Toshkent'],    ['Buxoro','Samarqand'],   ['Buxoro','Navoiy'],
  ['Buxoro','Andijon'],     ['Buxoro','Termiz'],      ['Buxoro','Urganch'],
  ['Andijon','Toshkent'],   ['Andijon','Samarqand'],  ['Andijon','Buxoro'],
  ['Andijon','Navoiy'],     ['Andijon','Qarshi'],     ['Andijon','Termiz'],
  ['Namangan','Toshkent'],  ['Namangan','Samarqand'], ['Namangan','Andijon'],
]

function csvDownload(rows) {
  const h = ['Dan','Ga','Jami','Afrosiyob','Sharq','Tezkor',"Yo'lovchi"]
  const body = rows.map(r => [r.from, r.to, r.total, r.afrosiyob, r.sharq, r.tezkor, r.yolovchi].join(','))
  const blob = new Blob([[h.join(','), ...body].join('\n')], { type: 'text/csv' })
  Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `rail-intel-${new Date().toISOString().split('T')[0]}.csv`
  }).click()
}

export default function Dashboard() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentRoute, setCurrentRoute] = useState('')
  const [fetchedAt, setFetchedAt] = useState(null)
  const [hub, setHub] = useState('Barcha')
  const [typeFilter, setTypeFilter] = useState('Barchasi')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('total')
  const [sortDir, setSortDir] = useState(-1)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)

  function showToast(msg, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setProgress(0)
    setRoutes([])
    setCurrentRoute('Jadval ma\'lumotlari yuklanmoqda...')

    try {
      // Call our own API route which fetches from railway.uz server-side (no CORS issues)
      const res = await fetch('/api/trains')
      if (!res.ok) throw new Error(`API xatolik: ${res.status}`)
      const data = await res.json()

      const results = (data.routes || []).map(r => ({
        from: r.from_station,
        to: r.to_station,
        total: r.total || 0,
        afrosiyob: r.afrosiyob || 0,
        sharq: r.sharq || 0,
        tezkor: r.tezkor || 0,
        yolovchi: r.yolovchi || 0,
      }))

      setRoutes(results)
      setProgress(100)
      setFetchedAt(new Date().toLocaleTimeString('uz'))
      showToast(`✅ ${results.length} ta marshrut yuklandi!`)
    } catch (err) {
      console.error('Fetch error:', err)
      showToast(`❌ Xatolik: ${err.message}`, true)
    } finally {
      setLoading(false)
    }
  }, [])

  function toggleSort(k) {
    if (sortKey === k) setSortDir(d => d * -1)
    else { setSortKey(k); setSortDir(-1) }
    setPage(1)
  }
  const sa = k => sortKey === k ? (sortDir === -1 ? ' ↓' : ' ↑') : ''

  const filtered = routes
    .filter(r => hub === 'Barcha' || r.from === hub)
    .filter(r => typeFilter === 'Barchasi' ||
      (typeFilter === 'Afrosiyob' && r.afrosiyob > 0) ||
      (typeFilter === 'Sharq' && r.sharq > 0) ||
      (typeFilter === 'Tezkor' && r.tezkor > 0))
    .filter(r => !search ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.to.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir)

  const maxTotal = Math.max(...filtered.map(r => r.total), 1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalReys = routes.reduce((s, r) => s + r.total, 0)
  const totalAfro = routes.reduce((s, r) => s + r.afrosiyob, 0)
  const totalSharq = routes.reduce((s, r) => s + r.sharq, 0)

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="header">
        <div className="brand">
          <div className="logo">🚄</div>
          <div>
            <div className="brand-name">Rail Intel</div>
            <div className="brand-sub">O'zbekiston Temir Yo'llari · Haftalik jadval</div>
          </div>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          Haftalik jadval · O'zbekiston Temir Yo'llari
        </div>
      </header>

      <div className="main">
        <nav className="sidebar">
          <div className="sidebar-label">Vokzal filtri</div>
          {HUBS.map(h => (
            <button key={h} className={`hub-btn ${hub === h ? 'active' : ''}`} onClick={() => { setHub(h); setPage(1) }}>
              <span className="hub-dot" />{h}
            </button>
          ))}
          <div className="sidebar-label" style={{ marginTop: 12 }}>Holat</div>
          <div className="status-box">
            <div className="status-row"><span className="status-key">Holat</span><span className={`status-val ${loading ? 'warn' : routes.length > 0 ? 'ok' : 'warn'}`}>{loading ? 'Yuklanyapti' : routes.length > 0 ? 'Tayyor' : 'Yuklanmagan'}</span></div>
            <div className="status-row"><span className="status-key">Marshrutlar</span><span className="status-val">{routes.length} / {TRACKED_ROUTES.length}</span></div>
            <div className="status-row"><span className="status-key">Yangilangan</span><span className="status-val">{fetchedAt || '—'}</span></div>
          </div>
        </nav>

        <main className="content">
          {/* Stats */}
          <div className="stats">
            {[
              { lbl: 'HAFTALIK REYLAR', val: totalReys, sub: `${routes.length} marshrut`, cls: 'c0', color: 'var(--accent)', icon: '🚂' },
              { lbl: 'AFROSIYOB', val: totalAfro, sub: totalReys ? `${((totalAfro / totalReys) * 100).toFixed(1)}% jami` : '—', cls: 'c1', color: 'var(--accent2)', icon: '⚡' },
              { lbl: 'SHARQ', val: totalSharq, sub: totalReys ? `${((totalSharq / totalReys) * 100).toFixed(1)}% jami` : '—', cls: 'c2', color: 'var(--accent3)', icon: '🚄' },
              { lbl: 'MARSHRUTLAR', val: routes.length, sub: '5 asosiy tugun', cls: 'c3', color: 'var(--yolo)', icon: '📍' },
            ].map((s, i) => (
              <div key={i} className={`stat ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-lbl">{s.lbl}</div>
                <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Loading progress */}
          {loading && (
            <div className="progress-wrap">
              <div className="train-anim">🚄</div>
              <div className="progress-title">Ma'lumotlar yuklanmoqda...</div>
              <div className="progress-sub">Jadval ma'lumotlari olinmoqda</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-pct">{progress}%</div>
              <div className="route-progress">{currentRoute}</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && routes.length === 0 && (
            <div className="table-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚉</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Ma'lumot yo'q</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginBottom: 20 }}>
                Boshlash uchun "Yangilash" tugmasini bosing
              </div>
              <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={fetchAll}>
                🔄 Ma'lumotlarni yuklash
              </button>
            </div>
          )}

          {/* Table */}
          {routes.length > 0 && (
            <>
              <div className="filters">
                <span className="filter-lbl">TURI</span>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                  <option>Barchasi</option>
                  <option>Afrosiyob</option>
                  <option>Sharq</option>
                  <option>Tezkor</option>
                </select>
                <input className="search-input" placeholder="🔍  Izlash..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                <div className="ml">
                  <button className="btn btn-ghost" onClick={() => { csvDownload(filtered); showToast('📥 CSV yuklab olindi!') }}>📥 CSV</button>
                  <button className="btn btn-primary" onClick={fetchAll} disabled={loading}>🔄 Yangilash</button>
                </div>
              </div>

              <div className="table-wrap">
                <div className="table-head">
                  <div>
                    <span className="table-title">Marshrut ma'lumotlari</span>
                    <span className="table-meta" style={{ marginLeft: 8 }}>{filtered.length} ta marshrut</span>
                  </div>
                  {fetchedAt && <span className="table-meta">Yangilangan: {fetchedAt}</span>}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>MARSHRUT</th>
                      <th className={sortKey === 'total' ? 'sorted' : ''} onClick={() => toggleSort('total')}>HAFTALIK{sa('total')}</th>
                      <th className={sortKey === 'afrosiyob' ? 'sorted' : ''} onClick={() => toggleSort('afrosiyob')}>AFROSIYOB{sa('afrosiyob')}</th>
                      <th className={sortKey === 'sharq' ? 'sorted' : ''} onClick={() => toggleSort('sharq')}>SHARQ{sa('sharq')}</th>
                      <th className={sortKey === 'tezkor' ? 'sorted' : ''} onClick={() => toggleSort('tezkor')}>TEZKOR{sa('tezkor')}</th>
                      <th>YO'LOVCHI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', fontSize: 12 }}>Marshrut topilmadi</td></tr>
                    ) : paged.map((r, i) => (
                      <tr key={i}>
                        <td>
                          <div className="route">
                            <span className="route-from">{r.from}</span>
                            <span className="hub-tag">HUB</span>
                            <span className="route-arrow">→</span>
                            <span className="route-to">{r.to}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bar-cell">
                            <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.total / maxTotal) * 100}%` }} /></div>
                            <span className="bar-num">{r.total}</span>
                          </div>
                        </td>
                        <td><span className={`pill pill-a ${r.afrosiyob === 0 ? 'dim' : ''}`}>{r.afrosiyob}</span></td>
                        <td><span className={`pill pill-s ${r.sharq === 0 ? 'dim' : ''}`}>{r.sharq}</span></td>
                        <td><span className={`pill pill-t ${r.tezkor === 0 ? 'dim' : ''}`}>{r.tezkor}</span></td>
                        <td><span className={`pill pill-y ${r.yolovchi === 0 ? 'dim' : ''}`}>{r.yolovchi}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pager">
                  <span className="pager-info">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
                  <div className="pager-btns">
                    <button className="pager-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`pager-btn ${p === page ? 'on' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button className="pager-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {toast && <div className={`toast ${toast.err ? 'err' : ''}`}>{toast.msg}</div>}
    </div>
  )
}