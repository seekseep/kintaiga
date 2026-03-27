import { api } from '@/lib/api'

export type Configuration = {
  id: string
  roundingInterval: number
  roundingDirection: 'ceil' | 'floor'
  aggregationUnit: 'monthly' | 'none'
  createdAt: string
  updatedAt: string
}

export type UpdateConfigurationBody = {
  roundingInterval?: number
  roundingDirection?: 'ceil' | 'floor'
  aggregationUnit?: 'monthly' | 'none'
}

export function getConfiguration() {
  return api.get<Configuration>('/configuration').then(r => r.data)
}

export function updateConfiguration(body: UpdateConfigurationBody) {
  return api.patch<Configuration>('/configuration', body).then(r => r.data)
}
