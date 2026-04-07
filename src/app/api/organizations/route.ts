import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { createOrganization } from '@/services/organization'

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const created = await createOrganization({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
