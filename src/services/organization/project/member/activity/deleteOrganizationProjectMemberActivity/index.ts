import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectActivities } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivityInOrganization } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../../types'

const DeleteOrganizationProjectMemberActivityParametersSchema = z.object({
  id: z.string(),
})

export type DeleteOrganizationProjectMemberActivityInput = z.input<typeof DeleteOrganizationProjectMemberActivityParametersSchema>
export type DeleteOrganizationProjectMemberActivityParameters = z.output<typeof DeleteOrganizationProjectMemberActivityParametersSchema>

export async function deleteOrganizationProjectMemberActivity(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: DeleteOrganizationProjectMemberActivityInput,
) {
  const result = DeleteOrganizationProjectMemberActivityParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [activity] = await db.select().from(projectActivities).where(eq(projectActivities.id, parameters.id))
  if (!activity) throw new NotFoundError()
  if (!canControlActivityInOrganization(executor, activity)) throw new ForbiddenError()

  await db.delete(projectActivities).where(eq(projectActivities.id, parameters.id))
}
