import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const UpdateAssignmentParametersSchema = z.object({
  id: z.string(),
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})

export type UpdateAssignmentInput = z.input<typeof UpdateAssignmentParametersSchema>
export type UpdateAssignmentParameters = z.output<typeof UpdateAssignmentParametersSchema>

export async function updateAssignment(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: UpdateAssignmentInput,
) {
  const result = UpdateAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const values: Record<string, unknown> = {}
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
