import { api } from '@/lib/api'
import type { Configuration } from '@/schemas'
import type { UpdateConfigurationInput } from '@/services/configuration/updateConfiguration'

export type { Configuration } from '@/schemas'
export type { UpdateConfigurationInput } from '@/services/configuration/updateConfiguration'

export async function getConfiguration() {
  const r = await api.get<Configuration>('/configuration')
  return r.data
}

export async function updateConfiguration(body: UpdateConfigurationInput) {
  const r = await api.patch<Configuration>('/configuration', body)
  return r.data
}
