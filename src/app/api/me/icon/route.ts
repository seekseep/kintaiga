import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateUserIcon } from '@/services/user'

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const updated = await updateUserIcon({ db, supabase }, executor, { ...body, userId: executor.user.id })
  return Response.json(updated)
}))
