import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { InternalError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canModifyUser, canChangeRole } from '@/domain/authorization'
import { RoleSchema } from '@/schemas/_helpers'
import type { DbOrTx, Executor } from '../../types'

const UpdateUserParametersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  role: RoleSchema.optional(),
})

export type UpdateUserInput = z.input<typeof UpdateUserParametersSchema>
export type UpdateUserParameters = z.output<typeof UpdateUserParametersSchema>

export async function updateUser(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: UpdateUserInput,
) {
  const result = UpdateUserParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const { id, ...fields } = result.data

  const { db } = dependencies
  const { user } = executor
  if (!canModifyUser(user.role, user.id, id)) throw new ForbiddenError()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (fields.name !== undefined) updates.name = fields.name

  if (fields.role !== undefined) {
    if (!canChangeRole(user.role)) throw new ForbiddenError()
    updates.role = fields.role
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
