import { eq } from 'drizzle-orm'
import { organizationConfigurations } from '@db/schema'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export async function getOrganizationConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  const { db } = dependencies
  const configRows = await db.select().from(organizationConfigurations)
    .where(eq(organizationConfigurations.organizationId, executor.organization.id))
    .limit(1)
  let config = configRows[0]
  if (!config) {
    const [created] = await db.insert(organizationConfigurations).values({
      organizationId: executor.organization.id,
    }).returning()
    config = created
  }
  return config
}
