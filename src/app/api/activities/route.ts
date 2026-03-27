import { eq, and, isNull, count, desc, gte, lte, type SQL } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { activities, assignments, projects, users } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { BadRequestError, ForbiddenError } from '@/lib/api-server/errors'
import { CreateActivityParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'

export const GET = withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const conditions: SQL[] = []

  if (user.role !== 'admin') {
    conditions.push(eq(activities.userId, user.id))
  } else if (url.searchParams.get('userId')) {
    conditions.push(eq(activities.userId, url.searchParams.get('userId')!))
  }

  if (url.searchParams.get('ongoing') === 'true') {
    conditions.push(isNull(activities.endedAt))
  }

  if (url.searchParams.get('projectId')) {
    conditions.push(eq(activities.projectId, url.searchParams.get('projectId')!))
  }

  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  if (startDate) {
    conditions.push(gte(activities.startedAt, new Date(startDate)))
  }
  if (endDate) {
    conditions.push(lte(activities.startedAt, new Date(endDate)))
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
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(activities)
      .where(where),
  ])

  return Response.json(paginatedResponse(items, total, { limit, offset }))
})

export const POST = withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateActivityParametersSchema)

  // 管理者は別ユーザーの稼働を作成可能
  const targetUserId = (user.role === 'admin' && parsed.userId) ? parsed.userId : user.id

  // ユーザーがプロジェクトにアサインされているか検証
  const assignment = await db.select().from(assignments)
    .where(and(
      eq(assignments.projectId, parsed.projectId),
      eq(assignments.userId, targetUserId),
    ))
    .then(r => r[0])

  if (!assignment) {
    throw new ForbiddenError('User is not assigned to this project')
  }

  const startedAt = parsed.startedAt ? new Date(parsed.startedAt) : new Date()

  if (isNaN(startedAt.getTime())) {
    throw new BadRequestError('Invalid startedAt')
  }

  const [created] = await db.insert(activities).values({
    userId: targetUserId,
    projectId: parsed.projectId,
    startedAt,
    note: parsed.note,
  }).returning()

  return Response.json(created, { status: 201 })
})
