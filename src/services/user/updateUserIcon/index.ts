import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { InternalError, ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, AuthorizedExecutor } from '../../types'

export const UpdateUserIconParametersSchema = z.object({
  userId: z.string().min(1),
  icon: z.string(),
})

export type UpdateUserIconInput = z.input<typeof UpdateUserIconParametersSchema>
export type UpdateUserIconParameters = z.output<typeof UpdateUserIconParametersSchema>

export async function updateUserIcon(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: AuthorizedExecutor,
  input: UpdateUserIconInput,
) {
  const result = UpdateUserIconParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (executor.user.role !== 'admin' && parameters.userId !== executor.user.id) {
    throw new ForbiddenError()
  }

  const { db, supabase } = dependencies
  const match = parameters.icon.match(/^data:image\/(\w+);base64,(.+)$/)!
  const ext = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const path = `${parameters.userId}/icon.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('icons')
    .upload(path, buffer, {
      contentType: `image/${ext}`,
      upsert: true,
    })

  if (uploadError) throw new InternalError(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('icons').getPublicUrl(path)

  const [updated] = await db.update(users)
    .set({ iconUrl: publicUrl, updatedAt: new Date() })
    .where(eq(users.id, parameters.userId))
    .returning()

  return updated
}
