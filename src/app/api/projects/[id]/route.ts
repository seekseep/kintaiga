import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { projects } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { NotFoundError } from '@/lib/api-server/errors'
import { UpdateProjectParametersSchema } from '@db/validation'

export const GET = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const project = await db.select().from(projects).where(eq(projects.id, id)).then(r => r[0])
  if (!project) throw new NotFoundError()
  return Response.json(project)
})

export const PATCH = withAuth(async (req, _user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateProjectParametersSchema)
  const [updated] = await db.update(projects)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  if (!updated) throw new NotFoundError()
  return Response.json(updated)
}, { roles: ['admin'] })

export const DELETE = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
