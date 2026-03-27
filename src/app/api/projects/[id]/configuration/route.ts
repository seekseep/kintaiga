import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getProjectConfiguration } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const config = await getProjectConfiguration({ db }, { type: 'user', user }, { id })
  return Response.json(config)
}))
