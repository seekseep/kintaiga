import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateActivityParametersSchema } from '@db/validation'
import { getActivity, updateActivity, deleteActivity } from '@/services/activities'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const activity = await getActivity({ db }, { type: 'user', user }, { id })
  return Response.json(activity)
}))

export const PATCH = withErrorHandler(withAuth(async (req, user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateActivityParametersSchema)
  const updated = await updateActivity({ db }, { type: 'user', user }, { id, ...parsed })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  await deleteActivity({ db }, { type: 'user', user }, { id })
  return new Response(null, { status: 204 })
}))
