import { api } from '@/lib/api'
import type { User } from './users'
import type { Project } from './projects'
import type { PaginatedResponse, PaginationParams } from './types'

export type RegisterMeBody = {
  name: string
}

export type UpdateMeBody = {
  name?: string
}

export type UploadIconBody = {
  icon: string
}

export function getMe() {
  return api.get<User>('/me').then(r => r.data)
}

export function registerMe(body: RegisterMeBody) {
  return api.post<User>('/me', body).then(r => r.data)
}

export function updateMe(body: UpdateMeBody) {
  return api.patch<User>('/me', body).then(r => r.data)
}

export function uploadMyIcon(body: UploadIconBody) {
  return api.post<User>('/me/icon', body).then(r => r.data)
}

export function getMyProjects(params?: PaginationParams) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  return api.get<PaginatedResponse<Project>>('/me/projects', { params: query }).then(r => r.data)
}
