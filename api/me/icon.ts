import { eq } from 'drizzle-orm'
import { db } from '../_lib/db.ts'
import { users } from '../../db/schema.ts'
import { supabase } from '../_lib/supabase.ts'
import { withAuth } from '../_lib/auth.ts'

export const POST = withAuth(async (req, user) => {
  const { icon } = await req.json() as { icon?: string }
  if (!icon || typeof icon !== 'string') {
    return Response.json({ error: 'icon (base64 data URL) is required' }, { status: 400 })
  }

  const match = icon.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return Response.json({ error: 'Invalid data URL format' }, { status: 400 })

  const ext = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const path = `${user.id}/icon.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('icons')
    .upload(path, buffer, {
      contentType: `image/${ext}`,
      upsert: true,
    })

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('icons').getPublicUrl(path)

  const [updated] = await db.update(users)
    .set({ iconUrl: publicUrl, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning()

  return Response.json(updated)
})
