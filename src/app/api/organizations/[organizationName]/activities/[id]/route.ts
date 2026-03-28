import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getActivity, updateActivity, deleteActivity } from '@/services/activities'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const activity = await getActivity({ db }, executor, { id })
  return Response.json(activity)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateActivity({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  await deleteActivity({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
