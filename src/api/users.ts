import { api } from '@/lib/api'
import type { PaginatedResponse, PaginationParams } from './types'

export type User = {
  id: string
  name: string
  role: 'admin' | 'general'
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CreateUserBody = {
  email: string
  password: string
  name: string
  role?: 'admin' | 'general'
}

export type UpdateUserBody = {
  name?: string
  role?: 'admin' | 'general'
}

export function getUsers(params?: PaginationParams) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  return api.get<PaginatedResponse<User>>('/users', { params: query }).then(r => r.data)
}

export function getUser(id: string) {
  return api.get<User>(`/users/${id}`).then(r => r.data)
}

export function createUser(body: CreateUserBody) {
  return api.post<User>('/users', body).then(r => r.data)
}

export function updateUser(id: string, body: UpdateUserBody) {
  return api.patch<User>(`/users/${id}`, body).then(r => r.data)
}

export function deleteUser(id: string) {
  return api.delete(`/users/${id}`).then(() => undefined)
}
