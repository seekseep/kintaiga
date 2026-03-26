import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { users } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (req, _user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const target = await db.select().from(users).where(eq(users.id, id)).then(r => r[0])
  if (!target) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(target)
})

export const PATCH = withAuth(async (req, user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const isOwn = user.id === id
  if (user.role !== 'admin' && !isOwn) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json() as { name?: string; role?: 'admin' | 'general' }
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name

  if (body.role !== undefined) {
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
    updates.role = body.role
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(updated)
})

export const DELETE = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
  if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 })
  return new Response(null, { status: 204 })
})
