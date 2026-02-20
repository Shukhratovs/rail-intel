// Run with: node lib/db-init.js
// This creates the database tables in your Neon instance

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function init() {
  console.log('🗄  Initializing Neon database...')

  await sql`
    CREATE TABLE IF NOT EXISTS route_snapshots (
      id          SERIAL PRIMARY KEY,
      from_station TEXT NOT NULL,
      to_station   TEXT NOT NULL,
      total_count  INT  NOT NULL DEFAULT 0,
      afrosiyob    INT  NOT NULL DEFAULT 0,
      sharq        INT  NOT NULL DEFAULT 0,
      tezkor       INT  NOT NULL DEFAULT 0,
      yolovchi     INT  NOT NULL DEFAULT 0,
      week_start   DATE NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_route_week
      ON route_snapshots (from_station, to_station, week_start)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id         SERIAL PRIMARY KEY,
      status     TEXT NOT NULL,
      routes_fetched INT,
      error_msg  TEXT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ
    )
  `

  console.log('✅ Tables created: route_snapshots, sync_logs')
  process.exit(0)
}

init().catch(err => { console.error('❌ Error:', err); process.exit(1) })
