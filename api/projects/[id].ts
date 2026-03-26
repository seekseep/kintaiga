import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { projects } from '../../db/schema.ts'
import { withAuth } from '../_lib/auth.ts'

export const GET = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const project = await db.select().from(projects).where(eq(projects.id, id)).then(r => r[0])
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(project)
})

export const PATCH = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).pathname.split('/').pop()!
  const { name, description } = await req.json() as { name?: string; description?: string }
  const [updated] = await db.update(projects)
    .set({ name, description, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(updated)
})

export const DELETE = withAuth(async (req, user) => {
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning()
  if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 })
  return new Response(null, { status: 204 })
})
