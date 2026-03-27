import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getProfile, createProfile, updateProfile } from '@/services/me'

export const GET = withErrorHandler(withAuth(async (_req, executor) => {
  const profile = await getProfile({ db }, executor)
  return Response.json(profile)
}, { allowUnregistered: true }))

export const POST = withErrorHandler(withAuth(async (req, executor, sub) => {
  const body = await req.json()
  const created = await createProfile({ db }, executor, { sub, ...body })
  return Response.json(created, { status: 201 })
}, { allowUnregistered: true }))

export const PATCH = withErrorHandler(withAuth(async (req, executor) => {
  const body = await req.json()
  const updated = await updateProfile({ db }, executor, body)
  return Response.json(updated)
}))
