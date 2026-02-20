import { neon } from '@neondatabase/serverless'

// Single shared SQL client — works in both Node.js and Edge runtimes
const sql = neon(process.env.DATABASE_URL)

export default sql
