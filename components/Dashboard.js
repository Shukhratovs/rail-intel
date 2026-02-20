'use client'
import { useState, useCallback } from 'react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0c10;--surface:#111318;--surface2:#181b22;--border:rgba(255,255,255,0.07);--accent:#00e5a0;--accent2:#0077ff;--accent3:#ff6b35;--text:#f0f2f5;--muted:#6b7280;--afro:#00e5a0;--sharq:#0077ff;--yolo:#a78bfa;--radius:12px}
body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif}
.app{display:flex;flex-direction:column;min-height:100vh}
.header{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid var(--border);background:rgba(10,12,16,0.95);position:sticky;top:0;z-index:100}
.brand{display:flex;align-items:center;gap:12px}
.logo{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:17px}
.brand-name{font-size:15px;font-weight:700}
.brand-sub{font-size:10px;color:var(--muted);font-family:'DM Mono',monospace}
.live-badge{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.2);font-size:10px;font-family:'DM Mono',monospace;color:var(--accent)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.main{display:flex;flex:1}
.sidebar{width:200px;border-right:1px solid var(--border);padding:18px 12px;background:var(--surface);display:flex;flex-direction:column;gap:3px;flex-shrink:0}
.sidebar-label{font-size:9px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;padding:10px 8px 5px}
.hub-btn{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:var(--muted);transition:all .15s;border:none;background:none;width:100%;text-align:left}
.hub-btn:hover{background:var(--surface2);color:var(--text)}
.hub-btn.active{background:rgba(0,229,160,0.1);color:var(--accent)}
.hub-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.status-box{margin-top:14px;padding:10px;background:var(--surface2);border-radius:8px;font-size:10px;font-family:'DM Mono',monospace}
.status-row{display:flex;justify-content:space-between;padding:3px 0}
.status-key{color:var(--muted)}
.status-val{font-weight:500}
.status-val.ok{color:var(--accent)}
.status-val.warn{color:var(--accent3)}
.content{flex:1;padding:24px 28px;overflow-x:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.stat.c0::before{background:var(--accent)}.stat.c1::before{background:var(--accent2)}.stat.c2::before{background:var(--accent3)}.stat.c3::before{background:var(--yolo)}
.stat-icon{position:absolute;right:14px;top:12px;font-size:20px;opacity:.2}
.stat-lbl{font-size:9px;color:var(--muted);font-family:'DM Mono',monospace;letter-spacing:.5px;margin-bottom:7px}
.stat-val{font-size:28px;font-weight:800;letter-spacing:-1px}
.stat-sub{font-size:10px;color:var(--muted);margin-top:3px}
.filters{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.filter-lbl{font-size:10px;color:var(--muted);font-family:'DM Mono',monospace}
.ml{margin-left:auto;display:flex;gap:7px}
.btn{padding:7px 14px;border-radius:7px;font-size:11px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;border:none;transition:all .15s;display:flex;align-items:center;gap:5px}
.btn-primary{background:var(--accent);color:#000}
.btn-primary:hover:not(:disabled){background:#00ffb3}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:var(--surface);border:1px solid var(--border);color:var(--text)}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.table-head{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--border)}
.table-title{font-size:13px;font-weight:700}
.table-meta{font-size:10px;color:var(--muted);font-family:'DM Mono',monospace}
table{width:100%;border-collapse:collapse}
thead th{text-align:left;padding:7px 10px;font-size:8px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:.8px;text-transform:uppercase;border-bottom:1px solid var(--border);background:var(--surface2);white-space:nowrap;position:sticky;top:0}
tbody tr{border-bottom:1px solid var(--border);transition:background .1s}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:var(--surface2)}
tbody tr.hub-row{background:rgba(0,229,160,0.04);border-bottom:2px solid rgba(0,229,160,0.15)}
tbody tr.hub-row td{font-weight:700;color:var(--accent);font-size:12px;padding:10px}
td{padding:6px 10px;font-size:11px}
.route-name{font-weight:600;white-space:nowrap}
.num{font-family:'DM Mono',monospace;font-size:10px;text-align:center;min-width:28px}
.num.zero{opacity:.2}
.num.afro{color:var(--afro)}
.num.sharq{color:var(--sharq)}
.day-col{text-align:center;border-left:1px solid var(--border)}
.day-header{font-size:7px;line-height:1.3}
.day-date{display:block;font-size:9px;font-weight:600;color:var(--text)}
.progress-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;text-align:center;margin-bottom:20px}
.train-anim{font-size:32px;display:inline-block;animation:trainMove 1.2s ease-in-out infinite;margin-bottom:12px}
@keyframes trainMove{0%,100%{transform:translateX(-8px)}50%{transform:translateX(8px)}}
.toast{position:fixed;bottom:20px;right:20px;z-index:999;background:var(--accent);color:#000;padding:10px 18px;border-radius:9px;font-size:12px;font-weight:700;box-shadow:0 8px 28px rgba(0,229,160,.3);animation:slideUp .3s ease}
.toast.err{background:var(--accent3)}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
`

const SIDEBAR_HUBS = ['Barcha','Toshkent','Samarqand','Buxoro','Andijon','Namangan']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchedAt, setFetchedAt] = useState(null)
  const [hub, setHub] = useState('Barcha')
  const [toast, setToast] = useState(null)

  function showToast(msg, err = false) {
    setToast({ msg, err }); setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trains')
      if (!res.ok) throw new Error(`API xatolik: ${res.status}`)
      const json = await res.json()
      setData(json)
      setFetchedAt(new Date().toLocaleTimeString('uz'))
      showToast(`✅ Ma'lumotlar yuklandi!`)
    } catch (err) {
      showToast(`❌ Xatolik: ${err.message}`, true)
    } finally { setLoading(false) }
  }, [])

  const downloadCSV = useCallback(() => {
    window.open('/api/trains?format=csv', '_blank')
    showToast('📥 CSV yuklab olindi!')
  }, [])

  // Compute stats
  const allRoutes = data?.routes || []
  const totalReys = allRoutes.reduce((s,r) => s+r.total, 0)
  const totalAfro = allRoutes.reduce((s,r) => s+r.afrosiyob, 0)
  const totalSharq = allRoutes.reduce((s,r) => s+r.sharq, 0)

  // Filter hub groups
  const hubGroups = (data?.hubGroups || []).filter(g =>
    hub === 'Barcha' || g.hub === hub
  )

  return (
    <div className="app">
      <style>{css}</style>
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
          {SIDEBAR_HUBS.map(h => (
            <button key={h} className={`hub-btn ${hub===h?'active':''}`} onClick={() => setHub(h)}>
              <span className="hub-dot" />{h}
            </button>
          ))}
          <div className="sidebar-label" style={{marginTop:12}}>Holat</div>
          <div className="status-box">
            <div className="status-row"><span className="status-key">Holat</span><span className={`status-val ${loading?'warn':data?'ok':'warn'}`}>{loading?'Yuklanyapti':data?'Tayyor':'Yuklanmagan'}</span></div>
            <div className="status-row"><span className="status-key">Marshrutlar</span><span className="status-val">{allRoutes.length}</span></div>
            <div className="status-row"><span className="status-key">Yangilangan</span><span className="status-val">{fetchedAt||'—'}</span></div>
          </div>
        </nav>

        <main className="content">
          <div className="stats">
            {[
              {lbl:'HAFTALIK REYLAR',val:totalReys,sub:`${allRoutes.length} marshrut`,cls:'c0',color:'var(--accent)',icon:'🚂'},
              {lbl:'AFROSIYOB',val:totalAfro,sub:totalReys?`${((totalAfro/totalReys)*100).toFixed(1)}% jami`:'—',cls:'c1',color:'var(--accent2)',icon:'⚡'},
              {lbl:'SHARQ',val:totalSharq,sub:totalReys?`${((totalSharq/totalReys)*100).toFixed(1)}% jami`:'—',cls:'c2',color:'var(--accent3)',icon:'🚄'},
              {lbl:'MARSHRUTLAR',val:allRoutes.length,sub:'barcha yo\'nalishlar',cls:'c3',color:'var(--yolo)',icon:'📍'},
            ].map((s,i) => (
              <div key={i} className={`stat ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-lbl">{s.lbl}</div>
                <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="progress-wrap">
              <div className="train-anim">🚄</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Ma'lumotlar yuklanmoqda...</div>
            </div>
          )}

          {!loading && !data && (
            <div className="table-wrap" style={{padding:'60px 20px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>🚉</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>Ma'lumot yo'q</div>
              <div style={{fontSize:12,color:'var(--muted)',fontFamily:'DM Mono,monospace',marginBottom:20}}>Boshlash uchun "Yangilash" tugmasini bosing</div>
              <button className="btn btn-primary" style={{margin:'0 auto'}} onClick={fetchAll}>🔄 Ma'lumotlarni yuklash</button>
            </div>
          )}

          {data && (
            <>
              <div className="filters">
                <div className="ml">
                  <button className="btn btn-ghost" onClick={downloadCSV}>📥 CSV</button>
                  <button className="btn btn-primary" onClick={fetchAll} disabled={loading}>🔄 Yangilash</button>
                </div>
              </div>

              <div className="table-wrap">
                <div className="table-head">
                  <div>
                    <span className="table-title">Marshrut ma'lumotlari</span>
                    <span className="table-meta" style={{marginLeft:8}}>Excel formatida</span>
                  </div>
                  {fetchedAt && <span className="table-meta">Yangilangan: {fetchedAt}</span>}
                </div>
                <div style={{overflowX:'auto'}}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{minWidth:40}}>T/P</th>
                        <th style={{minWidth:100}}>VOKZAL</th>
                        <th style={{minWidth:160}}>YO'NALISH</th>
                        <th style={{minWidth:50}}>HAFTALIK</th>
                        <th style={{minWidth:50}}>AFROSIYOB</th>
                        {(data.days||[]).map((d,i) => (
                          <th key={i} className="day-col" colSpan={2}>
                            <div className="day-header">
                              <span className="day-date">{d.labelEn?.split(',')[0]}</span>
                              {d.date?.substring(5)}
                            </div>
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th></th><th></th><th></th>
                        <th style={{fontSize:7}}>JAMI</th>
                        <th style={{fontSize:7}}>SHUNDAN</th>
                        {(data.days||[]).map((_,i) => (
                          <><th key={`j${i}`} className="day-col" style={{fontSize:7}}>JAMI</th><th key={`a${i}`} className="day-col" style={{fontSize:7}}>AFRO</th></>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hubGroups.map(group => {
                        const mid = Math.floor(group.routes.length / 2)
                        const rows = []

                        if (group.routes.length === 0) {
                          rows.push(
                            <tr key={`hub-${group.hub}`} className="hub-row">
                              <td>{group.index}</td>
                              <td>{group.hub}</td>
                              <td></td>
                              <td className="num">{group.hubWeekly.total||''}</td>
                              <td className="num">{group.hubWeekly.afrosiyob||''}</td>
                              {(data.days||[]).map((_,i) => (
                                <><td key={`e1${i}`} className="day-col"></td><td key={`e2${i}`} className="day-col"></td></>
                              ))}
                            </tr>
                          )
                        } else {
                          group.routes.forEach((r, i) => {
                            rows.push(
                              <tr key={`${group.hub}-${r.to}-${i}`}>
                                <td style={{color:'var(--muted)',fontSize:10}}>{i===mid ? group.index : ''}</td>
                                <td style={{fontWeight:i===mid?700:400, color:i===mid?'var(--accent)':'var(--muted)', fontSize:i===mid?12:10}}>
                                  {i===mid ? group.hub : ''}
                                </td>
                                <td className="route-name">{r.routeName}</td>
                                <td className={`num ${r.weekly.total===0?'zero':''}`} style={{fontWeight:700}}>{r.weekly.total||''}</td>
                                <td className={`num afro ${r.weekly.afrosiyob===0?'zero':''}`}>{r.weekly.afrosiyob||''}</td>
                                {(r.perDay||[]).map((pd,di) => (
                                  <>
                                    <td key={`t${di}`} className={`num day-col ${pd.total===0?'zero':''}`}>{pd.total||''}</td>
                                    <td key={`a${di}`} className={`num day-col afro ${pd.afrosiyob===0?'zero':''}`}>{pd.afrosiyob||''}</td>
                                  </>
                                ))}
                              </tr>
                            )
                          })
                        }
                        return rows
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {toast && <div className={`toast ${toast.err?'err':''}`}>{toast.msg}</div>}
    </div>
  )
}
