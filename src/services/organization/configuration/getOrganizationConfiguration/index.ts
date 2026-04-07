import { eq } from 'drizzle-orm'
import { organizationConfigurations } from '@db/schema'
import { DEFAULT_GLOBAL_CONFIG } from '@/domain/project/configuration'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export async function getOrganizationConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  const { db } = dependencies
  const configRows = await db.select().from(organizationConfigurations)
    .where(eq(organizationConfigurations.organizationId, executor.organization.id))
    .limit(1)
  const config = configRows[0]
  if (!config) {
    return {
      id: null,
      organizationId: executor.organization.id,
      ...DEFAULT_GLOBAL_CONFIG,
      createdAt: null,
      updatedAt: null,
    }
  }
  return config
}
