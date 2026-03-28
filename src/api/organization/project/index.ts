import { api } from '@/lib/api'
import type { PaginatedResponse, Project, ProjectConfig, ProjectMember, UserProjectStatement } from '@/schemas'
import type { ListOrganizationProjectStatementsInput as ListUserProjectStatementsInput } from '@/services/organization/project/statement/listOrganizationProjectStatements'
import type { CreateOrganizationProjectInput as CreateProjectInput } from '@/services/organization/project/createOrganizationProject'
import type { UpdateOrganizationProjectInput as UpdateProjectInput } from '@/services/organization/project/updateOrganizationProject'
import type { DeleteOrganizationProjectInput as DeleteProjectInput } from '@/services/organization/project/deleteOrganizationProject'
import type { UpdateOrganizationProjectConfigurationInput as UpdateProjectConfigInput } from '@/services/organization/project/configuration/updateOrganizationProjectConfiguration'

export type { Project, ProjectConfig, ProjectMember, UserProjectStatement } from '@/schemas'
export type { CreateOrganizationProjectInput as CreateProjectInput } from '@/services/organization/project/createOrganizationProject'

export type GetOrganizationUserProjectStatementsParameters = ListUserProjectStatementsInput

export async function listOrganizationUserProjectStatements(
  organizationName: string,
  parameters?: GetOrganizationUserProjectStatementsParameters
) {
  const query: Record<string, string> = {}
  if (parameters?.limit != null) query.limit = String(parameters.limit)
  if (parameters?.offset != null) query.offset = String(parameters.offset)
  if (parameters?.filter) query.filter = parameters.filter
  const { data } = await api.get<PaginatedResponse<UserProjectStatement>>(
    `/organizations/${organizationName}/projects`,
    { params: query }
  )
  return data
}

export async function getOrganizationProject(
  organizationName: string,
  projectId: string
) {
  const { data } = await api.get<Project>(
    `/organizations/${organizationName}/projects/${projectId}`
  )
  return data
}

export async function createOrganizationProject(
  organizationName: string,
  body: CreateProjectInput
) {
  const { data } = await api.post<Project>(
    `/organizations/${organizationName}/projects`,
    body
  )
  return data
}

export async function updateOrganizationProject(
  organizationName: string,
  { id: projectId, ...body }: UpdateProjectInput
) {
  const { data } = await api.patch<Project>(
    `/organizations/${organizationName}/projects/${projectId}`,
    body
  )
  return data
}

export async function deleteOrganizationProject(
  organizationName: string,
  { id: projectId }: DeleteProjectInput
) {
  await api.delete(
    `/organizations/${organizationName}/projects/${projectId}`
  )
}

export async function getOrganizationProjectConfig(
  organizationName: string,
  projectId: string
) {
  const { data } = await api.get<ProjectConfig>(
    `/organizations/${organizationName}/projects/${projectId}/configuration`
  )
  return data
}

export async function updateOrganizationProjectConfig(
  organizationName: string,
  { id: projectId, ...body }: UpdateProjectConfigInput
) {
  const { data } = await api.patch<ProjectConfig>(
    `/organizations/${organizationName}/projects/${projectId}/configuration`,
    body
  )
  return data
}

export async function listOrganizationProjectMembers(
  organizationName: string,
  projectId: string
) {
  const { data } = await api.get<{ items: ProjectMember[] }>(
    `/organizations/${organizationName}/projects/${projectId}/members`
  )
  return data
}
