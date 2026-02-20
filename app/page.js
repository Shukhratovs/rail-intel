import Dashboard from '../components/Dashboard'
import sql from '../lib/db'

// Revalidate every hour
export const revalidate = 3600

async function getRouteData() {
  try {
    // Get most recent week
    const [latest] = await sql`
      SELECT week_start FROM route_snapshots ORDER BY week_start DESC LIMIT 1
    `
    if (!latest) return { routes: [], weekStart: null }

    const rows = await sql`
      SELECT * FROM route_snapshots
      WHERE week_start = ${latest.week_start}
      ORDER BY from_station, total_count DESC
    `

    const [lastSync] = await sql`
      SELECT * FROM sync_logs WHERE status = 'success' ORDER BY finished_at DESC LIMIT 1
    `

    return {
      routes: rows,
      weekStart: latest.week_start,
      lastSync: lastSync?.finished_at || null
    }
  } catch (err) {
    console.error('Failed to fetch route data:', err)
    return { routes: [], weekStart: null, lastSync: null, error: err.message }
  }
}

export default async function Page() {
  const data = await getRouteData()
  return <Dashboard initialData={data} />
}
