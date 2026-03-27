import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateIconParametersSchema } from '@db/validation'
import { updateIcon } from '@/services/me'

export const POST = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, UpdateIconParametersSchema)
  const updated = await updateIcon({ db, supabase }, { type: 'user', user }, parsed)
  return Response.json(updated)
}))
