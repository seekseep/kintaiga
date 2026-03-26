import { eq, and, type SQL } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { activities } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateActivityParametersSchema } from '@db/validation'

export const GET = withAuth(async (req, user) => {
  const url = new URL(req.url)
  const conditions: SQL[] = []

  if (user.role !== 'admin') {
    conditions.push(eq(activities.userId, user.id))
  } else if (url.searchParams.get('userId')) {
    conditions.push(eq(activities.userId, url.searchParams.get('userId')!))
  }

  const result = await db.select().from(activities)
    .where(conditions.length ? and(...conditions) : undefined)
  return Response.json(result)
})

export const POST = withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateActivityParametersSchema)
  const [created] = await db.insert(activities).values({
    userId: user.id,
    type: parsed.type,
    startedAt: new Date(parsed.startedAt),
    endedAt: parsed.endedAt ? new Date(parsed.endedAt) : null,
    note: parsed.note,
  }).returning()
  return Response.json(created, { status: 201 })
})
