// app/api/trains/route.js
// Fetches live train data from eticket.railway.uz

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

/**
 * In some environments (e.g., Vercel), eticket.railway.uz may respond with non‑JSON
 * (WAF/anti-bot HTML, plain-text errors, etc.).
 * This helper safely returns either parsed JSON or a text snippet for debugging.
 */
async function readJsonOrText(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase()
  const status = res.status
  const ok = res.ok

  // Read as text first (works for both JSON and HTML)
  const rawText = await res.text()

  // Try to parse JSON even if content-type is wrong
  let json = null
  let jsonError = null
  try {
    if (rawText && rawText.trim().length) json = JSON.parse(rawText)
  } catch (e) {
    jsonError = e?.message || String(e)
  }

  return {
    ok,
    status,
    contentType,
    json,
    jsonError,
    textSnippet: rawText?.slice(0, 600) || '',
  }
}

// Get station code from name — railway.uz uses numeric station codes
async function getStationCode(name) {
  try {
    const res = await fetch(`${RAILWAY_API}/handbook/stations/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://eticket.railway.uz',
        'Referer': 'https://eticket.railway.uz/',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ name }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const parsed = await readJsonOrText(res)
    const data = parsed.json
    if (!data) return null
    // API returns list of stations — find exact match
    const stations = data.list || data.data || data || []
    const match = stations.find(s =>
      (s.name || s.nameRu || s.nameUz || '').toLowerCase().includes(name.toLowerCase())
    )
    return match?.id || match?.code || match?.stationId || null
  } catch { return null }
}

async function fetchRoute(fromCode, toCode, fromName, toName) {
  const counts = { total: 0, afrosiyob: 0, sharq: 0, tezkor: 0, yolovchi: 0 }
  const today = new Date()

  for (let day = 0; day < 7; day++) {
    const d = new Date(today)
    d.setDate(d.getDate() + day)
    const dateStr = d.toISOString().split('T')[0]

    // Try multiple payload formats since we're reverse-engineering the API
    const payloads = [
      { from: fromCode, to: toCode, date: dateStr },
      { fromId: fromCode, toId: toCode, date: dateStr },
      { departure: fromName, destination: toName, date: dateStr },
      { from: fromName, to: toName, date: dateStr },
    ]

    for (const payload of payloads) {
      try {
        const res = await fetch(`${RAILWAY_API}/trains/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://eticket.railway.uz',
            'Referer': 'https://eticket.railway.uz/',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify(payload),
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) continue
        const parsed = await readJsonOrText(res)
        const data = parsed.json
        if (!data) continue
        const trains = data.trains || data.data || data.list || data.items || []
        if (trains.length > 0) {
          trains.forEach(t => {
            counts.total++
            counts[classifyTrain(t.name || t.trainName || t.trainNumber || '')]++
          })
          break // Found data with this payload format, stop trying others
        }
      } catch { continue }
    }
  }
  return counts
}

// Cache station codes to avoid re-fetching
const stationCache = {}

async function getCode(name) {
  if (stationCache[name] !== undefined) return stationCache[name]
  const code = await getStationCode(name)
  stationCache[name] = code
  return code
}

export const maxDuration = 300

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get('debug')

  // Debug endpoint — returns raw API response to help diagnose format
  if (debug) {
    const today = new Date().toISOString().split('T')[0]
    try {
      // First get stations list
      const stRes = await fetch(`${RAILWAY_API}/handbook/stations/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://eticket.railway.uz',
          'Referer': 'https://eticket.railway.uz/',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({ name: 'Toshkent' }),
        cache: 'no-store',
      })
      const stParsed = await readJsonOrText(stRes)

      // Then try trains list
      const trRes = await fetch(`${RAILWAY_API}/trains/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://eticket.railway.uz',
          'Referer': 'https://eticket.railway.uz/',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({ from: 'Toshkent', to: 'Samarqand', date: today }),
        cache: 'no-store',
      })
      const trParsed = await readJsonOrText(trRes)

      return Response.json({
        stations: stParsed,
        trains: trParsed,
        date: today
      })
    } catch (e) {
      return Response.json({ error: e.message })
    }
  }

  // Fetch all routes
  const results = []
  for (let i = 0; i < TRACKED_ROUTES.length; i += 5) {
    const batch = TRACKED_ROUTES.slice(i, i + 5)
    const batchResults = await Promise.all(
      batch.map(async r => {
        const fromCode = await getCode(r.from)
        const toCode = await getCode(r.to)
        const counts = await fetchRoute(fromCode, toCode, r.from, r.to)
        return { from_station: r.from, to_station: r.to, ...counts }
      })
    )
    results.push(...batchResults)
  }

  return Response.json({ routes: results, fetchedAt: new Date().toISOString() })
}