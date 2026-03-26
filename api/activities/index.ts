import { eq, and, type SQL } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { activities } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

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
  const { type, startedAt, endedAt, note } = await req.json() as { type?: string; startedAt?: string; endedAt?: string; note?: string }
  if (!type || !startedAt) return Response.json({ error: 'type and startedAt are required' }, { status: 400 })
  const [created] = await db.insert(activities).values({
    userId: user.id,
    type,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    note,
  }).returning()
  return Response.json(created, { status: 201 })
})
