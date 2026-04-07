import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import {
  getOrganizationMember,
  removeOrganizationMember,
  archiveOrganizationMember,
} from '@/services/organization'
import { resolveUserIdFromMemberId } from '@/domain/member'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  const member = await getOrganizationMember({ db }, executor, { memberId })
  return Response.json(member)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  await removeOrganizationMember({ db }, executor, { userId })
  await archiveOrganizationMember({ db }, executor, { userId })
  return new Response(null, { status: 204 })
}))
