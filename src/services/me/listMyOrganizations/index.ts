import { eq } from 'drizzle-orm'
import { organizationAssignments, organizations } from '@db/schema'
import type { DbOrTx, UserExecutor } from '../../types'

export async function listMyOrganizations(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
) {
  const { db } = dependencies

  const items = await db.select({
    id: organizations.id,
    name: organizations.name,
    displayName: organizations.displayName,
    plan: organizations.plan,
    organizationRole: organizationAssignments.role,
    createdAt: organizations.createdAt,
  })
    .from(organizationAssignments)
    .innerJoin(organizations, eq(organizationAssignments.organizationId, organizations.id))
    .where(eq(organizationAssignments.userId, executor.user.id))

  return { items }
}
