import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { projects } from '@db/schema.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { parseBody } from '@api/_lib/parse.ts'
import { NotFoundError } from '@api/_lib/errors.ts'
import { UpdateProjectParametersSchema } from '@db/validation.ts'

export const GET = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const project = await db.select().from(projects).where(eq(projects.id, id)).then(r => r[0])
  if (!project) throw new NotFoundError()
  return Response.json(project)
})

export const PATCH = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const parsed = await parseBody(req, UpdateProjectParametersSchema)
  const [updated] = await db.update(projects)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  if (!updated) throw new NotFoundError()
  return Response.json(updated)
}, { roles: ['admin'] })

export const DELETE = withAuth(async (req) => {
  const id = new URL(req.url).pathname.split('/').pop()!
  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning()
  if (!deleted) throw new NotFoundError()
  return new Response(null, { status: 204 })
}, { roles: ['admin'] })
