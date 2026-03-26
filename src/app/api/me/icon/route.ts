import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { InternalError } from '@/lib/api-server/errors'
import { UpdateIconParametersSchema } from '@db/validation'

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
