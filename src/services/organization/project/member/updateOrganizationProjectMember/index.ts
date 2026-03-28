import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

export const UpdateOrganizationProjectMemberParametersSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})

export type UpdateOrganizationProjectMemberInput = z.input<typeof UpdateOrganizationProjectMemberParametersSchema>
export type UpdateOrganizationProjectMemberParameters = z.output<typeof UpdateOrganizationProjectMemberParametersSchema>

export async function updateOrganizationProjectMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationProjectMemberInput,
) {
  const result = UpdateOrganizationProjectMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const values: Record<string, unknown> = {}
  if (parameters.startedAt !== undefined) {
    values.startedAt = new Date(parameters.startedAt)
  }
  if (parameters.endedAt !== undefined) {
    values.endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null
  }
  if (parameters.targetMinutes !== undefined) {
    values.targetMinutes = parameters.targetMinutes
  }
  const [updated] = await db.update(projectAssignments).set(values).where(eq(projectAssignments.id, parameters.id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
