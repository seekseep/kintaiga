import { z } from 'zod/v4'
import { users } from '@db/schema'
import { InternalError, ConflictError } from '@/lib/api-server/errors'
import { RoleSchema } from '@/schemas/_helpers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, Executor } from '../../types'

const CreateUserParametersSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: RoleSchema.optional().default('general'),
})

export type CreateUserInput = z.input<typeof CreateUserParametersSchema>
export type CreateUserParameters = z.output<typeof CreateUserParametersSchema>

export async function createUser(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  _executor: Executor,
  input: CreateUserInput,
) {
  const result = CreateUserParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db, supabase } = dependencies
  const { data, error } = await supabase.auth.admin.createUser({
    email: parameters.email,
    password: parameters.password,
    email_confirm: true,
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
