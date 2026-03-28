import { eq } from 'drizzle-orm'
import { organizations } from '@db/schema'
import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { updateOrganization, deleteOrganization } from '@/services/organizations'

export const GET = withErrorHandler(withOrganization(async (_req, executor) => {
  const [org] = await db.select().from(organizations)
    .where(eq(organizations.id, executor.organization.id))
    .limit(1)
  return Response.json({
    organizationId: executor.organization.id,
    organizationDisplayName: org?.displayName ?? '',
    organizationRole: executor.organization.role,
    organizationPlan: executor.organization.plan,
  })
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const updated = await updateOrganization({ db }, executor, body)
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor) => {
  const deleted = await deleteOrganization({ db }, executor)
  return Response.json(deleted)
}))
