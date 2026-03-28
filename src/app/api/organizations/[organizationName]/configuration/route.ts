import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getConfiguration, updateConfiguration } from '@/services/organization-configuration'

export const GET = withErrorHandler(withOrganization(async (_req, executor) => {
  const config = await getConfiguration({ db }, executor)
  return Response.json(config)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const updated = await updateConfiguration({ db }, executor, body)
  return Response.json(updated)
}))
