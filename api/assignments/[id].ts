import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { assignments } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (req, _user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const assignment = await db.select().from(assignments).where(eq(assignments.id, id)).then(r => r[0])
  if (!assignment) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(assignment)
})

export const DELETE = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(assignments).where(eq(assignments.id, id)).returning()
  if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 })
  return new Response(null, { status: 204 })
})
