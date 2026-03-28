import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { eq } from 'drizzle-orm'
import { organizationMembers, organizations } from '@db/schema'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    displayName: organizations.displayName,
    plan: organizations.plan,
    organizationRole: organizationMembers.organizationRole,
    createdAt: organizations.createdAt,
  })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, executor.user.id))
  return Response.json({ items: rows })
}))
