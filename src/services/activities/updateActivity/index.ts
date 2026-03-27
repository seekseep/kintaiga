import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { activities } from '@db/schema'
import { InternalError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivity } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const UpdateActivityParametersSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})

export type UpdateActivityInput = z.input<typeof UpdateActivityParametersSchema>
export type UpdateActivityParameters = z.output<typeof UpdateActivityParametersSchema>

export async function updateActivity(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: UpdateActivityInput,
) {
  const result = UpdateActivityParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor
  const activityRows = await db.select().from(activities).where(eq(activities.id, parameters.id))
  const activity = activityRows[0]
  if (!activity) throw new NotFoundError()
  if (!canControlActivity(user.role, user.id, activity.userId)) throw new ForbiddenError()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parameters.startedAt !== undefined) updates.startedAt = new Date(parameters.startedAt)
  if (parameters.endedAt !== undefined) updates.endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null
  if (parameters.note !== undefined) updates.note = parameters.note

  const [updated] = await db.update(activities).set(updates).where(eq(activities.id, parameters.id)).returning()
  return updated
}
