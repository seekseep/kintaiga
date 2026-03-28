import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateOrganizationMemberRole, removeOrganizationMember } from '@/services/organization'

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { userId } = await context.params
  const body = await req.json()
  const updated = await updateOrganizationMemberRole({ db }, executor, { userId, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { userId } = await context.params
  await removeOrganizationMember({ db }, executor, { userId })
  return new Response(null, { status: 204 })
}))
