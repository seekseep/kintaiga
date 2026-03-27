import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projects } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const DeleteProjectParametersSchema = z.object({
  id: z.string(),
})

export type DeleteProjectInput = z.input<typeof DeleteProjectParametersSchema>
export type DeleteProjectParameters = z.output<typeof DeleteProjectParametersSchema>

export async function deleteProject(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: DeleteProjectInput,
) {
  const result = DeleteProjectParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(projects).where(eq(projects.id, parameters.id)).returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
