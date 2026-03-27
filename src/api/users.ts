import { api } from '@/lib/api'
import type { PaginatedResponse, User } from '@/schemas'
import type { ListUsersInput } from '@/services/users/listUsers'
import type { CreateUserInput } from '@/services/users/createUser'
import type { UpdateUserInput } from '@/services/users/updateUser'

export type { User } from '@/schemas'
export type { CreateUserInput } from '@/services/users/createUser'
export type { UpdateUserInput } from '@/services/users/updateUser'
export type UpdateUserBody = Omit<UpdateUserInput, 'id'>

export async function getUsers(params?: Partial<ListUsersInput>) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<User>>('/users', { params: query })
  return r.data
}

export async function getUser(id: string) {
  const r = await api.get<User>(`/users/${id}`)
  return r.data
}

export async function createUser(body: CreateUserInput) {
  const r = await api.post<User>('/users', body)
  return r.data
}

export async function updateUser(id: string, body: UpdateUserBody) {
  const r = await api.patch<User>(`/users/${id}`, body)
  return r.data
}

export async function updateUserRole(id: string, body: { role: 'admin' | 'general' }) {
  const r = await api.patch<User>(`/users/${id}/role`, body)
  return r.data
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`)
  return undefined
}
