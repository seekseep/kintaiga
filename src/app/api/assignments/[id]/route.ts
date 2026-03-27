import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { assignments } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateAssignmentParametersSchema } from '@db/validation'
import { NotFoundError } from '@/lib/api-server/errors'

export const GET = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const assignment = await db.select().from(assignments).where(eq(assignments.id, id)).then(r => r[0])
  if (!assignment) throw new NotFoundError()
  return Response.json(assignment)
})

export const PATCH = withAuth(async (req, _user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateAssignmentParametersSchema)
  const values: Record<string, unknown> = {}
  if (parsed.endedAt !== undefined) {
    values.endedAt = parsed.endedAt ? new Date(parsed.endedAt) : null
  }
  const [updated] = await db.update(assignments).set(values).where(eq(assignments.id, id)).returning()
  if (!updated) throw new NotFoundError()
  return Response.json(updated)
}, { roles: ['admin'] })

export const DELETE = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const [deleted] = await db.delete(assignments).where(eq(assignments.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
