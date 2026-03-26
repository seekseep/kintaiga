import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { assignments } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateAssignmentParametersSchema } from '@db/validation'

export const GET = withAuth(async (req, _user) => {
  const url = new URL(req.url)
  const projectId = url.searchParams.get('projectId')
  const userId = url.searchParams.get('userId')

  let query = db.select().from(assignments).$dynamic()
  if (projectId) query = query.where(eq(assignments.projectId, projectId))
  if (userId) query = query.where(eq(assignments.userId, userId))

  const result = await query
  return Response.json(result)
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateAssignmentParametersSchema)
  const [created] = await db.insert(assignments).values(parsed).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
