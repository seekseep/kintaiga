import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { archiveAndDeleteUser } from '@/services/user'

export const POST = withErrorHandler(withOrganization(async (_req, executor) => {
  await archiveAndDeleteUser({ db, supabase }, executor, {
    targetId: executor.user.id,
    anonymizeName: '削除されたユーザー',
  })
  return Response.json({ message: 'Account withdrawn' })
}))
