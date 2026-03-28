import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { personalAccessTokens } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const RevokeTokenParametersSchema = z.object({
  id: z.string(),
})

export type RevokeTokenInput = z.input<typeof RevokeTokenParametersSchema>

export async function revokeToken(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: RevokeTokenInput,
) {
  const result = RevokeTokenParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [token] = await db.select().from(personalAccessTokens)
    .where(eq(personalAccessTokens.id, parameters.id))
    .limit(1)

  if (!token) throw new NotFoundError('Token not found')

  // Only the token owner can revoke (or admin)
  if (token.userId !== executor.user.id && executor.user.role !== 'admin') {
    throw new ForbiddenError()
  }

  await db.delete(personalAccessTokens)
    .where(eq(personalAccessTokens.id, parameters.id))
}
