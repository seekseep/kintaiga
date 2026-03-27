import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const DeleteAssignmentParametersSchema = z.object({
  id: z.string(),
})

export type DeleteAssignmentInput = z.input<typeof DeleteAssignmentParametersSchema>
export type DeleteAssignmentParameters = z.output<typeof DeleteAssignmentParametersSchema>

export async function deleteAssignment(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: DeleteAssignmentInput,
) {
  const result = DeleteAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(assignments).where(eq(assignments.id, parameters.id)).returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
