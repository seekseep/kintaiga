import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import { createClient, type User } from '@supabase/supabase-js'
import { users } from '../db/schema'



const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function listAllAuthUsers(): Promise<User[]> {
  const all: User[] = []
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    all.push(...data.users)
    if (data.users.length < perPage) break
    page += 1
  }
  return all
}

async function main() {
  console.log('=== Sync user emails ===\n')

  const authUsers = await listAllAuthUsers()
  console.log(`Found ${authUsers.length} auth users.`)

  const dbUsers = await db.select({ id: users.id, email: users.email }).from(users)
  const dbUserMap = new Map(dbUsers.map((u) => [u.id, u]))
  console.log(`Found ${dbUsers.length} db users.\n`)

  let updated = 0
  let skipped = 0
  let missing = 0

  for (const authUser of authUsers) {
    const dbUser = dbUserMap.get(authUser.id)
    if (!dbUser) {
      missing += 1
      continue
    }
    const email = authUser.email ?? null
    if (dbUser.email === email) {
      skipped += 1
      continue
    }
    await db.update(users)
      .set({ email, updatedAt: new Date() })
      .where(eq(users.id, authUser.id))
    console.log(`  Updated ${authUser.id}: ${dbUser.email ?? '(null)'} -> ${email ?? '(null)'}`)
    updated += 1
  }

  console.log(`\nUpdated: ${updated}`)
  console.log(`Skipped (already in sync): ${skipped}`)
  console.log(`Missing in DB (auth only): ${missing}`)
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
