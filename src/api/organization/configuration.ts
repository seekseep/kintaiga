import { api } from '@/lib/api'
import type { Configuration } from '@/schemas'
import type { UpdateOrganizationConfigurationInput as UpdateConfigurationInput } from '@/services/organization/configuration/updateOrganizationConfiguration'

export type { Configuration } from '@/schemas'

export async function getOrganizationConfiguration(
  organizationName: string
) {
  const { data } = await api.get<Configuration>(
    `/organizations/${organizationName}/configuration`
  )
  return data
}

export async function updateOrganizationConfiguration(
  organizationName: string,
  body: UpdateConfigurationInput
) {
  const { data } = await api.patch<Configuration>(
    `/organizations/${organizationName}/configuration`,
    body
  )
  return data
}
