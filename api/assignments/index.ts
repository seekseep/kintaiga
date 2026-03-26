import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { assignments } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

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

export const POST = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { projectId, userId } = await req.json() as { projectId?: string; userId?: string }
  if (!projectId || !userId) return Response.json({ error: 'projectId and userId are required' }, { status: 400 })
  const [created] = await db.insert(assignments).values({ projectId, userId }).returning()
  return Response.json(created, { status: 201 })
})
