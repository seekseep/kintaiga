import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import type { DbOrTx, AuthorizedExecutor } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

const SyncUserEmailParametersSchema = z.object({
  userId: z.string().min(1),
})

export type SyncUserEmailInput = z.input<typeof SyncUserEmailParametersSchema>

export async function syncUserEmail(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: AuthorizedExecutor,
  input: SyncUserEmailInput,
) {
  const result = SyncUserEmailParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (executor.user.role !== 'admin' && parameters.userId !== executor.user.id) {
    throw new ForbiddenError()
  }

  const { db, supabase } = dependencies

  const { data, error } = await supabase.auth.admin.getUserById(parameters.userId)
  if (error || !data.user) throw new NotFoundError()

  const email = data.user.email ?? null

  const [updated] = await db.update(users)
    .set({ email, updatedAt: new Date() })
    .where(eq(users.id, parameters.userId))
    .returning()

  return updated
}
