import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { users } from '@db/schema.ts'
import { supabase } from '@api/_lib/supabase.ts'
import { withAuth } from '@api/_lib/auth.ts'
import { parseBody } from '@api/_lib/parse.ts'
import { InternalError } from '@api/_lib/errors.ts'
import { UpdateIconParametersSchema } from '@db/validation.ts'

export const POST = withAuth(async (req, user) => {
  const parsed = await parseBody(req, UpdateIconParametersSchema)

  const match = parsed.icon.match(/^data:image\/(\w+);base64,(.+)$/)!
  const ext = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const path = `${user.id}/icon.${ext}`

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
    .where(eq(users.id, user.id))
    .returning()

  return Response.json(updated)
})
