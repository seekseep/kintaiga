import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'

const UpdateProfileParametersSchema = z.object({
  name: z.string().optional(),
})

export type UpdateProfileInput = z.input<typeof UpdateProfileParametersSchema>
export type UpdateProfileParameters = z.output<typeof UpdateProfileParametersSchema>

export async function updateProfile(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
  input: UpdateProfileInput,
) {
  const result = UpdateProfileParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parameters.name !== undefined) updates.name = parameters.name
  const [updated] = await db.update(users).set(updates).where(eq(users.id, executor.user.id)).returning()
  return updated
}
