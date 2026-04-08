import { z } from 'zod/v4'
import { eq, and, isNull, count as countFn, desc, gte, lte, inArray, type SQL } from 'drizzle-orm'
import { projectActivities, projects, users } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { canActAsOrganizationManager, canViewMemberActivitiesInOrganization } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const ListOrganizationActivitiesParametersSchema = z.object({
  userId: z.string().optional(),
  ongoing: z.boolean().optional(),
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListOrganizationActivitiesInput = z.input<typeof ListOrganizationActivitiesParametersSchema>
export type ListOrganizationActivitiesParameters = z.output<typeof ListOrganizationActivitiesParametersSchema>

export async function listOrganizationActivities(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: ListOrganizationActivitiesInput,
) {
  const result = ListOrganizationActivitiesParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const conditions: SQL[] = []

  // 組織内のプロジェクトに限定
  const organizationProjects = db.select({ id: projects.id }).from(projects)
    .where(eq(projects.organizationId, executor.organization.id))
  conditions.push(inArray(projectActivities.projectId, organizationProjects))

  const targetUserId = parameters.userId ?? (canActAsOrganizationManager(executor) ? null : executor.user.id)
  if (targetUserId !== null) {
    if (!canViewMemberActivitiesInOrganization(executor, targetUserId)) {
      throw new ForbiddenError('他のメンバーの稼働は取得できません')
    }
    conditions.push(eq(projectActivities.userId, targetUserId))
  }

  if (parameters.ongoing) {
    conditions.push(isNull(projectActivities.endedAt))
  }

  if (parameters.projectId) {
    conditions.push(eq(projectActivities.projectId, parameters.projectId))
  }

  if (parameters.startDate) {
    conditions.push(gte(projectActivities.startedAt, new Date(parameters.startDate)))
  }

  if (parameters.endDate) {
    conditions.push(lte(projectActivities.startedAt, new Date(parameters.endDate)))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const [items, [{ count }]] = await Promise.all([
    db
      .select({
        id: projectActivities.id,
        userId: projectActivities.userId,
        projectId: projectActivities.projectId,
        startedAt: projectActivities.startedAt,
        endedAt: projectActivities.endedAt,
        note: projectActivities.note,
        createdAt: projectActivities.createdAt,
        updatedAt: projectActivities.updatedAt,
        projectName: projects.name,
        userName: users.name,
      })
      .from(projectActivities)
      .leftJoin(projects, eq(projectActivities.projectId, projects.id))
      .leftJoin(users, eq(projectActivities.userId, users.id))
      .where(where)
      .orderBy(desc(projectActivities.startedAt))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db
      .select({ count: countFn() })
      .from(projectActivities)
      .where(where),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
