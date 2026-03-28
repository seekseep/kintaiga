import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export const UpdateOrganizationProjectParametersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
})

export type UpdateOrganizationProjectInput = z.input<typeof UpdateOrganizationProjectParametersSchema>
export type UpdateOrganizationProjectParameters = z.output<typeof UpdateOrganizationProjectParametersSchema>

export async function updateOrganizationProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationProjectInput,
) {
  const result = UpdateOrganizationProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationProjects(executor)) throw new ForbiddenError()
  const { id, ...updates } = result.data

  const { db } = dependencies
  const [updated] = await db.update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.organizationId, executor.organization.id)))
    .returning()
  if (!updated) throw new NotFoundError()
  return updated
}
