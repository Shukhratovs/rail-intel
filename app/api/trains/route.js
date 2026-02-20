// app/api/trains/route.js
// Fetches live train data from eticket.railway.uz for a given route + date range (7 days)

const RAILWAY_API = 'https://eticket.railway.uz/api/v1'

const TRACKED_ROUTES = [
  { from: 'Toshkent', to: 'Samarqand' }, { from: 'Toshkent', to: 'Buxoro' },
  { from: 'Toshkent', to: 'Xiva' },      { from: 'Toshkent', to: 'Urganch' },
  { from: 'Toshkent', to: 'Nukus' },     { from: 'Toshkent', to: 'Navoiy' },
  { from: 'Toshkent', to: 'Andijon' },   { from: 'Toshkent', to: 'Qarshi' },
  { from: 'Toshkent', to: 'Jizzax' },    { from: 'Toshkent', to: 'Termiz' },
  { from: 'Toshkent', to: 'Namangan' },  { from: 'Toshkent', to: "Qo'qon" },
  { from: 'Toshkent', to: 'Margilon' },  { from: 'Toshkent', to: 'Guliston' },
  { from: 'Samarqand', to: 'Toshkent' }, { from: 'Samarqand', to: 'Buxoro' },
  { from: 'Samarqand', to: 'Navoiy' },   { from: 'Samarqand', to: 'Andijon' },
  { from: 'Samarqand', to: 'Qarshi' },   { from: 'Samarqand', to: 'Termiz' },
  { from: 'Buxoro', to: 'Toshkent' },    { from: 'Buxoro', to: 'Samarqand' },
  { from: 'Buxoro', to: 'Navoiy' },      { from: 'Buxoro', to: 'Andijon' },
  { from: 'Buxoro', to: 'Termiz' },      { from: 'Buxoro', to: 'Urganch' },
  { from: 'Andijon', to: 'Toshkent' },   { from: 'Andijon', to: 'Samarqand' },
  { from: 'Andijon', to: 'Buxoro' },     { from: 'Andijon', to: 'Navoiy' },
  { from: 'Andijon', to: 'Qarshi' },     { from: 'Andijon', to: 'Termiz' },
  { from: 'Namangan', to: 'Toshkent' },  { from: 'Namangan', to: 'Samarqand' },
  { from: 'Namangan', to: 'Andijon' },
]

function classifyTrain(name = '') {
  const n = name.toLowerCase()
  if (n.includes('afrosiyob')) return 'afrosiyob'
  if (n.includes('sharq'))     return 'sharq'
  if (n.includes('tezkor'))    return 'tezkor'
  return 'yolovchi'
}

async function fetchRoute(from, to) {
  const counts = { total: 0, afrosiyob: 0, sharq: 0, tezkor: 0, yolovchi: 0 }
  const today = new Date()

  for (let day = 0; day < 7; day++) {
    const d = new Date(today)
    d.setDate(d.getDate() + day)
    const dateStr = d.toISOString().split('T')[0]

    try {
      const res = await fetch(`${RAILWAY_API}/trains/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, date: dateStr }),
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const trains = data.trains || data.data || data.list || []
      trains.forEach(t => {
        counts.total++
        counts[classifyTrain(t.name || t.trainName || '')]++
      })
    } catch { /* skip failed days */ }
  }
  return counts
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Single route fetch
  if (from && to) {
    const counts = await fetchRoute(from, to)
    return Response.json({ from, to, ...counts })
  }

  // All routes — fetch in parallel batches of 5 to avoid hammering the API
  const results = []
  for (let i = 0; i < TRACKED_ROUTES.length; i += 5) {
    const batch = TRACKED_ROUTES.slice(i, i + 5)
    const batchResults = await Promise.all(
      batch.map(async r => {
        const counts = await fetchRoute(r.from, r.to)
        return { from_station: r.from, to_station: r.to, ...counts }
      })
    )
    results.push(...batchResults)
  }

  return Response.json({ routes: results, fetchedAt: new Date().toISOString() })
}
