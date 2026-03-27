import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateUserParametersSchema } from '@db/validation'
import { getUser, updateUser, archiveAndDeleteUser } from '@/services/users'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const target = await getUser({ db }, { type: 'user', user }, { id })
  return Response.json(target)
}))

export const PATCH = withErrorHandler(withAuth(async (req, user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateUserParametersSchema)
  const updated = await updateUser({ db }, { type: 'user', user }, { id, ...parsed })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  await archiveAndDeleteUser({ db, supabase }, { type: 'user', user }, { targetId: id })
  return new Response(null, { status: 204 })
}, { roles: ['admin'] }))
