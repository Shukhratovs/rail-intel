// app/api/trains/route.js
// Live data from eticket.railway.uz with static fallback

// Station codes for all major stations
const STATIONS = {
  'Toshkent':   '2900000',
  'Samarqand':  '2900680',
  'Buxoro':     '2900750',
  'Navoiy':     '2900730',
  'Qarshi':     '2900790',
  'Termiz':     '2900840',
  'Xiva':       '2900930',
  'Urganch':    '2900920',
  'Nukus':      '2900950',
  'Andijon':    '2900200',
  'Namangan':   '2900150',
  "Qo'qon":    '2900250',
  'Margilon':   '2900220',
  'Jizzax':     '2900640',
  'Guliston':   '2900600',
  'Pop':        '2900130',
  'Angren':     '2900080',
}

// Hub ordering matching the Excel
const HUBS_ORDER = [
  { n:'Toshkent', d:['Samarqand','Buxoro','Xiva','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan'] },
  { n:'Guliston', d:[] }, { n:'Jizzax', d:[] }, { n:'Angren', d:[] },
  { n:'Andijon', d:['Toshkent','Samarqand','Buxoro','Xiva','Urganch','Navoiy','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan'] },
  { n:'Namangan', d:[] }, { n:'Margilon', d:[] }, { n:"Qo'qon", d:[] }, { n:'Pop', d:[] },
  { n:'Samarqand', d:['Toshkent','Buxoro','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan','Xiva'] },
  { n:'Buxoro', d:['Toshkent','Samarqand','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Xiva'] },
  { n:'Navoiy', d:['Toshkent','Samarqand','Buxoro','Urganch','Nukus'] },
  { n:'Qarshi', d:['Toshkent','Samarqand','Termiz'] },
  { n:'Nukus', d:['Toshkent','Samarqand','Buxoro','Navoiy'] },
  { n:'Urganch', d:['Toshkent','Samarqand','Buxoro'] },
  { n:'Xiva', d:['Toshkent','Samarqand','Buxoro','Andijon',"Qo'qon",'Urganch'] },
]

const TRAIN_API = 'https://eticket.railway.uz/api/v3/handbook/trains/list'
const HOME_URL = 'https://eticket.railway.uz/en/home'

// Step 1: Get session cookies from homepage
async function getSession() {
  try {
    const res = await fetch(HOME_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    })
    const cookies = res.headers.getSetCookie?.() || []
    // Fallback for environments where getSetCookie isn't available
    const cookieHeader = res.headers.get('set-cookie') || ''
    
    let allCookies = []
    if (cookies.length > 0) {
      allCookies = cookies
    } else if (cookieHeader) {
      allCookies = cookieHeader.split(/,(?=\s*\w+=)/)
    }
    
    const cookieMap = {}
    for (const c of allCookies) {
      const match = c.match(/^([^=]+)=([^;]+)/)
      if (match) cookieMap[match[1].trim()] = match[2].trim()
    }
    
    const xsrf = cookieMap['XSRF-TOKEN'] || ''
    const jsession = cookieMap['JSESSIONID'] || ''
    
    // Build cookie string
    const cookieParts = []
    for (const [k, v] of Object.entries(cookieMap)) {
      cookieParts.push(`${k}=${v}`)
    }
    
    return { cookieStr: cookieParts.join('; '), xsrf, jsession, ok: !!xsrf }
  } catch (err) {
    console.error('Session error:', err.message)
    return { cookieStr: '', xsrf: '', jsession: '', ok: false }
  }
}

// Step 2: Fetch trains for a specific route and date
async function fetchTrains(session, depCode, arvCode, date) {
  try {
    const res = await fetch(TRAIN_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'uz',
        'Content-Type': 'application/json',
        'Cookie': session.cookieStr,
        'X-XSRF-TOKEN': session.xsrf,
        'Origin': 'https://eticket.railway.uz',
        'Referer': 'https://eticket.railway.uz/en/home',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        directions: {
          forward: { date, depStationCode: depCode, arvStationCode: arvCode }
        }
      }),
    })
    
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('json')) {
      console.error(`Non-JSON response for ${depCode}->${arvCode}: ${contentType}`)
      return []
    }
    
    const json = await res.json()
    const trains = json?.data?.directions?.forward?.trains || []
    return trains
  } catch (err) {
    console.error(`Fetch error ${depCode}->${arvCode}:`, err.message)
    return []
  }
}

// Classify train type
function classifyTrain(train) {
  const type = (train.type || '').toLowerCase()
  const name = (train.name || '').toLowerCase()
  if (type.includes('afrosiyob') || name.includes('afrosiyob')) return 'afrosiyob'
  if (type.includes('sharq') || name.includes('sharq')) return 'sharq'
  if (type.includes('nasaf') || type.includes('tezkor') || name.includes('nasaf')) return 'tezkor'
  return 'yolovchi'
}

// Get next 7 dates starting from today
function getNext7Days() {
  const days = []
  const uzDays = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba']
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i)
    const dow = (d.getDay() + 6) % 7
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const dd = String(d.getDate()).padStart(2,'0')
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      dayOfWeek: dow,
      labelEn: d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),
      labelUz: `${uzDays[dow]}, ${d.getDate()}-${d.toLocaleDateString('uz',{month:'short'})}`,
    })
  }
  return days
}

// Unique route pairs that need fetching (deduplicated)
function getUniqueRoutes() {
  const set = new Set()
  const routes = []
  for (const hub of HUBS_ORDER) {
    for (const dest of hub.d) {
      const key = `${hub.n}|${dest}`
      if (!set.has(key) && STATIONS[hub.n] && STATIONS[dest]) {
        set.add(key)
        routes.push({ from: hub.n, to: dest, depCode: STATIONS[hub.n], arvCode: STATIONS[dest] })
      }
    }
  }
  return routes
}

// Main: Fetch all routes for all 7 days
async function fetchAllLive() {
  const days = getNext7Days()
  const routes = getUniqueRoutes()
  
  console.log(`Fetching session...`)
  const session = await getSession()
  if (!session.ok) {
    console.error('Failed to get session. XSRF:', session.xsrf)
    return { days, routeData: null, error: 'Session failed' }
  }
  console.log(`Session OK. XSRF: ${session.xsrf.substring(0,8)}...`)
  
  // routeData[routeKey][dayIndex] = { total, afrosiyob, sharq, tezkor, yolovchi }
  const routeData = {}
  
  // We need to batch requests to avoid overwhelming the API
  // Fetch each route for each day
  let fetched = 0
  const total = routes.length * days.length
  
  for (const route of routes) {
    const key = `${route.from}|${route.to}`
    routeData[key] = []
    
    for (let di = 0; di < days.length; di++) {
      const trains = await fetchTrains(session, route.depCode, route.arvCode, days[di].date)
      
      let a = 0, s = 0, t = 0, y = 0
      for (const tr of trains) {
        const cls = classifyTrain(tr)
        if (cls === 'afrosiyob') a++
        else if (cls === 'sharq') s++
        else if (cls === 'tezkor') t++
        else y++
      }
      
      routeData[key].push({ total: trains.length, afrosiyob: a, sharq: s, tezkor: t, yolovchi: y })
      fetched++
      
      // Small delay to be nice to the API (50ms between requests)
      if (fetched < total) await new Promise(r => setTimeout(r, 50))
    }
  }
  
  return { days, routeData, error: null, fetched }
}

// Build final hub-grouped structure
function buildFromLive(days, routeData) {
  let idx = 0
  const hubGroups = []
  const seen = new Set()
  
  for (const hub of HUBS_ORDER) {
    if (seen.has(hub.n)) continue; seen.add(hub.n); idx++
    
    const routes = hub.d.map(dest => {
      const key = `${hub.n}|${dest}`
      const perDay = routeData[key] || days.map(() => ({ total:0, afrosiyob:0, sharq:0, tezkor:0, yolovchi:0 }))
      const weekly = { total:0, afrosiyob:0, sharq:0, tezkor:0, yolovchi:0 }
      perDay.forEach(p => { weekly.total+=p.total; weekly.afrosiyob+=p.afrosiyob; weekly.sharq+=p.sharq; weekly.tezkor+=p.tezkor; weekly.yolovchi+=p.yolovchi })
      return { from:hub.n, to:dest, routeName:`${hub.n}-${dest}`, weekly, perDay }
    })
    
    const hw = { total:0, afrosiyob:0, sharq:0, tezkor:0, yolovchi:0 }
    routes.forEach(r => { hw.total+=r.weekly.total; hw.afrosiyob+=r.weekly.afrosiyob; hw.sharq+=r.weekly.sharq; hw.tezkor+=r.weekly.tezkor; hw.yolovchi+=r.weekly.yolovchi })
    hubGroups.push({ index:idx, hub:hub.n, hubWeekly:hw, routes })
  }
  
  return hubGroups
}

export const maxDuration = 60

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const fmt = searchParams.get('format')
  const debug = searchParams.get('debug')
  
  // Fetch live data
  const { days, routeData, error, fetched } = await fetchAllLive()
  
  if (error || !routeData) {
    return Response.json({ error: error || 'Failed to fetch', days }, { status: 500 })
  }
  
  const hubGroups = buildFromLive(days, routeData)
  
  if (fmt === 'csv') {
    let csv = `T/p,Vokzallar,Yo'nalish nomi,Haftalik jami,shundan Afrosiyob`
    for (const d of days) csv += `,${d.labelEn} - Jami,${d.labelEn} - Afrosiyob`
    csv += '\n'
    for (const hub of hubGroups) {
      if (hub.routes.length === 0) {
        csv += `${hub.index},${hub.hub},,${hub.hubWeekly.total},${hub.hubWeekly.afrosiyob}`
        for (let i=0;i<days.length;i++) csv += ',,'
        csv += '\n'
      } else {
        const mid = Math.floor(hub.routes.length/2)
        hub.routes.forEach((r,i) => {
          csv += `${i===mid?hub.index:''},${i===mid?hub.hub:''},${r.routeName},${r.weekly.total},${r.weekly.afrosiyob}`
          r.perDay.forEach(p => { csv += `,${p.total},${p.afrosiyob}` })
          csv += '\n'
        })
      }
    }
    return new Response(csv, { headers: { 'Content-Type':'text/csv;charset=utf-8', 'Content-Disposition':`attachment;filename="rail-intel-${new Date().toISOString().split('T')[0]}.csv"` } })
  }
  
  // Flat routes for stats
  const flatRoutes = []
  for (const hub of hubGroups)
    for (const r of hub.routes)
      flatRoutes.push({ from:r.from, to:r.to, ...r.weekly, perDay:r.perDay })
  
  const result = { days, hubGroups, routes:flatRoutes, fetchedAt:new Date().toISOString(), source:'live', requestsMade:fetched }
  
  if (debug) {
    result.debug = { routeData, stationCodes: STATIONS }
  }
  
  return Response.json(result)
}
