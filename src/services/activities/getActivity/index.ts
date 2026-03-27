import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { activities, projects } from '@db/schema'
import { InternalError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivity } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const GetActivityParametersSchema = z.object({
  id: z.string(),
})

export type GetActivityInput = z.input<typeof GetActivityParametersSchema>
export type GetActivityParameters = z.output<typeof GetActivityParametersSchema>

export async function getActivity(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: GetActivityInput,
) {
  const result = GetActivityParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor
  const activityRows = await db
    .select({
      id: activities.id,
      userId: activities.userId,
      projectId: activities.projectId,
      startedAt: activities.startedAt,
      endedAt: activities.endedAt,
      note: activities.note,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      projectName: projects.name,
    })
    .from(activities)
    .leftJoin(projects, eq(activities.projectId, projects.id))
    .where(eq(activities.id, parameters.id))
  const activity = activityRows[0]

  if (!activity) throw new NotFoundError()
  if (!canControlActivity(user.role, user.id, activity.userId)) throw new ForbiddenError()
  return activity
}
