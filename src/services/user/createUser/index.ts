import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, ConflictError, ForbiddenError } from '@/lib/api-server/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, UserExecutor } from '../../types'

export const CreateUserParametersSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().nullable().optional(),
})

export type CreateUserInput = z.input<typeof CreateUserParametersSchema>
export type CreateUserParameters = z.output<typeof CreateUserParametersSchema>

export async function createUser(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: UserExecutor,
  input: CreateUserInput,
) {
  const result = CreateUserParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (executor.user.role !== 'admin' && parameters.userId !== executor.user.id) {
    throw new ForbiddenError('Cannot create another user')
  }

  const { db, supabase } = dependencies

  const existing = await db.select().from(users).where(eq(users.id, parameters.userId)).limit(1)
  if (existing.length > 0) throw new ConflictError('Already registered')

  const [created] = await db.insert(users).values({
    id: parameters.userId,
    name: parameters.name,
    email: parameters.email ?? null,
  }).returning()

  await supabase.auth.admin.updateUserById(parameters.userId, {
    app_metadata: { role: created.role },
  })

  return created
}
