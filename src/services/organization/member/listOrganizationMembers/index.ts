import { organizationAssignments, users } from '@db/schema'
import { eq } from 'drizzle-orm'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export async function listOrganizationMembers(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  const { db } = dependencies
  const rows = await db.select({
    id: organizationAssignments.id,
    userId: organizationAssignments.userId,
    role: organizationAssignments.role,
    createdAt: organizationAssignments.createdAt,
    userName: users.name,
    userIconUrl: users.iconUrl,
  })
    .from(organizationAssignments)
    .innerJoin(users, eq(organizationAssignments.userId, users.id))
    .where(eq(organizationAssignments.organizationId, executor.organization.id))

  return rows
}
