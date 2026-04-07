import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { checkOrganizationName } from '@/services/organization'

export const GET = withErrorHandler(withUser(async (req) => {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') ?? ''
  const result = await checkOrganizationName({ db }, name)
  return Response.json(result)
}))
