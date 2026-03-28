import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const UpdateAssignmentParametersSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})

export type UpdateAssignmentInput = z.input<typeof UpdateAssignmentParametersSchema>
export type UpdateAssignmentParameters = z.output<typeof UpdateAssignmentParametersSchema>

export async function updateAssignment(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateAssignmentInput,
) {
  const result = UpdateAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isOrganizationManagerOrAbove(executor)) throw new ForbiddenError()
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
  const [updated] = await db.update(assignments).set(values).where(eq(assignments.id, parameters.id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
