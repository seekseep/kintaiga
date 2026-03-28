import { organizationMembers, users } from '@db/schema'
import { eq } from 'drizzle-orm'
import type { DbOrTx, OrganizationExecutor } from '../../types'

export async function listOrganizationMembers(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  const { db } = dependencies
  const rows = await db.select({
    id: organizationMembers.id,
    userId: organizationMembers.userId,
    organizationRole: organizationMembers.organizationRole,
    createdAt: organizationMembers.createdAt,
    userName: users.name,
    userIconUrl: users.iconUrl,
  })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, executor.organization.id))

  return rows
}
