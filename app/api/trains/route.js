import { NextResponse } from 'next/server'

const BASE = 'https://eticket.railway.uz'

async function bootstrapSession() {
  const res = await fetch(BASE, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
    },
    cache: 'no-store'
  })

  const cookies = res.headers.get('set-cookie') || ''
  const text = await res.text()

  let csrf = null

  // Try meta tag
  const metaMatch = text.match(/name="csrf-token"\s+content="([^"]+)"/i)
  if (metaMatch) csrf = metaMatch[1]

  // Try XSRF-TOKEN cookie
  const cookieMatch = cookies.match(/XSRF-TOKEN=([^;]+)/)
  if (!csrf && cookieMatch) csrf = decodeURIComponent(cookieMatch[1])

  return { cookies, csrf }
}

async function railwayFetch(url, body) {
  const { cookies, csrf } = await bootstrapSession()

  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'X-Requested-With': 'XMLHttpRequest',
      ...(cookies ? { cookie: cookies } : {}),
      ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
      ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}),
    },
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
  const debug = new URL(req.url).searchParams.get('debug')

  const today = new Date().toISOString().split('T')[0]

  const stations = await railwayFetch('/api/v1/stations/list', {})
  const trains = await railwayFetch('/api/v1/trains/list', {
    from: 'Toshkent',
    to: 'Samarqand',
    date: today
  })

  if (debug) {
    return NextResponse.json({
      stations,
      trains,
      date: today
    })
  }

  if (!trains.ok || !trains.json) {
    return NextResponse.json({ routes: [] })
  }

  const routes = trains.json?.data || []

  return NextResponse.json({ routes })
}