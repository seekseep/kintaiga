import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, ConflictError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'

export const CreateProfileParametersSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
})

export type CreateProfileInput = z.input<typeof CreateProfileParametersSchema>
export type CreateProfileParameters = z.output<typeof CreateProfileParametersSchema>

export async function createProfile(
  dependencies: { db: DbOrTx },
  _executor: UserExecutor | null,
  input: CreateProfileInput,
) {
  const result = CreateProfileParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const existing = await db.select().from(users).where(eq(users.id, parameters.sub)).limit(1)
  if (existing.length > 0) throw new ConflictError('Already registered')

  const [created] = await db.insert(users).values({
    id: parameters.sub,
    name: parameters.name,
    email: parameters.email ?? null,
  }).returning()
  return created
}
