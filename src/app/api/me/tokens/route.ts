import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { createUserToken, listUserTokens } from '@/services/user/tokens'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const result = await listUserTokens({ db }, executor, { userId: executor.user.id })
  return Response.json(result)
}))

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const created = await createUserToken({ db }, executor, {
    ...body,
    userId: executor.user.id,
  })
  return Response.json(created, { status: 201 })
}))
