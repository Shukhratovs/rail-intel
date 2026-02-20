'use client'

import { useState, useEffect, useCallback } from 'react'

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

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px; border-bottom: 1px solid var(--border);
    background: rgba(10,12,16,0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .brand-name { font-size: 16px; font-weight: 700; }
  .brand-sub { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .live-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); font-size: 11px; font-family: 'DM Mono', monospace; color: var(--accent); }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* Layout */
  .main { display: flex; flex: 1; }
  .sidebar { width: 220px; border-right: 1px solid var(--border); padding: 20px 14px; background: var(--surface); display: flex; flex-direction: column; gap: 4px; }
  .sidebar-label { font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 8px 6px; }
  .hub-btn { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--muted); transition: all .15s; border: none; background: none; width: 100%; text-align: left; }
  .hub-btn:hover { background: var(--surface2); color: var(--text); }
  .hub-btn.active { background: rgba(0,229,160,0.1); color: var(--accent); }
  .hub-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  /* Status box */
  .status-box { margin-top: 16px; padding: 12px; background: var(--surface2); border-radius: 8px; font-size: 11px; font-family: 'DM Mono', monospace; }
  .status-row { display: flex; justify-content: space-between; padding: 3px 0; }
  .status-key { color: var(--muted); }
  .status-val { font-weight: 500; }
  .status-val.ok { color: var(--accent); }
  .status-val.loading { color: var(--accent3); }

  /* Content */
  .content { flex: 1; padding: 28px 32px; }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; animation: fadeIn .4s ease both; }
  .stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat.c0::before { background: var(--accent); }
  .stat.c1::before { background: var(--accent2); }
  .stat.c2::before { background: var(--accent3); }
  .stat.c3::before { background: var(--yolo); }
  .stat-icon { position: absolute; right: 16px; top: 14px; font-size: 22px; opacity: .2; }
  .stat-lbl { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: .5px; margin-bottom: 8px; }
  .stat-val { font-size: 30px; font-weight: 800; letter-spacing: -1px; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  /* Loading state */
  .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 16px; }
  .train-loader { font-size: 36px; animation: trainMove 1.5s ease-in-out infinite; }
  @keyframes trainMove { 0%,100%{transform:translateX(-10px)} 50%{transform:translateX(10px)} }
  .loading-text { font-size: 14px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .loading-sub { font-size: 11px; color: var(--muted); opacity: .6; }
  .progress-bar { width: 200px; height: 2px; background: var(--border); border-radius: 1px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 1px; animation: progress 2s ease-in-out infinite; }
  @keyframes progress { 0%{width:0%} 50%{width:70%} 100%{width:100%} }

  /* Filters */
  .filters { display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
  .filter-lbl { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  select, .search-input {
    background: var(--surface); border: 1px solid var(--border); color: var(--text);
    padding: 8px 12px; border-radius: 8px; font-size: 13px; font-family: 'Syne', sans-serif;
    outline: none; transition: border-color .15s; cursor: pointer;
  }
  select:focus, .search-input:focus { border-color: var(--accent); }
  .search-input { width: 180px; }
  .ml { margin-left: auto; }
  .btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: 'Syne', sans-serif; cursor: pointer; border: none; transition: all .15s; display: flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover:not(:disabled) { background: #00ffb3; }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .btn-ghost { background: var(--surface); border: 1px solid var(--border); color: var(--text); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* Table */
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .table-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .table-title { font-size: 14px; font-weight: 700; }
  .table-meta { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; padding: 9px 16px; font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid var(--border); background: var(--surface2); white-space: nowrap; cursor: pointer; user-select: none; }
  thead th:hover { color: var(--text); }
  thead th.sorted { color: var(--accent); }
  tbody tr { border-bottom: 1px solid var(--border); transition: background .1s; animation: fadeIn .3s ease both; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--surface2); }
  td { padding: 10px 16px; font-size: 13px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

  /* Route cell */
  .route { display: flex; align-items: center; gap: 7px; }
  .route-from { font-weight: 700; }
  .route-arrow { color: var(--muted); font-size: 10px; }
  .route-to { color: var(--muted); }
  .hub-tag { padding: 1px 6px; border-radius: 3px; background: rgba(0,229,160,.08); color: var(--accent); font-size: 9px; font-family: 'DM Mono', monospace; }

  /* Bar */
  .bar-cell { display: flex; align-items: center; gap: 8px; }
  .bar-track { width: 80px; height: 4px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 2px; background: var(--accent); transition: width .6s ease; }
  .bar-num { font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; min-width: 22px; }

  /* Pills */
  .pill { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }
  .pill-a { background: rgba(0,229,160,.12); color: var(--afro); }
  .pill-s { background: rgba(0,119,255,.12); color: var(--sharq); }
  .pill-t { background: rgba(255,107,53,.12); color: var(--tezkor); }
  .pill-y { background: rgba(167,139,250,.12); color: var(--yolo); }
  .dim { opacity: .25; }

  /* Pagination */
  .pager { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid var(--border); }
  .pager-info { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .pager-btns { display: flex; gap: 5px; }
  .pager-btn { padding: 5px 11px; border-radius: 6px; font-size: 12px; font-weight: 600; background: var(--surface2); border: 1px solid var(--border); color: var(--text); cursor: pointer; transition: all .15s; }
  .pager-btn:hover { border-color: var(--accent); color: var(--accent); }
  .pager-btn.on { background: var(--accent); color: #000; border-color: var(--accent); }
  .pager-btn:disabled { opacity: .3; cursor: not-allowed; }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; background: var(--accent); color: #000; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; box-shadow: 0 8px 32px rgba(0,229,160,.3); animation: slideUp .3s ease; }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:none;opacity:1} }

  /* Spinner */
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,.2); border-top-color: #000; border-radius: 50%; animation: spin .7s linear infinite; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`

const HUBS = ['Barcha', 'Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan']
const PAGE_SIZE = 15

function csvDownload(rows) {
  const h = ['Dan', 'Ga', 'Jami', 'Afrosiyob', 'Sharq', 'Tezkor', "Yo'lovchi"]
  const body = rows.map(r => [r.from_station, r.to_station, r.total, r.afrosiyob, r.sharq, r.tezkor, r.yolovchi].join(','))
  const blob = new Blob([[h.join(','), ...body].join('\n')], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `rail-intel-${new Date().toISOString().split('T')[0]}.csv` })
  a.click()
}

export default function Dashboard() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchedAt, setFetchedAt] = useState(null)
  const [hub, setHub] = useState('Barcha')
  const [typeFilter, setTypeFilter] = useState('Barchasi')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('total')
  const [sortDir, setSortDir] = useState(-1)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trains')
      const data = await res.json()
      // Normalize field names
      const normalized = (data.routes || []).map(r => ({
        from_station: r.from_station || r.from,
        to_station: r.to_station || r.to,
        total: r.total || r.total_count || 0,
        afrosiyob: r.afrosiyob || 0,
        sharq: r.sharq || 0,
        tezkor: r.tezkor || 0,
        yolovchi: r.yolovchi || 0,
      }))
      setRoutes(normalized)
      setFetchedAt(data.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString('uz') : new Date().toLocaleTimeString('uz'))
      showToast(`✅ ${normalized.length} ta marshrut yuklandi`)
    } catch (e) {
      showToast('❌ Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d * -1)
    else { setSortKey(key); setSortDir(-1) }
    setPage(1)
  }

  const filtered = routes
    .filter(r => hub === 'Barcha' || r.from_station === hub)
    .filter(r => typeFilter === 'Barchasi' || (typeFilter === 'Afrosiyob' && r.afrosiyob > 0) || (typeFilter === 'Sharq' && r.sharq > 0) || (typeFilter === 'Tezkor' && r.tezkor > 0))
    .filter(r => !search || r.from_station.toLowerCase().includes(search.toLowerCase()) || r.to_station.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir)

  const maxTotal = Math.max(...filtered.map(r => r.total), 1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalReys = routes.reduce((s, r) => s + r.total, 0)
  const totalAfro = routes.reduce((s, r) => s + r.afrosiyob, 0)
  const totalSharq = routes.reduce((s, r) => s + r.sharq, 0)

  const sortArrow = k => sortKey === k ? (sortDir === -1 ? ' ↓' : ' ↑') : ''

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="header">
        <div className="brand">
          <div className="logo">🚄</div>
          <div>
            <div className="brand-name">Rail Intel</div>
            <div className="brand-sub">O'zbekiston Temir Yo'llari · Jonli monitoring</div>
          </div>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          Jonli ma'lumotlar · eticket.railway.uz
        </div>
      </header>

      <div className="main">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-label">Vokzal filtri</div>
          {HUBS.map(h => (
            <button key={h} className={`hub-btn ${hub === h ? 'active' : ''}`} onClick={() => { setHub(h); setPage(1) }}>
              <span className="hub-dot" />
              {h}
            </button>
          ))}

          <div className="sidebar-label" style={{ marginTop: 12 }}>Holat</div>
          <div className="status-box">
            <div className="status-row"><span className="status-key">API</span><span className={`status-val ${loading ? 'loading' : 'ok'}`}>{loading ? 'Yuklanyapti' : 'Faol'}</span></div>
            <div className="status-row"><span className="status-key">Marshrutlar</span><span className="status-val">{routes.length}</span></div>
            <div className="status-row"><span className="status-key">Yangilangan</span><span className="status-val">{fetchedAt || '—'}</span></div>
          </div>
        </nav>

        {/* Main content */}
        <main className="content">
          {/* Stats */}
          <div className="stats">
            {[
              { lbl: 'JAMI REYLAR', val: totalReys, sub: `${routes.length} marshrut`, cls: 'c0', color: 'var(--accent)', icon: '🚂' },
              { lbl: 'AFROSIYOB', val: totalAfro, sub: totalReys ? `${((totalAfro/totalReys)*100).toFixed(1)}% jami` : '—', cls: 'c1', color: 'var(--accent2)', icon: '⚡' },
              { lbl: 'SHARQ', val: totalSharq, sub: 'poezdlar', cls: 'c2', color: 'var(--accent3)', icon: '🚄' },
              { lbl: 'MARSHRUTLAR', val: routes.length, sub: '5 asosiy tugun', cls: 'c3', color: 'var(--yolo)', icon: '📍' },
            ].map((s, i) => (
              <div key={i} className={`stat ${s.cls}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-lbl">{s.lbl}</div>
                <div className="stat-val" style={{ color: s.color }}>{loading && routes.length === 0 ? '…' : s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filters bar */}
          <div className="filters">
            <span className="filter-lbl">TURI</span>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
              <option>Barchasi</option>
              <option>Afrosiyob</option>
              <option>Sharq</option>
              <option>Tezkor</option>
            </select>
            <input className="search-input" placeholder="🔍  Izlash..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            <div className="ml" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => { csvDownload(filtered); showToast('📥 CSV yuklab olindi!') }}>📥 CSV</button>
              <button className="btn btn-primary" onClick={fetchData} disabled={loading}>
                {loading ? <><span className="spin" /> Yuklanyapti...</> : '🔄 Yangilash'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-head">
              <div>
                <span className="table-title">Marshrut ma'lumotlari</span>
                <span className="table-meta" style={{ marginLeft: 8 }}>{filtered.length} ta marshrut</span>
              </div>
              {fetchedAt && <span className="table-meta">Oxirgi yangilanish: {fetchedAt}</span>}
            </div>

            {loading && routes.length === 0 ? (
              <div className="loading-overlay">
                <div className="train-loader">🚄</div>
                <div className="loading-text">Railway API dan ma'lumotlar yuklanmoqda...</div>
                <div className="loading-sub">Bu 30–60 soniya vaqt olishi mumkin</div>
                <div className="progress-bar"><div className="progress-fill" /></div>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>MARSHRUT</th>
                      <th className={sortKey==='total'?'sorted':''} onClick={() => toggleSort('total')}>JAMI{sortArrow('total')}</th>
                      <th className={sortKey==='afrosiyob'?'sorted':''} onClick={() => toggleSort('afrosiyob')}>AFROSIYOB{sortArrow('afrosiyob')}</th>
                      <th className={sortKey==='sharq'?'sorted':''} onClick={() => toggleSort('sharq')}>SHARQ{sortArrow('sharq')}</th>
                      <th className={sortKey==='tezkor'?'sorted':''} onClick={() => toggleSort('tezkor')}>TEZKOR{sortArrow('tezkor')}</th>
                      <th>YO'LOVCHI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                        Marshrut topilmadi
                      </td></tr>
                    ) : paged.map((r, i) => (
                      <tr key={i} style={{ animationDelay: `${i * 30}ms` }}>
                        <td>
                          <div className="route">
                            <span className="route-from">{r.from_station}</span>
                            <span className="hub-tag">HUB</span>
                            <span className="route-arrow">→</span>
                            <span className="route-to">{r.to_station}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bar-cell">
                            <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.total / maxTotal) * 100}%` }} /></div>
                            <span className="bar-num">{r.total}</span>
                          </div>
                        </td>
                        <td><span className={`pill pill-a ${r.afrosiyob===0?'dim':''}`}>{r.afrosiyob}</span></td>
                        <td><span className={`pill pill-s ${r.sharq===0?'dim':''}`}>{r.sharq}</span></td>
                        <td><span className={`pill pill-t ${r.tezkor===0?'dim':''}`}>{r.tezkor}</span></td>
                        <td><span className={`pill pill-y ${r.yolovchi===0?'dim':''}`}>{r.yolovchi}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pager">
                  <span className="pager-info">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}</span>
                  <div className="pager-btns">
                    <button className="pager-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>←</button>
                    {Array.from({length: Math.min(totalPages,5)}, (_,i)=>i+1).map(p=>(
                      <button key={p} className={`pager-btn ${p===page?'on':''}`} onClick={()=>setPage(p)}>{p}</button>
                    ))}
                    <button className="pager-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>→</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
