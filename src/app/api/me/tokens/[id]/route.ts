import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { revokeUserToken } from '@/services/user/tokens'
import type { RouteContext } from '@/lib/api-server/middlewares/with-user'

export const DELETE = withErrorHandler(withUser(async (_req, executor, context: RouteContext) => {
  const { id } = await context.params
  await revokeUserToken({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
