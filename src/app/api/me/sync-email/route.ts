import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { syncUserEmail } from '@/services/user'

export const POST = withErrorHandler(withUser(async (_req, executor) => {
  const updated = await syncUserEmail({ db, supabase }, executor, { userId: executor.user.id })
  return Response.json({ email: updated.email })
}))
