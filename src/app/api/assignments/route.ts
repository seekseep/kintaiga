import { eq, and, count, isNull, isNotNull, type SQL } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { assignments } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateAssignmentParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'

export const GET = withAuth(async (req, _user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const projectId = url.searchParams.get('projectId')
  const userId = url.searchParams.get('userId')
  const active = url.searchParams.get('active')

  const conditions: SQL[] = []
  if (projectId) conditions.push(eq(assignments.projectId, projectId))
  if (userId) conditions.push(eq(assignments.userId, userId))
  if (active === 'true') conditions.push(isNull(assignments.endedAt))
  if (active === 'false') conditions.push(isNotNull(assignments.endedAt))

  const where = conditions.length ? and(...conditions) : undefined

  const [items, [{ total }]] = await Promise.all([
    db.select().from(assignments).where(where).limit(limit).offset(offset),
    db.select({ total: count() }).from(assignments).where(where),
  ])

  return Response.json(paginatedResponse(items, total, { limit, offset }))
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateAssignmentParametersSchema)
  const values = {
    projectId: parsed.projectId,
    userId: parsed.userId,
    ...(parsed.startedAt ? { startedAt: new Date(parsed.startedAt) } : {}),
  }
  const [created] = await db.insert(assignments).values(values).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
