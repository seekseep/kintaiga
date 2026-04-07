import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { listMyOrganizations } from '@/services/me'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const result = await listMyOrganizations({ db }, executor)
  return Response.json(result)
}))
