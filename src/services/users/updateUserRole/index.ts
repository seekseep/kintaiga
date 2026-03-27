import { z } from 'zod/v4'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import { RoleSchema } from '@/schemas/_helpers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Executor } from '../../types'

const UpdateUserRoleParametersSchema = z.object({
  id: z.string(),
  role: RoleSchema,
})

export type UpdateUserRoleInput = z.input<typeof UpdateUserRoleParametersSchema>
export type UpdateUserRoleParameters = z.output<typeof UpdateUserRoleParametersSchema>

export async function updateUserRole(
  dependencies: { supabase: SupabaseClient },
  executor: Executor,
  input: UpdateUserRoleInput,
) {
  const result = UpdateUserRoleParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const { id, role } = result.data

  if (!isAdminUser(executor)) throw new ForbiddenError()

  const { supabase } = dependencies
  await supabase.auth.admin.updateUserById(id, {
    app_metadata: { role },
  })

  return { id, role }
}
