import { count } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { projects } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateProjectParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'

export const GET = withAuth(async (req, _user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)

  const [items, [{ total }]] = await Promise.all([
    db.select().from(projects).limit(limit).offset(offset),
    db.select({ total: count() }).from(projects),
  ])

  return Response.json(paginatedResponse(items, total, { limit, offset }))
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateProjectParametersSchema)
  const [created] = await db.insert(projects).values(parsed).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
