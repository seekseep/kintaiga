import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { activities, assignments } from '@db/schema'
import { InternalError, ForbiddenError, BadRequestError } from '@/lib/api-server/errors'
import { isAdmin } from '@/domain/authorization'
import { isValidDateString } from '@/domain/activity-rules'
import type { DbOrTx, Executor } from '../../types'

const CreateActivityParametersSchema = z.object({
  projectId: z.string(),
  userId: z.string().optional(),
  startedAt: z.string().optional(),
  note: z.string().nullable().optional(),
})

export type CreateActivityInput = z.input<typeof CreateActivityParametersSchema>
export type CreateActivityParameters = z.output<typeof CreateActivityParametersSchema>

export async function createActivity(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: CreateActivityInput,
) {
  const result = CreateActivityParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor
  const targetUserId = (isAdmin(user.role) && parameters.userId) ? parameters.userId : user.id

  const assignmentRows = await db.select().from(assignments)
    .where(and(
      eq(assignments.projectId, parameters.projectId),
      eq(assignments.userId, targetUserId),
    ))
  const assignment = assignmentRows[0]

  if (!assignment) {
    throw new ForbiddenError('User is not assigned to this project')
  }

  const startedAt = parameters.startedAt ? new Date(parameters.startedAt) : new Date()

  if (parameters.startedAt && !isValidDateString(parameters.startedAt)) {
    throw new BadRequestError('Invalid startedAt')
  }

  const [created] = await db.insert(activities).values({
    userId: targetUserId,
    projectId: parameters.projectId,
    startedAt,
    note: parameters.note,
  }).returning()

  return created
}
