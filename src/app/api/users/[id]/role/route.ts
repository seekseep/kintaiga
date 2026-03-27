import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { updateUserRole } from '@/services/users'

export const PATCH = withErrorHandler(withAuth(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const result = await updateUserRole({ supabase }, executor, { id, ...body })
  return Response.json(result)
}))
