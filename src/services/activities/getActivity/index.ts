import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { activities, projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivityInOrganization } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const GetActivityParametersSchema = z.object({
  id: z.string(),
})

export type GetActivityInput = z.input<typeof GetActivityParametersSchema>
export type GetActivityParameters = z.output<typeof GetActivityParametersSchema>

export async function getActivity(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetActivityInput,
) {
  const result = GetActivityParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [activity] = await db
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
  if (!activity) throw new NotFoundError()

    if (!canControlActivityInOrganization(executor, activity)) throw new ForbiddenError()

  return activity
}
