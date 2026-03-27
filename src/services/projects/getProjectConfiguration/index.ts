import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projects, configurations } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import { resolveProjectConfig } from '@/domain/config'
import type { DbOrTx, Executor } from '../../types'

const GetProjectConfigurationParametersSchema = z.object({
  id: z.string(),
})

export type GetProjectConfigurationInput = z.input<typeof GetProjectConfigurationParametersSchema>
export type GetProjectConfigurationParameters = z.output<typeof GetProjectConfigurationParametersSchema>

export async function getProjectConfiguration(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: GetProjectConfigurationInput,
) {
  const result = GetProjectConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const [projectRows, configRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, parameters.id)),
    db.select().from(configurations).limit(1),
  ])
  const project = projectRows[0]
  const config = configRows[0]
  if (!project) throw new NotFoundError()
  if (!config) throw new NotFoundError('Configuration not found')

  return resolveProjectConfig(config, project)
}
