import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const GetAssignmentParametersSchema = z.object({
  id: z.string(),
})

export type GetAssignmentInput = z.input<typeof GetAssignmentParametersSchema>
export type GetAssignmentParameters = z.output<typeof GetAssignmentParametersSchema>

export async function getAssignment(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: GetAssignmentInput,
) {
  const result = GetAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const assignmentRows = await db.select().from(assignments).where(eq(assignments.id, parameters.id))
  const assignment = assignmentRows[0]
  if (!assignment) throw new NotFoundError()
  return assignment
}
