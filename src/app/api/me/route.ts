import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { NotFoundError, ConflictError } from '@/lib/api-server/errors'
import { CreateProfileParametersSchema, UpdateProfileParametersSchema } from '@db/validation'

export const GET = withAuth(async (_req, user) => {
  if (!user) throw new NotFoundError()
  return Response.json(user)
}, { allowUnregistered: true })

export const POST = withAuth(async (req, user, sub) => {
  if (user) throw new ConflictError('Already registered')
  const parsed = await parseBody(req, CreateProfileParametersSchema)
  const [created] = await db.insert(users).values({ id: sub, name: parsed.name }).returning()
  return Response.json(created, { status: 201 })
}, { allowUnregistered: true })

export const PATCH = withAuth(async (req, user) => {
  const parsed = await parseBody(req, UpdateProfileParametersSchema)
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parsed.name !== undefined) updates.name = parsed.name
  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning()
  return Response.json(updated)
})
