import { eq, and, desc } from 'drizzle-orm'
import { personalAccessTokens } from '@db/schema'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export async function listUserTokens(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
) {
  const { db } = dependencies

  const items = await db.select({
    id: personalAccessTokens.id,
    name: personalAccessTokens.name,
    prefix: personalAccessTokens.prefix,
    expiresAt: personalAccessTokens.expiresAt,
    lastUsedAt: personalAccessTokens.lastUsedAt,
    createdAt: personalAccessTokens.createdAt,
  }).from(personalAccessTokens)
    .where(and(
      eq(personalAccessTokens.userId, executor.user.id),
      eq(personalAccessTokens.organizationId, executor.organization.id),
    ))
    .orderBy(desc(personalAccessTokens.createdAt))

  return { items }
}
