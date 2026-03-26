import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { assignments } from '@db/schema.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { NotFoundError } from '@api/_lib/errors.ts'

export const GET = withAuth(async (req, _user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const assignment = await db.select().from(assignments).where(eq(assignments.id, id)).then(r => r[0])
  if (!assignment) throw new NotFoundError()
  return Response.json(assignment)
})

export const DELETE = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(assignments).where(eq(assignments.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
