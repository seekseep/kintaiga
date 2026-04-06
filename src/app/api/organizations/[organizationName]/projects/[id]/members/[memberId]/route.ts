import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { removeOrganizationProjectMember } from '@/services/organization/project/member'

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  await removeOrganizationProjectMember({ db }, executor, { id: memberId })
  return new Response(null, { status: 204 })
}))
