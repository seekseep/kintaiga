import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { activities, assignments } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const CreateActivityParametersSchema = z.object({
  projectId: z.string(),
  userId: z.string().optional(),
  startedAt: z.iso.datetime({ local: true }).default(() => new Date().toISOString()),
  endedAt: z.iso.datetime({ local: true }).nullable().default(null),
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
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const targetUserId = (isAdminUser(executor) && parameters.userId) ? parameters.userId : executor.id

  const assignmentRows = await db.select().from(assignments)
    .where(and(
      eq(assignments.projectId, parameters.projectId),
      eq(assignments.userId, targetUserId),
    ))
  const assignment = assignmentRows[0]

  if (!assignment) {
    throw new ForbiddenError('User is not assigned to this project')
  }

  const endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null
  const [created] = await db.insert(activities).values({
    userId: targetUserId,
    projectId: parameters.projectId,
    startedAt: new Date(parameters.startedAt),
    endedAt: endedAt,
    note: parameters.note,
  }).returning()

  return created
}
