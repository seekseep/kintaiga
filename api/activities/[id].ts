import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { activities } from '@db/schema.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { parseBody } from '@api/_lib/parse.ts'
import { NotFoundError, ForbiddenError } from '@api/_lib/errors.ts'
import { UpdateActivityParametersSchema } from '@db/validation.ts'

async function findActivity(req: Request) {
  const id = new URL(req.url).pathname.split('/').pop()!
  const activity = await db.select().from(activities).where(eq(activities.id, id)).then(r => r[0])
  if (!activity) throw new NotFoundError()
  return activity
}

export const GET = withAuth(async (req, user) => {
  const activity = await findActivity(req)
  if (user.role !== 'admin' && activity.userId !== user.id) throw new ForbiddenError()
  return Response.json(activity)
})

export const PATCH = withAuth(async (req, user) => {
  const activity = await findActivity(req)
  if (user.role !== 'admin' && activity.userId !== user.id) throw new ForbiddenError()

  const parsed = await parseBody(req, UpdateActivityParametersSchema)

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parsed.type !== undefined) updates.type = parsed.type
  if (parsed.startedAt !== undefined) updates.startedAt = new Date(parsed.startedAt)
  if (parsed.endedAt !== undefined) updates.endedAt = parsed.endedAt ? new Date(parsed.endedAt) : null
  if (parsed.note !== undefined) updates.note = parsed.note

  const [updated] = await db.update(activities).set(updates).where(eq(activities.id, activity.id)).returning()
  return Response.json(updated)
})

export const DELETE = withAuth(async (req, user) => {
  const activity = await findActivity(req)
  if (user.role !== 'admin' && activity.userId !== user.id) throw new ForbiddenError()
  await db.delete(activities).where(eq(activities.id, activity.id))
  return new Response(null, { status: 204 })
})
