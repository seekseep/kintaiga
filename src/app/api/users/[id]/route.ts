import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getUser, updateUser, archiveAndDeleteUser } from '@/services/users'

export const GET = withErrorHandler(withAuth(async (_req, executor, context) => {
  const { id } = await context.params
  const target = await getUser({ db }, executor, { id })
  return Response.json(target)
}))

export const PATCH = withErrorHandler(withAuth(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateUser({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withAuth(async (_req, executor, context) => {
  const { id } = await context.params
  await archiveAndDeleteUser({ db, supabase }, executor, { targetId: id })
  return new Response(null, { status: 204 })
}))
