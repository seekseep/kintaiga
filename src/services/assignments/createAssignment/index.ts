import { z } from 'zod/v4'
import { assignments } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const CreateAssignmentParametersSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.string().optional(),
  targetMinutes: z.number().int().min(0).optional(),
})

export type CreateAssignmentInput = z.input<typeof CreateAssignmentParametersSchema>
export type CreateAssignmentParameters = z.output<typeof CreateAssignmentParametersSchema>

export async function createAssignment(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: CreateAssignmentInput,
) {
  const result = CreateAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const values = {
    projectId: parameters.projectId,
    userId: parameters.userId,
    ...(parameters.startedAt ? { startedAt: new Date(parameters.startedAt) } : {}),
    ...(parameters.targetMinutes != null ? { targetMinutes: parameters.targetMinutes } : {}),
  }
  const [created] = await db.insert(assignments).values(values).returning()
  return created
}
