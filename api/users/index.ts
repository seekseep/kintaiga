import { db } from '../_lib/db.ts'
import { users } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (_req, _user) => {
  const result = await db.select().from(users)
  return Response.json(result)
})

export const POST = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id, name, role } = await req.json() as { id?: string; name?: string; role?: 'admin' | 'general' }
  if (!id || !name) return Response.json({ error: 'id and name are required' }, { status: 400 })
  const [created] = await db.insert(users).values({ id, name, role: role ?? 'general' }).returning()
  return Response.json(created, { status: 201 })
})
