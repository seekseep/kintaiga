import { api } from '@/lib/api'

export interface CreateMyTokenInput {
  name: string
  organizationName: string
  expiresAt?: string | null
}

export interface MyToken {
  id: string
  name: string
  prefix: string
  organizationId: string
  organizationName: string
  organizationDisplayName: string
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export interface CreatedToken extends MyToken {
  token: string
}

export async function listMyTokens() {
  const { data } = await api.get<{ items: MyToken[] }>('/me/tokens')
  return data
}

export async function createMyToken(body: CreateMyTokenInput) {
  const { data } = await api.post<CreatedToken>('/me/tokens', body)
  return data
}

export async function revokeMyToken(id: string) {
  await api.delete(`/me/tokens/${id}`)
}
