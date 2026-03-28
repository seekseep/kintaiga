import { eq } from 'drizzle-orm'
import { projectActivityReports, users } from '@db/schema'
import { ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

export async function listOrganizationMemberReports(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const rows = await db.select({
    id: projectActivityReports.id,
    publicId: projectActivityReports.publicId,
    userId: projectActivityReports.userId,
    userName: users.name,
    name: projectActivityReports.name,
    startDate: projectActivityReports.startDate,
    endDate: projectActivityReports.endDate,
    createdAt: projectActivityReports.createdAt,
  })
    .from(projectActivityReports)
    .innerJoin(users, eq(projectActivityReports.userId, users.id))
    .where(eq(projectActivityReports.organizationId, executor.organization.id))

  return rows
}
