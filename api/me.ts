import { eq } from 'drizzle-orm'
import { db } from './_lib/db.ts'
import { users } from '../db/schema.ts'
import { withAuth } from './_lib/auth.ts'

export const GET = withAuth(async (_req, user, _sub) => {
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(user)
}, { allowUnregistered: true })

export const POST = withAuth(async (req, user, sub) => {
  if (user) return Response.json({ error: 'Already registered' }, { status: 409 })
  const { name } = await req.json() as { name?: string }
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })
  const [created] = await db.insert(users).values({ id: sub, name }).returning()
  return Response.json(created, { status: 201 })
}, { allowUnregistered: true })

export const PATCH = withAuth(async (req, user) => {
  const { name } = await req.json() as { name?: string }
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (name !== undefined) updates.name = name
  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning()
  return Response.json(updated)
})
