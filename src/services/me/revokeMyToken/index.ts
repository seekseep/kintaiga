import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { personalAccessTokens } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'

const RevokeMyTokenParametersSchema = z.object({
  id: z.string(),
})

export type RevokeMyTokenInput = z.input<typeof RevokeMyTokenParametersSchema>

export async function revokeMyToken(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
  input: RevokeMyTokenInput,
) {
  const result = RevokeMyTokenParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [token] = await db.select().from(personalAccessTokens)
    .where(eq(personalAccessTokens.id, parameters.id))
    .limit(1)

  if (!token) throw new NotFoundError('Token not found')

  if (token.userId !== executor.user.id) {
    throw new ForbiddenError()
  }

  await db.delete(personalAccessTokens)
    .where(eq(personalAccessTokens.id, parameters.id))
}
