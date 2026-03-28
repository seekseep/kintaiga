import { eq } from 'drizzle-orm'
import { reports, users } from '@db/schema'
import { ForbiddenError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

export async function listReports(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  if (!isOrganizationManagerOrAbove(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const rows = await db.select({
    id: reports.id,
    publicId: reports.publicId,
    userId: reports.userId,
    userName: users.name,
    name: reports.name,
    startDate: reports.startDate,
    endDate: reports.endDate,
    createdAt: reports.createdAt,
  })
    .from(reports)
    .innerJoin(users, eq(reports.userId, users.id))
    .where(eq(reports.organizationId, executor.organization.id))

  return rows
}
