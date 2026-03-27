import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { listProjectMembers } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const result = await listProjectMembers({ db }, { type: 'user', user }, { projectId: id })
  return Response.json(result)
}))
