import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getUser, updateUser, archiveAndDeleteUser } from '@/services/user'
import { resolveUserIdFromMemberId } from '@/domain/member'
import { updateOrganizationMemberRole, removeOrganizationMember } from '@/services/organization'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  const { userId, role: organizationRole } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  const target = await getUser({ db }, executor, { id: userId })
  return Response.json({ ...target, id: memberId, userId, organizationRole })
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { memberId } = await context.params
  const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  const body = await req.json()
  const updated = await updateUser({ db }, executor, { id: userId, ...body })
  return Response.json({ ...updated, id: memberId, userId })
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { memberId } = await context.params
  const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  await archiveAndDeleteUser({ db, supabase }, executor, { targetId: userId })
  return new Response(null, { status: 204 })
}))
