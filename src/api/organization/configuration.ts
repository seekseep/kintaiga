import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import {
  getOrganizationConfiguration as getOrganizationConfigurationService,
  updateOrganizationConfiguration as updateOrganizationConfigurationService,
} from '@/services/organization/configuration'
import type { Configuration } from '@/schemas'
import type { UpdateOrganizationConfigurationInput as UpdateConfigurationInput } from '@/services/organization/configuration/updateOrganizationConfiguration'

export type { Configuration } from '@/schemas'

type ConfigurationRow = {
  id: string | null
  roundingInterval: number
  roundingDirection: Configuration['roundingDirection']
  aggregationUnit: Configuration['aggregationUnit']
  aggregationPeriod: number
  createdAt: Date | string | null
  updatedAt: Date | string | null
}

function toConfiguration(row: ConfigurationRow): Configuration {
  const toIso = (v: Date | string | null) =>
    v instanceof Date ? v.toISOString() : (v ?? '')
  return {
    id: row.id ?? '',
    roundingInterval: row.roundingInterval,
    roundingDirection: row.roundingDirection,
    aggregationUnit: row.aggregationUnit,
    aggregationPeriod: row.aggregationPeriod,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  }
}

export const getOrganizationConfiguration = createServerFn({ method: 'GET' })
  .inputValidator((organizationName: string) => organizationName)
  .handler(async ({ data: organizationName }): Promise<Configuration> => {
    const executor = await getOrganizationExecutor(organizationName)
    const config = await getOrganizationConfigurationService({ db }, executor)
    return toConfiguration(config)
  })

export const updateOrganizationConfiguration = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { organizationName: string; body: UpdateConfigurationInput }) => data,
  )
  .handler(async ({ data }): Promise<Configuration> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const updated = await updateOrganizationConfigurationService({ db }, executor, data.body)
    return toConfiguration(updated)
  })
