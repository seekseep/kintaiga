import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateOrganizationMemberRole } from '@/services/organization'
import { resolveUserIdFromMemberId } from '@/domain/member'

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { memberId } = await context.params
  const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  const body = await req.json()
  const result = await updateOrganizationMemberRole({ db }, executor, { userId, ...body })
  return Response.json(result)
}))
