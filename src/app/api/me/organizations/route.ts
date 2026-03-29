import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { eq } from 'drizzle-orm'
import { organizationAssignments, organizations } from '@db/schema'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const userId = executor.user.id
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    displayName: organizations.displayName,
    plan: organizations.plan,
    organizationRole: organizationAssignments.role,
    createdAt: organizations.createdAt,
  })
    .from(organizationAssignments)
    .innerJoin(organizations, eq(organizationAssignments.organizationId, organizations.id))
    .where(eq(organizationAssignments.userId, userId))
  return Response.json({ items: rows })
}))
