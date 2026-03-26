import { db } from '../_lib/db.ts'
import { projects } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (_req, _user) => {
  const result = await db.select().from(projects)
  return Response.json(result)
})

export const POST = withAuth(async (req, user) => {
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { name, description } = await req.json() as { name?: string; description?: string }
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })
  const [created] = await db.insert(projects).values({ name, description }).returning()
  return Response.json(created, { status: 201 })
})
