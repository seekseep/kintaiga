import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const DeleteOrganizationProjectParametersSchema = z.object({
  id: z.string(),
})

export type DeleteOrganizationProjectInput = z.input<typeof DeleteOrganizationProjectParametersSchema>
export type DeleteOrganizationProjectParameters = z.output<typeof DeleteOrganizationProjectParametersSchema>

export async function deleteOrganizationProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: DeleteOrganizationProjectInput,
) {
  const result = DeleteOrganizationProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationProjects(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(projects)
    .where(and(eq(projects.id, parameters.id), eq(projects.organizationId, executor.organization.id)))
    .returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
