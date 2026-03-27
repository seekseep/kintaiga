import { z } from 'zod/v4'
import { projects } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import type { DbOrTx, Executor } from '../../types'

const CreateProjectParametersSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
})

export type CreateProjectInput = z.input<typeof CreateProjectParametersSchema>
export type CreateProjectParameters = z.output<typeof CreateProjectParametersSchema>

export async function createProject(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: CreateProjectInput,
) {
  const result = CreateProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isAdminUser(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [created] = await db.insert(projects).values(parameters).returning()
  return created
}
