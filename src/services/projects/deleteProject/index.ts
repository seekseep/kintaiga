import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const DeleteProjectParametersSchema = z.object({
  id: z.string(),
})

export type DeleteProjectInput = z.input<typeof DeleteProjectParametersSchema>
export type DeleteProjectParameters = z.output<typeof DeleteProjectParametersSchema>

export async function deleteProject(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: DeleteProjectInput,
) {
  const result = DeleteProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isAdminUser(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(projects).where(eq(projects.id, parameters.id)).returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
