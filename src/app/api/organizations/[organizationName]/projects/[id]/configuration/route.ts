import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getProjectConfiguration } from '@/services/projects'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const config = await getProjectConfiguration({ db }, executor, { id })
  return Response.json(config)
}))
