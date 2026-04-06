import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateUserRole } from '@/services/user'
import { resolveUserIdFromMemberId } from '@/domain/member'

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { memberId } = await context.params
  const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
  const body = await req.json()
  const result = await updateUserRole({ db, supabase }, executor, { id: userId, ...body })
  return Response.json(result)
}))
