import { api } from '@/lib/api'
import type { PaginatedResponse, Project, ProjectConfig, ProjectMember, UserProjectStatement, CreateProjectBody, UpdateProjectBody } from '@/schemas'
import type { ListUserProjectStatementsInput } from '@/services/projects/listProjects'

export type { Project, ProjectConfig, ProjectMember, UserProjectStatement, CreateProjectBody, UpdateProjectBody } from '@/schemas'

export type GetUserProjectStatementsParams = Partial<ListUserProjectStatementsInput>

export async function getUserProjectStatements(params?: GetUserProjectStatementsParams) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  if (params?.filter) query.filter = params.filter
  const r = await api.get<PaginatedResponse<UserProjectStatement>>('/me/project-statements', { params: query })
  return r.data
}

export async function getProject(id: string) {
  const r = await api.get<Project>(`/projects/${id}`)
  return r.data
}

export async function createProject(body: CreateProjectBody) {
  const r = await api.post<Project>('/projects', body)
  return r.data
}

export async function updateProject(id: string, body: UpdateProjectBody) {
  const r = await api.patch<Project>(`/projects/${id}`, body)
  return r.data
}

export async function deleteProject(id: string) {
  await api.delete(`/projects/${id}`)
  return undefined
}

export async function getProjectConfig(id: string) {
  const r = await api.get<ProjectConfig>(`/projects/${id}/configuration`)
  return r.data
}

export async function getProjectMembers(id: string) {
  const r = await api.get<{ items: ProjectMember[] }>(`/projects/${id}/members`)
  return r.data
}
