import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function syncEmail(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: UserExecutor,
) {
  const { db, supabase } = dependencies

  const { data, error } = await supabase.auth.admin.getUserById(executor.user.id)
  if (error || !data.user) throw new NotFoundError()

  const email = data.user.email ?? null

  const [updated] = await db.update(users)
    .set({ email, updatedAt: new Date() })
    .where(eq(users.id, executor.user.id))
    .returning()

  return updated
}
