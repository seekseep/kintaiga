import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getProfile, createProfile, updateProfile } from '@/services/me'

export const GET = withErrorHandler(withUser(async (_req, executor, _sub, _email) => {
  const profile = await getProfile({ db }, executor)
  return Response.json(profile)
}, { allowUnregistered: true }))

export const POST = withErrorHandler(withUser(async (req, executor, sub, email) => {
  const body = await req.json()
  const created = await createProfile({ db }, executor, { sub, email, ...body })
  return Response.json(created, { status: 201 })
}, { allowUnregistered: true }))

export const PATCH = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const updated = await updateProfile({ db }, executor, body)
  return Response.json(updated)
}))
