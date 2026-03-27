import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { activities } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
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
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [activity] = await db.select().from(activities).where(eq(activities.id, parameters.id))
  if (!activity) throw new NotFoundError()
  if (!canControlActivity(executor, activity)) throw new ForbiddenError()

  await db.delete(activities).where(eq(activities.id, parameters.id))
}
