import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { prepare: false })

async function main() {
  await sql.unsafe(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    DROP SCHEMA IF EXISTS drizzle CASCADE;
  `)
  console.log('Database reset complete')
  await sql.end()
}

main().catch(async (err) => {
  console.error('Error:', err)
  await sql.end()
  process.exit(1)
})
