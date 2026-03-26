import { db } from '@api/_lib/db.ts'
import { users } from '@db/schema.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { parseBody } from '@api/_lib/parse.ts'
import { CreateUserParametersSchema } from '@db/validation.ts'

export const GET = withAuth(async (_req, _user) => {
  const result = await db.select().from(users)
  return Response.json(result)
})

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, CreateUserParametersSchema)
  const [created] = await db.insert(users).values(parsed).returning()
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
