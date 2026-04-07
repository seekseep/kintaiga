import { z } from 'zod/v4'
import { eq, and, desc } from 'drizzle-orm'
import { personalAccessTokens, organizations } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import type { DbOrTx, AuthorizedExecutor } from '../../../types'

const ListUserTokensParametersSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().optional(),
})

export type ListUserTokensInput = z.input<typeof ListUserTokensParametersSchema>

export async function listUserTokens(
  dependencies: { db: DbOrTx },
  executor: AuthorizedExecutor,
  input: ListUserTokensInput,
) {
  const result = ListUserTokensParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (executor.user.role !== 'admin' && parameters.userId !== executor.user.id) {
    throw new ForbiddenError()
  }

  const { db } = dependencies

  const conditions = [eq(personalAccessTokens.userId, parameters.userId)]
  if (parameters.organizationId) {
    conditions.push(eq(personalAccessTokens.organizationId, parameters.organizationId))
  }

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
    .where(and(...conditions))
    .orderBy(desc(personalAccessTokens.createdAt))

  return { items }
}
