import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import {
  getOrganizationProjectMember,
  updateOrganizationProjectMember,
  removeOrganizationProjectMember,
} from '@/services/organization/project/member'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  const result = await getOrganizationProjectMember({ db }, executor, { id: memberId })
  return Response.json(result)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { memberId } = await context.params
  const body = await req.json()
  const updated = await updateOrganizationProjectMember({ db }, executor, { id: memberId, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  await removeOrganizationProjectMember({ db }, executor, { id: memberId })
  return new Response(null, { status: 204 })
}))
