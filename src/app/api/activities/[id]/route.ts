import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { activities } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { UpdateActivityParametersSchema } from '@db/validation'
import type { RouteContext } from '@/lib/api-server/auth'

async function findActivity(context: RouteContext) {
  const { id } = await context.params
  const activity = await db.select().from(activities).where(eq(activities.id, id)).then(r => r[0])
  if (!activity) throw new NotFoundError()
  return activity
}

export const GET = withAuth(async (_req, user, context) => {
  const activity = await findActivity(context)
  if (user.role !== 'admin' && activity.userId !== user.id) throw new ForbiddenError()
  return Response.json(activity)
})

export const PATCH = withAuth(async (req, user, context) => {
  const activity = await findActivity(context)
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

export const DELETE = withAuth(async (_req, user, context) => {
  const activity = await findActivity(context)
  if (user.role !== 'admin' && activity.userId !== user.id) throw new ForbiddenError()
  await db.delete(activities).where(eq(activities.id, activity.id))
  return new Response(null, { status: 204 })
})
