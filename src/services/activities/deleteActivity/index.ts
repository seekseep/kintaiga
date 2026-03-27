import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { activities } from '@db/schema'
import { InternalError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivity } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const DeleteActivityParametersSchema = z.object({
  id: z.string(),
})

export type DeleteActivityInput = z.input<typeof DeleteActivityParametersSchema>
export type DeleteActivityParameters = z.output<typeof DeleteActivityParametersSchema>

export async function deleteActivity(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: DeleteActivityInput,
) {
  const result = DeleteActivityParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor
  const activityRows = await db.select().from(activities).where(eq(activities.id, parameters.id))
  const activity = activityRows[0]
  if (!activity) throw new NotFoundError()
  if (!canControlActivity(user.role, user.id, activity.userId)) throw new ForbiddenError()
  await db.delete(activities).where(eq(activities.id, parameters.id))
}
