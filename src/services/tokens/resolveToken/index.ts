import { createHash } from 'crypto'
import { eq, and, or, isNull, gte } from 'drizzle-orm'
import { personalAccessTokens, users, organizations, organizationMembers } from '@db/schema'
import { UnauthorizedError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../types'

export async function resolveToken(
  dependencies: { db: DbOrTx },
  rawToken: string,
): Promise<{ executor: OrganizationExecutor; tokenId: string }> {
  const { db } = dependencies

  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const now = new Date()

  const rows = await db
    .select({
      tokenId: personalAccessTokens.id,
      userId: personalAccessTokens.userId,
      organizationId: personalAccessTokens.organizationId,
      userRole: users.role,
      organizationPlan: organizations.plan,
      organizationRole: organizationMembers.organizationRole,
    })
    .from(personalAccessTokens)
    .innerJoin(users, eq(personalAccessTokens.userId, users.id))
    .innerJoin(organizations, eq(personalAccessTokens.organizationId, organizations.id))
    .innerJoin(organizationMembers, and(
      eq(organizationMembers.organizationId, personalAccessTokens.organizationId),
      eq(organizationMembers.userId, personalAccessTokens.userId),
    ))
    .where(and(
      eq(personalAccessTokens.tokenHash, tokenHash),
      or(isNull(personalAccessTokens.expiresAt), gte(personalAccessTokens.expiresAt, now)),
    ))
    .limit(1)

  const row = rows[0]
  if (!row) throw new UnauthorizedError('Invalid or expired token')

  // Update lastUsedAt asynchronously (fire and forget)
  db.update(personalAccessTokens)
    .set({ lastUsedAt: now })
    .where(eq(personalAccessTokens.id, row.tokenId))
    .then(() => {})
    .catch(() => {})

  const executor: OrganizationExecutor = {
    type: 'organization',
    user: { id: row.userId, role: row.userRole },
    organization: { id: row.organizationId, role: row.organizationRole, plan: row.organizationPlan },
  }

  return { executor, tokenId: row.tokenId }
}
