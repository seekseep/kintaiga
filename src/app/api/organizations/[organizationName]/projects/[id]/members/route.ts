import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { listOrganizationProjectMembers } from '@/services/organization/project/member'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const result = await listOrganizationProjectMembers({ db }, executor, { projectId: id })
  return Response.json(result)
}))
