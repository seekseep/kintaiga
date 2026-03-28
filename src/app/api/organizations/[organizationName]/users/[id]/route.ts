import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getUser, updateUser, archiveAndDeleteUser } from '@/services/user'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const target = await getUser({ db }, executor, { id })
  return Response.json(target)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateUser({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  await archiveAndDeleteUser({ db, supabase }, executor, { targetId: id })
  return new Response(null, { status: 204 })
}))
