import { api } from '@/lib/api'
import type { PaginatedResponse, Project, ProjectConfig, ProjectMember, UserProjectStatement } from '@/schemas'
import type { ListUserProjectStatementsInput } from '@/services/projects/listProjects'
import type { CreateProjectInput } from '@/services/projects/createProject'
import type { UpdateProjectInput } from '@/services/projects/updateProject'

export type { Project, ProjectConfig, ProjectMember, UserProjectStatement } from '@/schemas'
export type { CreateProjectInput } from '@/services/projects/createProject'
export type { UpdateProjectInput } from '@/services/projects/updateProject'
export type UpdateProjectBody = Omit<UpdateProjectInput, 'id'>

export type GetUserProjectStatementsParams = Partial<ListUserProjectStatementsInput>

export async function getUserProjectStatements(organizationName: string, params?: GetUserProjectStatementsParams) {
  const query: Record<string, string> = {}
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  if (params?.filter) query.filter = params.filter
  const r = await api.get<PaginatedResponse<UserProjectStatement>>(`/organizations/${organizationName}/projects`, { params: query })
  return r.data
}

export async function getProject(organizationName: string, id: string) {
  const r = await api.get<Project>(`/organizations/${organizationName}/projects/${id}`)
  return r.data
}

export async function createProject(organizationName: string, body: CreateProjectInput) {
  const r = await api.post<Project>(`/organizations/${organizationName}/projects`, body)
  return r.data
}

export async function updateProject(organizationName: string, id: string, body: UpdateProjectBody) {
  const r = await api.patch<Project>(`/organizations/${organizationName}/projects/${id}`, body)
  return r.data
}

export async function deleteProject(organizationName: string, id: string) {
  await api.delete(`/organizations/${organizationName}/projects/${id}`)
  return undefined
}

export async function getProjectConfig(organizationName: string, id: string) {
  const r = await api.get<ProjectConfig>(`/organizations/${organizationName}/projects/${id}/configuration`)
  return r.data
}

export async function getProjectMembers(organizationName: string, id: string) {
  const r = await api.get<{ items: ProjectMember[] }>(`/organizations/${organizationName}/projects/${id}/members`)
  return r.data
}
