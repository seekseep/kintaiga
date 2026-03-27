import { eq, count } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { assignments, projects } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'

export const GET = withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(assignments)
      .innerJoin(projects, eq(assignments.projectId, projects.id))
      .where(eq(assignments.userId, user.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(assignments)
      .where(eq(assignments.userId, user.id)),
  ])

  return Response.json(paginatedResponse(items, total, { limit, offset }))
})
