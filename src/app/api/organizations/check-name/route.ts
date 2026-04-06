import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { eq } from 'drizzle-orm'
import { organizations } from '@db/schema'
import { isReservedOrganizationName } from '@/domain/organization/name'

export const GET = withErrorHandler(withUser(async (req) => {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')

  if (!name) {
    return Response.json({ available: false, reason: '名前を指定してください' })
  }

  if (isReservedOrganizationName(name)) {
    return Response.json({ available: false, reason: 'この名前は予約されています' })
  }

  const existing = await db.select({ id: organizations.id }).from(organizations)
    .where(eq(organizations.name, name)).limit(1)

  return Response.json({
    available: existing.length === 0,
    reason: existing.length > 0 ? 'この名前は既に使用されています' : null,
  })
}))
