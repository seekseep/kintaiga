import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, AuthorizedExecutor } from '../../types'

const GetUserParametersSchema = z.object({
  id: z.string(),
})

export type GetUserInput = z.input<typeof GetUserParametersSchema>
export type GetUserParameters = z.output<typeof GetUserParametersSchema>

export async function getUser(
  dependencies: { db: DbOrTx },
  _executor: AuthorizedExecutor,
  input: GetUserInput,
) {
  const result = GetUserParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const targetRows = await db.select().from(users).where(eq(users.id, parameters.id))
  const target = targetRows[0]
  if (!target) throw new NotFoundError()
  return target
}
