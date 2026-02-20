// app/api/trains/route.js
// Fetches live train data from eticket.railway.uz using the v3 API

const RAILWAY_API = 'https://eticket.railway.uz/api/v3'

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

// Train type classification
function classifyTrain(train) {
  const type = (train.type || train.name || train.trainName || '').toLowerCase()
  const number = (train.number || train.trainNumber || '').toLowerCase()
  const combined = `${type} ${number}`

  if (combined.includes('afrosiyob') || combined.includes('afrosiab')) return 'afrosiyob'
  if (combined.includes('sharq'))    return 'sharq'
  if (combined.includes('tezkor'))   return 'tezkor'
  return 'yolovchi'
}

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'uz',
  'Cache-Control': 'no-cache',
  'Origin': 'https://eticket.railway.uz',
  'Referer': 'https://eticket.railway.uz/',
}

// Resolve station name to numeric station code
async function getStationCode(name) {
  // Try multiple endpoint + payload combinations
  const attempts = [
    { url: `${RAILWAY_API}/handbook/stations/search`, body: { query: name } },
    { url: `${RAILWAY_API}/handbook/stations/search`, body: { name } },
    { url: `${RAILWAY_API}/handbook/stations/list`, body: { query: name } },
    { url: `${RAILWAY_API}/handbook/stations/list`, body: { name } },
    { url: 'https://eticket.railway.uz/api/v2/handbook/stations/search', body: { query: name } },
    { url: 'https://eticket.railway.uz/api/v1/handbook/stations/list', body: { name } },
  ]

  for (const { url, body } of attempts) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const data = await res.json()

      // Normalize response to array of stations
      const stations = data?.data?.stations || data?.data?.list || data?.data ||
                      data?.stations || data?.list || data?.items ||
                      (Array.isArray(data) ? data : [])

      if (!Array.isArray(stations) || stations.length === 0) continue

      const match = stations.find(s => {
        const sName = (s.name || s.nameUz || s.nameRu || s.title || '').toLowerCase()
        return sName.includes(name.toLowerCase()) || name.toLowerCase().includes(sName)
      })

      const code = match?.code || match?.stationCode || match?.id || match?.stationId || match?.nodeId
      if (code) return String(code)
    } catch { continue }
  }
  return null
}

// Fetch train data for one route across next 7 days
async function fetchRoute(depCode, arvCode, fromName, toName) {
  const counts = { total: 0, afrosiyob: 0, sharq: 0, tezkor: 0, yolovchi: 0 }
  const today = new Date()

  for (let day = 0; day < 7; day++) {
    const d = new Date(today)
    d.setDate(d.getDate() + day)
    const dateStr = d.toISOString().split('T')[0]

    const attempts = []

    // Primary: v3 directions format (as used by the actual eticket.railway.uz website)
    if (depCode && arvCode) {
      attempts.push({
        url: `${RAILWAY_API}/handbook/trains/list`,
        body: {
          directions: {
            forward: {
              date: dateStr,
              depStationCode: depCode,
              arvStationCode: arvCode,
            }
          }
        }
      })
    }

    // Fallback: v1 flat format
    attempts.push(
      { url: 'https://eticket.railway.uz/api/v1/trains/list', body: { from: fromName, to: toName, date: dateStr } },
      { url: 'https://eticket.railway.uz/api/v1/trains/list', body: { fromId: depCode, toId: arvCode, date: dateStr } },
    )

    for (const { url, body } of attempts) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) continue
        const data = await res.json()

        // v3 response: data.directions.forward.trains
        // v1 response: data.trains or data.data etc.
        const trains = data?.data?.directions?.forward?.trains ||
                      data?.directions?.forward?.trains ||
                      data?.data?.trains ||
                      data?.trains ||
                      data?.data?.list ||
                      data?.list ||
                      data?.items ||
                      []

        if (Array.isArray(trains) && trains.length > 0) {
          trains.forEach(t => {
            counts.total++
            counts[classifyTrain(t)]++
          })
          break
        }
      } catch { continue }
    }
  }
  return counts
}

// Station code cache
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

  if (debug) {
    const today = new Date().toISOString().split('T')[0]
    const results = {}

    // Try station search
    const stationAttempts = [
      { url: `${RAILWAY_API}/handbook/stations/search`, body: { query: 'Toshkent' } },
      { url: `${RAILWAY_API}/handbook/stations/list`, body: { name: 'Toshkent' } },
      { url: 'https://eticket.railway.uz/api/v1/handbook/stations/list', body: { name: 'Toshkent' } },
    ]

    for (const { url, body } of stationAttempts) {
      try {
        const res = await fetch(url, { method: 'POST', headers: HEADERS, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
        results[`stations_${url}`] = { status: res.status, data: await res.json() }
      } catch (e) {
        results[`stations_${url}`] = { error: e.message }
      }
    }

    // Resolve codes
    const toshkentCode = await getCode('Toshkent')
    const samarqandCode = await getCode('Samarqand')
    results.resolvedCodes = { Toshkent: toshkentCode, Samarqand: samarqandCode }

    // Try trains list
    const trainAttempts = [
      {
        label: 'v3_with_codes',
        url: `${RAILWAY_API}/handbook/trains/list`,
        body: { directions: { forward: { date: today, depStationCode: toshkentCode || '2900000', arvStationCode: samarqandCode || '2900680' } } }
      },
      {
        label: 'v3_hardcoded',
        url: `${RAILWAY_API}/handbook/trains/list`,
        body: { directions: { forward: { date: today, depStationCode: '2900000', arvStationCode: '2900680' } } }
      },
      {
        label: 'v1_names',
        url: 'https://eticket.railway.uz/api/v1/trains/list',
        body: { from: 'Toshkent', to: 'Samarqand', date: today }
      },
    ]

    for (const { label, url, body } of trainAttempts) {
      try {
        const res = await fetch(url, { method: 'POST', headers: HEADERS, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
        results[`trains_${label}`] = { status: res.status, body, data: await res.json() }
      } catch (e) {
        results[`trains_${label}`] = { error: e.message, body }
      }
    }

    return Response.json({ debug: true, date: today, stationCache: { ...stationCache }, results })
  }

  // --- Main endpoint: fetch all routes ---

  // Pre-resolve all station codes
  const uniqueStations = [...new Set(TRACKED_ROUTES.flatMap(r => [r.from, r.to]))]
  await Promise.all(uniqueStations.map(s => getCode(s)))

  // Fetch routes in batches of 5
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

  return Response.json({
    routes: results,
    fetchedAt: new Date().toISOString(),
    stationCodes: { ...stationCache },
  })
}
