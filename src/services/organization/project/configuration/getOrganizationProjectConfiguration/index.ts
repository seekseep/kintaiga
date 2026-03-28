import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects, projectConfigurations } from '@db/schema'
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

  const [config] = await db.select().from(projectConfigurations).where(
    eq(projectConfigurations.projectId, parameters.id)
  ).limit(1)
  if (!config) throw new NotFoundError('Configuration not found')

  return {
    roundingInterval: config.roundingInterval,
    roundingDirection: config.roundingDirection,
    aggregationUnit: config.aggregationUnit,
    aggregationPeriod: config.aggregationPeriod,
  }
}
