import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { exportOrganization } from '@/services/organization'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { organizationName } = await context.params
  const payload = await exportOrganization({ db }, executor)
  const date = new Date().toISOString().slice(0, 10)
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${organizationName}-${date}.json"`,
    },
  })
}))
