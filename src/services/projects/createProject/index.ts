import { z } from 'zod/v4'
import { projects } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const CreateProjectParametersSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
})

export type CreateProjectInput = z.input<typeof CreateProjectParametersSchema>
export type CreateProjectParameters = z.output<typeof CreateProjectParametersSchema>

export async function createProject(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: CreateProjectInput,
) {
  const result = CreateProjectParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const [created] = await db.insert(projects).values(parameters).returning()
  return created
}
