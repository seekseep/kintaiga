import { z } from 'zod/v4'
import { projects } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export const CreateOrganizationProjectParametersSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
})

export type CreateOrganizationProjectInput = z.input<typeof CreateOrganizationProjectParametersSchema>
export type CreateOrganizationProjectParameters = z.output<typeof CreateOrganizationProjectParametersSchema>

export async function createOrganizationProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: CreateOrganizationProjectInput,
) {
  const result = CreateOrganizationProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationProjects(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [created] = await db.insert(projects).values({
    ...parameters,
    organizationId: executor.organization.id,
  }).returning()
  return created
}
