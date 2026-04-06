import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { listMyTokens, createMyToken } from '@/services/me'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const result = await listMyTokens({ db }, executor)
  return Response.json(result)
}))

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const created = await createMyToken({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
