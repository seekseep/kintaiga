import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { createUserToken, listUserTokens } from '@/services/user/tokens'

export const GET = withErrorHandler(withOrganization(async (_req, executor) => {
  const result = await listUserTokens({ db }, executor)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await createUserToken({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
