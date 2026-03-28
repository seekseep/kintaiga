import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { deleteReport } from '@/services/reports'

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  await deleteReport({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
