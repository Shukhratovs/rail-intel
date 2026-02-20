import { NextResponse } from 'next/server'

const BASE = 'https://eticket.railway.uz'

function buildHeaders() {
  const cookie = process.env.RAILWAY_COOKIE || ''
  const xsrf = process.env.RAILWAY_XSRF || ''

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0',
    'Origin': 'https://eticket.railway.uz',
    'Referer': 'https://eticket.railway.uz/',
    'X-Requested-With': 'XMLHttpRequest',
    ...(cookie ? { cookie } : {}),
    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    ...(xsrf ? { 'X-CSRF-TOKEN': xsrf } : {}),
  }
}

async function railwayPost(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    cache: 'no-store'
  })

  const text = await res.text()

  try {
    return {
      ok: res.ok,
      status: res.status,
      json: JSON.parse(text),
      raw: null
    }
  } catch {
    return {
      ok: false,
      status: res.status,
      json: null,
      raw: text.slice(0, 500)
    }
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const debug = searchParams.get('debug')

  const today = new Date().toISOString().split('T')[0]

  // Example route (you can later loop through many routes)
  const stations = await railwayPost('/api/v1/stations/list', {})

  const trains = await railwayPost('/api/v1/trains/list', {
    from: 'Toshkent',
    to: 'Samarqand',
    date: today
  })

  if (debug) {
    return NextResponse.json({
      stations,
      trains,
      date: today,
      usingCookie: !!process.env.RAILWAY_COOKIE,
      usingXSRF: !!process.env.RAILWAY_XSRF
    })
  }

  if (!trains.ok || !trains.json) {
    return NextResponse.json({ routes: [] })
  }

  const routes = trains.json?.data || []

  return NextResponse.json({ routes })
}