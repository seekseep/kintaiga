import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { activities } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (req, user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const activity = await db.select().from(activities).where(eq(activities.id, id)).then(r => r[0])
  if (!activity) return Response.json({ error: 'Not found' }, { status: 404 })
  if (user.role !== 'admin' && activity.userId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return Response.json(activity)
})

export const PATCH = withAuth(async (req, user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const activity = await db.select().from(activities).where(eq(activities.id, id)).then(r => r[0])
  if (!activity) return Response.json({ error: 'Not found' }, { status: 404 })
  if (user.role !== 'admin' && activity.userId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as { type?: string; startedAt?: string; endedAt?: string | null; note?: string }
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.type !== undefined) updates.type = body.type
  if (body.startedAt !== undefined) updates.startedAt = new Date(body.startedAt)
  if (body.endedAt !== undefined) updates.endedAt = body.endedAt ? new Date(body.endedAt) : null
  if (body.note !== undefined) updates.note = body.note

  const [updated] = await db.update(activities).set(updates).where(eq(activities.id, id)).returning()
  return Response.json(updated)
})

export const DELETE = withAuth(async (req, user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const activity = await db.select().from(activities).where(eq(activities.id, id)).then(r => r[0])
  if (!activity) return Response.json({ error: 'Not found' }, { status: 404 })
  if (user.role !== 'admin' && activity.userId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  await db.delete(activities).where(eq(activities.id, id))
  return new Response(null, { status: 204 })
})
