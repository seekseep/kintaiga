import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getOrganizationProjectConfiguration, updateOrganizationProjectConfiguration } from '@/services/organization/project'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const config = await getOrganizationProjectConfiguration({ db }, executor, { id })
  return Response.json(config)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const config = await updateOrganizationProjectConfiguration({ db }, executor, { id, ...body })
  return Response.json(config)
}))
