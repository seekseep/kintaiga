import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { listProjectMembers } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (_req, executor, context) => {
  const { id } = await context.params
  const result = await listProjectMembers({ db }, executor, { projectId: id })
  return Response.json(result)
}))
