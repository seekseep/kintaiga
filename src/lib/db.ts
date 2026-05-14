import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@db/schema'
import * as relations from '@db/relations'

const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql }

const client = globalForDb.pgClient ?? postgres(process.env.DATABASE_URL!, { prepare: false })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client
}

export const db = drizzle(client, { schema: { ...schema, ...relations } })
