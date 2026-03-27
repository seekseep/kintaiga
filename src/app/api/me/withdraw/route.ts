import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { archiveAndDeleteUser } from '@/services/users'

export const POST = withErrorHandler(withAuth(async (_req, user) => {
  await archiveAndDeleteUser({ db, supabase }, { type: 'user', user }, {
    targetId: user.id,
    anonymizeName: '削除されたユーザー',
  })
  return Response.json({ message: 'Account withdrawn' })
}))
