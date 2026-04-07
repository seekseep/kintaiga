import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canModifyUser } from '@/domain/authorization'
import type { DbOrTx, AuthorizedExecutor } from '../../types'

export const UpdateUserParametersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
})

export type UpdateUserInput = z.input<typeof UpdateUserParametersSchema>
export type UpdateUserParameters = z.output<typeof UpdateUserParametersSchema>

export async function updateUser(
  dependencies: { db: DbOrTx },
  executor: AuthorizedExecutor,
  input: UpdateUserInput,
) {
  const result = UpdateUserParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const { id, ...fields } = result.data

  const { db } = dependencies
  if (!canModifyUser(executor, id)) throw new ForbiddenError()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (fields.name !== undefined) updates.name = fields.name

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
