import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectActivities, projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivityInOrganization } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../../types'

const GetOrganizationProjectMemberActivityParametersSchema = z.object({
  id: z.string(),
})

export type GetOrganizationProjectMemberActivityInput = z.input<typeof GetOrganizationProjectMemberActivityParametersSchema>
export type GetOrganizationProjectMemberActivityParameters = z.output<typeof GetOrganizationProjectMemberActivityParametersSchema>

export async function getOrganizationProjectMemberActivity(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetOrganizationProjectMemberActivityInput,
) {
  const result = GetOrganizationProjectMemberActivityParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [activity] = await db
    .select({
      id: projectActivities.id,
      userId: projectActivities.userId,
      projectId: projectActivities.projectId,
      startedAt: projectActivities.startedAt,
      endedAt: projectActivities.endedAt,
      note: projectActivities.note,
      createdAt: projectActivities.createdAt,
      updatedAt: projectActivities.updatedAt,
      projectName: projects.name,
    })
    .from(projectActivities)
    .leftJoin(projects, eq(projectActivities.projectId, projects.id))
    .where(eq(projectActivities.id, parameters.id))
  if (!activity) throw new NotFoundError()

    if (!canControlActivityInOrganization(executor, activity)) throw new ForbiddenError()

  return activity
}
