import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../../db/schema.ts'
import * as relations from '../../db/relations.ts'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema: { ...schema, ...relations } })
