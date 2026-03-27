import { api } from '@/lib/api'
import type { PaginatedResponse, PaginationParams } from './types'

export type Project = {
  id: string
  name: string
  description: string | null
  roundingInterval: number | null
  roundingDirection: 'ceil' | 'floor' | null
  aggregationUnit: 'monthly' | 'none' | null
  createdAt: string
  updatedAt: string
}

export type ProjectConfig = {
  roundingInterval: number
  roundingDirection: 'ceil' | 'floor'
  aggregationUnit: 'monthly' | 'none'
}

export type CreateProjectBody = {
  name: string
  description?: string
}

export type UpdateProjectBody = {
  name?: string
  description?: string
  roundingInterval?: number | null
  roundingDirection?: 'ceil' | 'floor' | null
  aggregationUnit?: 'monthly' | 'none' | null
}

export function getProjects(params?: PaginationParams) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  return api.get<PaginatedResponse<Project>>('/projects', { params: query }).then(r => r.data)
}

export function getProject(id: string) {
  return api.get<Project>(`/projects/${id}`).then(r => r.data)
}

export function createProject(body: CreateProjectBody) {
  return api.post<Project>('/projects', body).then(r => r.data)
}

export function updateProject(id: string, body: UpdateProjectBody) {
  return api.patch<Project>(`/projects/${id}`, body).then(r => r.data)
}

export function deleteProject(id: string) {
  return api.delete(`/projects/${id}`).then(() => undefined)
}

export function getProjectConfig(id: string) {
  return api.get<ProjectConfig>(`/projects/${id}/config`).then(r => r.data)
}
