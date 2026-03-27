import { api } from '@/lib/api'
import type { Configuration, UpdateConfigurationBody } from '@/schemas'

export type { Configuration, UpdateConfigurationBody } from '@/schemas'

export async function getConfiguration() {
  const r = await api.get<Configuration>('/configuration')
  return r.data
}

export async function updateConfiguration(body: UpdateConfigurationBody) {
  const r = await api.patch<Configuration>('/configuration', body)
  return r.data
}
