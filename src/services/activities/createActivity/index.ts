import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { activities, assignments, projects } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

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
  executor: OrganizationExecutor,
  input: CreateActivityInput,
) {
  const result = CreateActivityParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  // プロジェクトが組織に属するか確認
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, parameters.projectId), eq(projects.organizationId, executor.organization.id)))
    .limit(1)
  if (!project) throw new ForbiddenError('Project not found in this organization')

  const targetUserId = (isOrganizationManagerOrAbove(executor) && parameters.userId) ? parameters.userId : executor.user.id

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
