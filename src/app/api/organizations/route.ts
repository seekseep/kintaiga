import { db } from '@/lib/api-server/db'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { createOrganization } from '@/services/organization'
import { eq } from 'drizzle-orm'
import { organizationAssignments, organizations } from '@db/schema'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    plan: organizations.plan,
    organizationRole: organizationAssignments.role,
    createdAt: organizations.createdAt,
  })
    .from(organizationAssignments)
    .innerJoin(organizations, eq(organizationAssignments.organizationId, organizations.id))
    .where(eq(organizationAssignments.userId, executor.user.id))
  return Response.json({ items: rows })
}))

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const created = await createOrganization({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
