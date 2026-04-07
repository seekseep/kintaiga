import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getOrganizationByName, updateOrganization, deleteOrganization } from '@/services/organization'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { organizationName } = await context.params
  const organization = await getOrganizationByName({ db }, organizationName)
  return Response.json({
    organizationId: executor.organization.id,
    organizationDisplayName: organization.displayName ?? '',
    organizationRole: executor.organization.role,
    organizationPlan: executor.organization.plan,
  })
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const updated = await updateOrganization({ db }, executor, body)
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor) => {
  const deleted = await deleteOrganization({ db }, executor)
  return Response.json(deleted)
}))
