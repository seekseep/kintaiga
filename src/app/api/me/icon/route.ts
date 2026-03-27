import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { updateIcon } from '@/services/me'

export const POST = withErrorHandler(withAuth(async (req, executor) => {
  const body = await req.json()
  const updated = await updateIcon({ db, supabase }, executor, body)
  return Response.json(updated)
}))
