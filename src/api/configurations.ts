import { api } from '@/lib/api'
import type { Configuration } from '@/schemas'
import type { UpdateConfigurationInput } from '@/services/organization-configuration/updateConfiguration'

export type { Configuration } from '@/schemas'
export type { UpdateConfigurationInput } from '@/services/organization-configuration/updateConfiguration'

export async function getConfiguration(organizationName: string) {
  const r = await api.get<Configuration>(`/organizations/${organizationName}/configuration`)
  return r.data
}

export async function updateConfiguration(organizationName: string, body: UpdateConfigurationInput) {
  const r = await api.patch<Configuration>(`/organizations/${organizationName}/configuration`, body)
  return r.data
}
