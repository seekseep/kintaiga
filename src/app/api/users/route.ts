import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateUserParametersSchema } from '@db/validation'

export const GET = withAuth(async (_req, _user) => {
  const result = await db.select().from(users)
  return Response.json(result)
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateUserParametersSchema)
  const [created] = await db.insert(users).values(parsed).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
