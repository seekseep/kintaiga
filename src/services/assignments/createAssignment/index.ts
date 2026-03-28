import { z } from 'zod/v4'
import { assignments } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const CreateAssignmentParametersSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.iso.datetime({ local: true }),
  endedAt: z.iso.datetime({ local: true }).nullable().default(null),
  targetMinutes: z.number().int().min(0).optional(),
})

export type CreateAssignmentInput = z.input<typeof CreateAssignmentParametersSchema>
export type CreateAssignmentParameters = z.output<typeof CreateAssignmentParametersSchema>

export async function createAssignment(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: CreateAssignmentInput,
) {
  const result = CreateAssignmentParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (!isOrganizationManagerOrAbove(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null

  const [created] = await db.insert(assignments).values({
    projectId: parameters.projectId,
    userId: parameters.userId,
    startedAt: new Date(parameters.startedAt),
    endedAt,
    targetMinutes: parameters.targetMinutes,
  }).returning()
  return created
}
