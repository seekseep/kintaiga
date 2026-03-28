import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { NotFoundError } from '@/lib/api-server/errors'

export const POST = withErrorHandler(withUser(async (_req, executor) => {
  const { data, error } = await supabase.auth.admin.getUserById(executor.user.id)
  if (error || !data.user) throw new NotFoundError()

  const email = data.user.email ?? null

  await db.update(users)
    .set({ email, updatedAt: new Date() })
    .where(eq(users.id, executor.user.id))

  return Response.json({ email })
}))
