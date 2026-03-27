import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projects } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const GetProjectParametersSchema = z.object({
  id: z.string(),
})

export type GetProjectInput = z.input<typeof GetProjectParametersSchema>
export type GetProjectParameters = z.output<typeof GetProjectParametersSchema>

export async function getProject(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: GetProjectInput,
) {
  const result = GetProjectParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const projectRows = await db.select().from(projects).where(eq(projects.id, parameters.id))
  const project = projectRows[0]
  if (!project) throw new NotFoundError()
  return project
}
