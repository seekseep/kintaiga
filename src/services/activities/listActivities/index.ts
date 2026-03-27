import { z } from 'zod/v4'
import { eq, and, isNull, count as countFn, desc, gte, lte, type SQL } from 'drizzle-orm'
import { activities, projects, users } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { isAdminUser } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const ListActivitiesParametersSchema = z.object({
  userId: z.string().optional(),
  ongoing: z.boolean().optional(),
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListActivitiesInput = z.input<typeof ListActivitiesParametersSchema>
export type ListActivitiesParameters = z.output<typeof ListActivitiesParametersSchema>

export async function listActivities(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: ListActivitiesInput,
) {
  const result = ListActivitiesParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const conditions: SQL[] = []

  if (!isAdminUser(executor)) {
    conditions.push(eq(activities.userId, executor.id))
  } else if (parameters.userId) {
    conditions.push(eq(activities.userId, parameters.userId))
  }

  if (parameters.ongoing) {
    conditions.push(isNull(activities.endedAt))
  }

  if (parameters.projectId) {
    conditions.push(eq(activities.projectId, parameters.projectId))
  }

  if (parameters.startDate) {
    conditions.push(gte(activities.startedAt, new Date(parameters.startDate)))
  }

  if (parameters.endDate) {
    conditions.push(lte(activities.startedAt, new Date(parameters.endDate)))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const [items, [{ count }]] = await Promise.all([
    db
      .select({
        id: activities.id,
        userId: activities.userId,
        projectId: activities.projectId,
        startedAt: activities.startedAt,
        endedAt: activities.endedAt,
        note: activities.note,
        createdAt: activities.createdAt,
        updatedAt: activities.updatedAt,
        projectName: projects.name,
        userName: users.name,
      })
      .from(activities)
      .leftJoin(projects, eq(activities.projectId, projects.id))
      .leftJoin(users, eq(activities.userId, users.id))
      .where(where)
      .orderBy(desc(activities.startedAt))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db
      .select({ count: countFn() })
      .from(activities)
      .where(where),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
