import { api } from '@/lib/api'

export type Project = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type CreateProjectBody = {
  name: string
  description?: string
}

export type UpdateProjectBody = {
  name?: string
  description?: string
}

export function getProjects() {
  return api.get<Project[]>('/projects').then(r => r.data)
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
