import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getOrganizationProjectMember, updateOrganizationProjectMember, removeOrganizationProjectMember } from '@/services/organization/project/member'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const projectMember = await getOrganizationProjectMember({ db }, executor, { id })
  return Response.json(projectMember)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateOrganizationProjectMember({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  await removeOrganizationProjectMember({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
