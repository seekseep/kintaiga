import { eq } from 'drizzle-orm'
import { organizations } from '@db/schema'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

export async function deleteOrganization(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const [deleted] = await db.delete(organizations)
    .where(eq(organizations.id, executor.organization.id))
    .returning()

  if (!deleted) throw new NotFoundError('組織が見つかりません')
  return deleted
}
