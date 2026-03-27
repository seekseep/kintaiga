import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import { RoleSchema } from '@/schemas/_helpers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, Executor } from '../../types'

const UpdateUserRoleParametersSchema = z.object({
  id: z.string(),
  role: RoleSchema,
})

export type UpdateUserRoleInput = z.input<typeof UpdateUserRoleParametersSchema>
export type UpdateUserRoleParameters = z.output<typeof UpdateUserRoleParametersSchema>

export async function updateUserRole(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: Executor,
  input: UpdateUserRoleInput,
) {
  const result = UpdateUserRoleParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const { id, role } = result.data

  if (!isAdminUser(executor)) throw new ForbiddenError()

  const { db, supabase } = dependencies
  await supabase.auth.admin.updateUserById(id, {
    app_metadata: { role },
  })

  const [updated] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
