import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateUserRole } from '@/services/user'

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const result = await updateUserRole({ db, supabase }, executor, { id, ...body })
  return Response.json(result)
}))
