import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { CreateProfileParametersSchema, UpdateProfileParametersSchema } from '@db/validation'
import { getProfile, createProfile, updateProfile } from '@/services/me'

export const GET = withErrorHandler(withAuth(async (_req, user) => {
  const executor = user ? { type: 'user' as const, user } : null
  const profile = getProfile(executor)
  return Response.json(profile)
}, { allowUnregistered: true }))

export const POST = withErrorHandler(withAuth(async (req, user, sub) => {
  const parsed = await parseBody(req, CreateProfileParametersSchema)
  const executor = user ? { type: 'user' as const, user } : null
  const created = await createProfile({ db }, executor, { sub, ...parsed })
  return Response.json(created, { status: 201 })
}, { allowUnregistered: true }))

export const PATCH = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, UpdateProfileParametersSchema)
  const updated = await updateProfile({ db }, { type: 'user', user }, parsed)
  return Response.json(updated)
}))
