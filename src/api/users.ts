import { api } from '@/lib/api'

export type User = {
  id: string
  name: string
  role: 'admin' | 'general'
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CreateUserBody = {
  id: string
  name: string
  role?: 'admin' | 'general'
}

export type UpdateUserBody = {
  name?: string
  role?: 'admin' | 'general'
}

export function getUsers() {
  return api.get<User[]>('/users').then(r => r.data)
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
