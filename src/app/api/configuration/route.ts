import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { configurations } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { NotFoundError } from '@/lib/api-server/errors'
import { UpdateConfigurationParametersSchema } from '@db/validation'

export const GET = withAuth(async () => {
  let config = await db.select().from(configurations).limit(1).then(r => r[0])
  if (!config) {
    const [created] = await db.insert(configurations).values({}).returning()
    config = created
  }
  return Response.json(config)
})

export const PATCH = withAuth(async (req) => {
  const parsed = await parseBody(req, UpdateConfigurationParametersSchema)
  const config = await db.select().from(configurations).limit(1).then(r => r[0])
  if (!config) throw new NotFoundError()
  const [updated] = await db.update(configurations)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(configurations.id, config.id))
    .returning()
  return Response.json(updated)
}, { roles: ['admin'] })
