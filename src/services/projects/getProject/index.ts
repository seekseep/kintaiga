import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const GetProjectParametersSchema = z.object({
  id: z.string(),
})

export type GetProjectInput = z.input<typeof GetProjectParametersSchema>
export type GetProjectParameters = z.output<typeof GetProjectParametersSchema>

export async function getProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetProjectInput,
) {
  const result = GetProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const projectRows = await db.select().from(projects).where(
    and(eq(projects.id, parameters.id), eq(projects.organizationId, executor.organization.id))
  )
  const project = projectRows[0]
  if (!project) throw new NotFoundError()
  return project
}
