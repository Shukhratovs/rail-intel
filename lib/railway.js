// Fetches train data from eticket.railway.uz for a given route and date range

const RAILWAY_API = process.env.RAILWAY_API_URL || 'https://eticket.railway.uz/api/v1'

// All route pairs to track — mirrors the Excel sheet
export const TRACKED_ROUTES = [
  // From Toshkent
  { from: 'Toshkent', to: 'Samarqand' },
  { from: 'Toshkent', to: 'Buxoro' },
  { from: 'Toshkent', to: 'Xiva' },
  { from: 'Toshkent', to: 'Urganch' },
  { from: 'Toshkent', to: 'Nukus' },
  { from: 'Toshkent', to: 'Navoiy' },
  { from: 'Toshkent', to: 'Andijon' },
  { from: 'Toshkent', to: 'Qarshi' },
  { from: 'Toshkent', to: 'Jizzax' },
  { from: 'Toshkent', to: 'Termiz' },
  { from: 'Toshkent', to: 'Guliston' },
  { from: 'Toshkent', to: "Qo'qon" },
  { from: 'Toshkent', to: 'Margilon' },
  { from: 'Toshkent', to: "Po'lat" },
  { from: 'Toshkent', to: 'Namangan' },
  // From Samarqand
  { from: 'Samarqand', to: 'Toshkent' },
  { from: 'Samarqand', to: 'Buxoro' },
  { from: 'Samarqand', to: 'Urganch' },
  { from: 'Samarqand', to: 'Nukus' },
  { from: 'Samarqand', to: 'Navoiy' },
  { from: 'Samarqand', to: 'Andijon' },
  { from: 'Samarqand', to: 'Qarshi' },
  { from: 'Samarqand', to: 'Jizzax' },
  { from: 'Samarqand', to: 'Termiz' },
  { from: 'Samarqand', to: 'Guliston' },
  // From Buxoro
  { from: 'Buxoro', to: 'Toshkent' },
  { from: 'Buxoro', to: 'Samarqand' },
  { from: 'Buxoro', to: 'Urganch' },
  { from: 'Buxoro', to: 'Navoiy' },
  { from: 'Buxoro', to: 'Andijon' },
  { from: 'Buxoro', to: 'Jizzax' },
  { from: 'Buxoro', to: 'Termiz' },
  { from: 'Buxoro', to: 'Guliston' },
  // From Andijon
  { from: 'Andijon', to: 'Toshkent' },
  { from: 'Andijon', to: 'Samarqand' },
  { from: 'Andijon', to: 'Buxoro' },
  { from: 'Andijon', to: 'Xiva' },
  { from: 'Andijon', to: 'Urganch' },
  { from: 'Andijon', to: 'Navoiy' },
  { from: 'Andijon', to: 'Qarshi' },
  { from: 'Andijon', to: 'Jizzax' },
  { from: 'Andijon', to: 'Termiz' },
  // From Namangan
  { from: 'Namangan', to: 'Toshkent' },
  { from: 'Namangan', to: 'Samarqand' },
  { from: 'Namangan', to: 'Andijon' },
]

// Classify a train name into our categories
export function classifyTrain(trainName = '') {
  const name = trainName.toLowerCase()
  if (name.includes('afrosiyob')) return 'afrosiyob'
  if (name.includes('sharq'))     return 'sharq'
  if (name.includes('tezkor'))    return 'tezkor'
  return 'yolovchi'
}

// Fetch all trains for a single route across 7 days starting from `weekStart`
export async function fetchRouteWeek(from, to, weekStart) {
  const counts = { total: 0, afrosiyob: 0, sharq: 0, tezkor: 0, yolovchi: 0 }

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]

    try {
      const res = await fetch(`${RAILWAY_API}/trains/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, date: dateStr }),
        // 10 second timeout per request
        signal: AbortSignal.timeout(10000)
      })

      if (!res.ok) continue

      const data = await res.json()
      const trains = data.trains || data.data || data.list || []

      trains.forEach(train => {
        counts.total++
        const type = classifyTrain(train.name || train.trainName || '')
        counts[type]++
      })
    } catch (err) {
      // Log but don't crash — partial data is better than nothing
      console.warn(`⚠️  Failed ${from}→${to} on ${dateStr}:`, err.message)
    }
  }

  return counts
}
