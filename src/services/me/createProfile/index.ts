import { z } from 'zod/v4'
import { users } from '@db/schema'
import { ValidationError, ConflictError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const CreateProfileParametersSchema = z.object({
  sub: z.string(),
  name: z.string(),
})

export type CreateProfileInput = z.input<typeof CreateProfileParametersSchema>
export type CreateProfileParameters = z.output<typeof CreateProfileParametersSchema>

export async function createProfile(
  dependencies: { db: DbOrTx },
  executor: Executor | null,
  input: CreateProfileInput,
) {
  const result = CreateProfileParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (executor) throw new ConflictError('Already registered')
  const { db } = dependencies
  const [created] = await db.insert(users).values({ id: parameters.sub, name: parameters.name }).returning()
  return created
}
