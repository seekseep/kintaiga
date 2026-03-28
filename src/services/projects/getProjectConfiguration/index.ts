import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects, organizationConfigurations } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { resolveProjectConfig } from '@/domain/configuration'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const GetProjectConfigurationParametersSchema = z.object({
  id: z.string(),
})

export type GetProjectConfigurationInput = z.input<typeof GetProjectConfigurationParametersSchema>
export type GetProjectConfigurationParameters = z.output<typeof GetProjectConfigurationParametersSchema>

export async function getProjectConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetProjectConfigurationInput,
) {
  const result = GetProjectConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [projectRows, configRows] = await Promise.all([
    db.select().from(projects).where(
      and(eq(projects.id, parameters.id), eq(projects.organizationId, executor.organization.id))
    ),
    db.select().from(organizationConfigurations).where(eq(organizationConfigurations.organizationId, executor.organization.id)).limit(1),
  ])
  const project = projectRows[0]
  const config = configRows[0]
  if (!project) throw new NotFoundError()
  if (!config) throw new NotFoundError('Configuration not found')

  return resolveProjectConfig(config, project)
}
