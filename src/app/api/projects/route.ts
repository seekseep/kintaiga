import { db } from '@/lib/api-server/db'
import { projects } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateProjectParametersSchema } from '@db/validation'

export const GET = withAuth(async (_req, _user) => {
  const result = await db.select().from(projects)
  return Response.json(result)
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateProjectParametersSchema)
  const [created] = await db.insert(projects).values(parsed).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
