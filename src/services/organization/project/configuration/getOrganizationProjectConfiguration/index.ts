import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const GetOrganizationProjectConfigurationParametersSchema = z.object({
  id: z.string(),
})

export type GetOrganizationProjectConfigurationInput = z.input<typeof GetOrganizationProjectConfigurationParametersSchema>
export type GetOrganizationProjectConfigurationParameters = z.output<typeof GetOrganizationProjectConfigurationParametersSchema>

export async function getOrganizationProjectConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetOrganizationProjectConfigurationInput,
) {
  const result = GetOrganizationProjectConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [project] = await db.select().from(projects).where(
    and(eq(projects.id, parameters.id), eq(projects.organizationId, executor.organization.id))
  ).limit(1)
  if (!project) throw new NotFoundError()

  return {
    roundingInterval: project.roundingInterval,
    roundingDirection: project.roundingDirection,
    aggregationUnit: project.aggregationUnit,
    aggregationPeriod: project.aggregationPeriod,
  }
}
