import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import { defineServerFn } from '@/lib/server-fn'
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

export const getOrganizationConfiguration = defineServerFn(
  async (organizationName: string): Promise<Configuration> => {
    const executor = await getOrganizationExecutor(organizationName)
    const config = await getOrganizationConfigurationService({ db }, executor)
    return toConfiguration(config)
  },
)

export const updateOrganizationConfiguration = defineServerFn(
  async ({
    organizationName,
    body,
  }: {
    organizationName: string
    body: UpdateConfigurationInput
  }): Promise<Configuration> => {
    const executor = await getOrganizationExecutor(organizationName)
    const updated = await updateOrganizationConfigurationService({ db }, executor, body)
    return toConfiguration(updated)
  },
)
