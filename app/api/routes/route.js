// /app/api/routes/route.js
// Returns route snapshot data for the dashboard

import sql from '../../../lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const week = searchParams.get('week') // YYYY-MM-DD format

  try {
    // Get the most recent week if none specified
    let weekStart = week
    if (!weekStart) {
      const [latest] = await sql`
        SELECT week_start FROM route_snapshots ORDER BY week_start DESC LIMIT 1
      `
      weekStart = latest?.week_start || null
    }

    if (!weekStart) {
      // No data yet — return empty
      return Response.json({ routes: [], weekStart: null, message: 'No data yet. Trigger /api/sync to populate.' })
    }

    // Build dynamic query
    let rows
    if (from && to) {
      rows = await sql`
        SELECT * FROM route_snapshots
        WHERE week_start = ${weekStart} AND from_station = ${from} AND to_station = ${to}
        ORDER BY total_count DESC
      `
    } else if (from) {
      rows = await sql`
        SELECT * FROM route_snapshots
        WHERE week_start = ${weekStart} AND from_station = ${from}
        ORDER BY total_count DESC
      `
    } else {
      rows = await sql`
        SELECT * FROM route_snapshots
        WHERE week_start = ${weekStart}
        ORDER BY from_station, total_count DESC
      `
    }

    // Also get available weeks for the date picker
    const weeks = await sql`
      SELECT DISTINCT week_start FROM route_snapshots ORDER BY week_start DESC LIMIT 12
    `

    return Response.json({
      routes: rows,
      weekStart,
      availableWeeks: weeks.map(w => w.week_start)
    })

  } catch (err) {
    console.error('DB error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
