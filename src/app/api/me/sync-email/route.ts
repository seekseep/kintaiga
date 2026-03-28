import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { syncEmail } from '@/services/me/syncEmail'

export const POST = withErrorHandler(withUser(async (_req, executor) => {
  const updated = await syncEmail({ db, supabase }, executor)
  return Response.json({ email: updated.email })
}))
