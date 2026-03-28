import { z } from 'zod/v4'
import { users } from '@db/schema'
import { InternalError, ValidationError, ConflictError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsAdmin } from '@/domain/authorization'
import { RoleSchema } from '@/schemas/role'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, OrganizationExecutor } from '../../types'

export const CreateUserParametersSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: RoleSchema.optional().default('general'),
})

export type CreateUserInput = z.input<typeof CreateUserParametersSchema>
export type CreateUserParameters = z.output<typeof CreateUserParametersSchema>

export async function createUser(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: OrganizationExecutor,
  input: CreateUserInput,
) {
  const result = CreateUserParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsAdmin(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db, supabase } = dependencies
  const { data, error } = await supabase.auth.admin.createUser({
    email: parameters.email,
    password: parameters.password,
    email_confirm: true,
    app_metadata: { role: parameters.role },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      throw new ConflictError('このメールアドレスは既に登録されています')
    }
    throw new InternalError(error.message)
  }

  const [created] = await db.insert(users).values({
    id: data.user.id,
    name: parameters.name,
    role: parameters.role,
  }).returning()

  return created
}
