import { eq, desc } from 'drizzle-orm'
import { personalAccessTokens, organizations } from '@db/schema'
import type { DbOrTx, UserExecutor } from '../../types'

export async function listMyTokens(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
) {
  const { db } = dependencies

  const items = await db.select({
    id: personalAccessTokens.id,
    name: personalAccessTokens.name,
    prefix: personalAccessTokens.prefix,
    organizationId: personalAccessTokens.organizationId,
    organizationName: organizations.name,
    organizationDisplayName: organizations.displayName,
    expiresAt: personalAccessTokens.expiresAt,
    lastUsedAt: personalAccessTokens.lastUsedAt,
    createdAt: personalAccessTokens.createdAt,
  }).from(personalAccessTokens)
    .innerJoin(organizations, eq(personalAccessTokens.organizationId, organizations.id))
    .where(eq(personalAccessTokens.userId, executor.user.id))
    .orderBy(desc(personalAccessTokens.createdAt))

  return { items }
}
