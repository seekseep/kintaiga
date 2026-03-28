import { api } from '@/lib/api'
import type { PaginatedResponse, User } from '@/schemas'
import type { ListUsersInput } from '@/services/users/listUsers'
import type { CreateUserInput } from '@/services/users/createUser'
import type { UpdateUserInput } from '@/services/users/updateUser'

export type { User } from '@/schemas'
export type { CreateUserInput } from '@/services/users/createUser'
export type { UpdateUserInput } from '@/services/users/updateUser'
export type UpdateUserBody = Omit<UpdateUserInput, 'id'>

export async function getUsers(organizationName: string, params?: Partial<ListUsersInput>) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<User>>(`/organizations/${organizationName}/users`, { params: query })
  return r.data
}

export async function getUser(organizationName: string, id: string) {
  const r = await api.get<User>(`/organizations/${organizationName}/users/${id}`)
  return r.data
}

export async function createUser(organizationName: string, body: CreateUserInput) {
  const r = await api.post<User>(`/organizations/${organizationName}/users`, body)
  return r.data
}

export async function updateUser(organizationName: string, id: string, body: UpdateUserBody) {
  const r = await api.patch<User>(`/organizations/${organizationName}/users/${id}`, body)
  return r.data
}

export async function updateUserRole(organizationName: string, id: string, body: { role: 'admin' | 'general' }) {
  const r = await api.patch<User>(`/organizations/${organizationName}/users/${id}/role`, body)
  return r.data
}

export async function deleteUser(organizationName: string, id: string) {
  await api.delete(`/organizations/${organizationName}/users/${id}`)
  return undefined
}
