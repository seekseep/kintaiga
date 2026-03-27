import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { InternalError, ValidationError } from '@/lib/api-server/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DbOrTx, Executor } from '../../types'

const UpdateIconParametersSchema = z.object({
  icon: z.string(),
})

export type UpdateIconInput = z.input<typeof UpdateIconParametersSchema>
export type UpdateIconParameters = z.output<typeof UpdateIconParametersSchema>

export async function updateIcon(
  dependencies: { db: DbOrTx; supabase: SupabaseClient },
  executor: Executor,
  input: UpdateIconInput,
) {
  const result = UpdateIconParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db, supabase } = dependencies
  const match = parameters.icon.match(/^data:image\/(\w+);base64,(.+)$/)!
  const ext = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const path = `${executor.id}/icon.${ext}`

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
    .where(eq(users.id, executor.id))
    .returning()

  return updated
}
