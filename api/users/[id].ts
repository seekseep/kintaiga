import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { users } from '@db/schema.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { parseBody } from '@api/_lib/parse.ts'
import { NotFoundError, ForbiddenError } from '@api/_lib/errors.ts'
import { UpdateUserParametersSchema } from '@db/validation.ts'

export const GET = withAuth(async (req, _user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const target = await db.select().from(users).where(eq(users.id, id)).then(r => r[0])
  if (!target) throw new NotFoundError()
  return Response.json(target)
})

export const PATCH = withAuth(async (req, user) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const isOwn = user.id === id
  if (user.role !== 'admin' && !isOwn) throw new ForbiddenError()

  const parsed = await parseBody(req, UpdateUserParametersSchema)

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parsed.name !== undefined) updates.name = parsed.name

  if (parsed.role !== undefined) {
    if (user.role !== 'admin') throw new ForbiddenError()
    updates.role = parsed.role
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()
  if (!updated) throw new NotFoundError()
  return Response.json(updated)
})

export const DELETE = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
