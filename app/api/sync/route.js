// /app/api/sync/route.js
// Called automatically every Monday at 06:00 by Vercel Cron
// Also callable manually: POST /api/sync with Authorization: Bearer YOUR_CRON_SECRET

import sql from '../../../lib/db'
import { TRACKED_ROUTES, fetchRouteWeek } from '../../../lib/railway'

export const maxDuration = 300 // 5 min timeout — needed for many API calls

export async function POST(request) {
  // Verify the request is from Vercel Cron or an authorized admin
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the Monday of the current week
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const weekStart = monday.toISOString().split('T')[0]

  // Log sync start
  const [log] = await sql`
    INSERT INTO sync_logs (status, started_at)
    VALUES ('running', NOW())
    RETURNING id
  `

  console.log(`🚂 Starting sync for week of ${weekStart} — ${TRACKED_ROUTES.length} routes`)

  try {
    let fetched = 0
    const errors = []

    for (const route of TRACKED_ROUTES) {
      try {
        const counts = await fetchRouteWeek(route.from, route.to, weekStart)

        // Upsert — if this week's data exists already, update it
        await sql`
          INSERT INTO route_snapshots
            (from_station, to_station, total_count, afrosiyob, sharq, tezkor, yolovchi, week_start)
          VALUES
            (${route.from}, ${route.to}, ${counts.total}, ${counts.afrosiyob},
             ${counts.sharq}, ${counts.tezkor}, ${counts.yolovchi}, ${weekStart})
          ON CONFLICT DO NOTHING
        `

        fetched++
        console.log(`  ✅ ${route.from} → ${route.to}: ${counts.total} trains`)
      } catch (err) {
        errors.push(`${route.from}→${route.to}: ${err.message}`)
      }
    }

    // Mark sync complete
    await sql`
      UPDATE sync_logs
      SET status = 'success', routes_fetched = ${fetched}, finished_at = NOW()
      WHERE id = ${log.id}
    `

    return Response.json({
      success: true,
      weekStart,
      routesFetched: fetched,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (err) {
    await sql`
      UPDATE sync_logs
      SET status = 'error', error_msg = ${err.message}, finished_at = NOW()
      WHERE id = ${log.id}
    `
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// GET — for health check
export async function GET() {
  const [lastSync] = await sql`
    SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 1
  `
  return Response.json({ lastSync: lastSync || null })
}
