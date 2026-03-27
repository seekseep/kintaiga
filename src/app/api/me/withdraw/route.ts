import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { archiveAndDeleteUser } from '@/services/users'

export const POST = withErrorHandler(withAuth(async (_req, executor) => {
  await archiveAndDeleteUser({ db, supabase }, executor, {
    targetId: executor.id,
    anonymizeName: '削除されたユーザー',
  })
  return Response.json({ message: 'Account withdrawn' })
}))
