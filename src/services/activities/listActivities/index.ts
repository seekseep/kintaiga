import { z } from 'zod/v4'
import { eq, and, isNull, count, desc, gte, lte, type SQL } from 'drizzle-orm'
import { activities, projects, users } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import { isAdmin } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const ListActivitiesParametersSchema = z.object({
  userId: z.string().optional(),
  ongoing: z.boolean().optional(),
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number(),
  offset: z.number(),
})

export type ListActivitiesInput = z.input<typeof ListActivitiesParametersSchema>
export type ListActivitiesParameters = z.output<typeof ListActivitiesParametersSchema>

export async function listActivities(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: ListActivitiesInput,
) {
  const result = ListActivitiesParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor
  const conditions: SQL[] = []

  if (!isAdmin(user.role)) {
    conditions.push(eq(activities.userId, user.id))
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

  const [items, [{ total }]] = await Promise.all([
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
      .select({ total: count() })
      .from(activities)
      .where(where),
  ])

  return { items, total }
}
