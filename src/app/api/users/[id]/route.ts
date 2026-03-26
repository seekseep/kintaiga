import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { UpdateUserParametersSchema } from '@db/validation'

export const GET = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const target = await db.select().from(users).where(eq(users.id, id)).then(r => r[0])
  if (!target) throw new NotFoundError()
  return Response.json(target)
})

export const PATCH = withAuth(async (req, user, context) => {
  const { id } = await context.params
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

export const DELETE = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
