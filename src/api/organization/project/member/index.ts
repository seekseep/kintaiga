import { api } from '@/lib/api'
import type { PaginatedResponse, ProjectAssignment } from '@/schemas'
import type { ListOrganizationProjectMembersInput as ListProjectMembersInput } from '@/services/organization/project/member/listOrganizationProjectMembers'
import type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'
import type { UpdateOrganizationProjectMemberInput as UpdateProjectMemberInput } from '@/services/organization/project/member/updateOrganizationProjectMember'
import type { RemoveOrganizationProjectMemberInput as DeleteProjectMemberInput } from '@/services/organization/project/member/removeOrganizationProjectMember'

export type { ProjectAssignment } from '@/schemas'
export type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'

export type ListOrganizationProjectMembersParameters = Partial<Omit<ListProjectMembersInput, 'active' | 'projectId'>> & {
  projectId: string
  active?: boolean
}

export async function listOrganizationProjectMembers(
  organizationName: string,
  parameters: ListOrganizationProjectMembersParameters
) {
  const { projectId, ...rest } = parameters
  const query: Record<string, string> = {}
  if (rest.userId) query.userId = rest.userId
  if (rest.active != null) query.active = String(rest.active)
  if (rest.limit != null) query.limit = String(rest.limit)
  if (rest.offset != null) query.offset = String(rest.offset)
  const { data } = await api.get<PaginatedResponse<ProjectAssignment>>(
    `/organizations/${organizationName}/projects/${projectId}/members`,
    { params: query }
  )
  return data
}

export async function getOrganizationProjectMember(
  organizationName: string,
  projectId: string,
  projectMemberId: string
) {
  const { data } = await api.get<ProjectAssignment>(
    `/organizations/${organizationName}/projects/${projectId}/members/${projectMemberId}`
  )
  return data
}

export async function createOrganizationProjectMember(
  organizationName: string,
  body: CreateProjectMemberInput
) {
  const { projectId, ...rest } = body
  const { data } = await api.post<ProjectAssignment>(
    `/organizations/${organizationName}/projects/${projectId}/members`,
    rest
  )
  return data
}

export async function updateOrganizationProjectMember(
  organizationName: string,
  projectId: string,
  { id: projectMemberId, ...body }: UpdateProjectMemberInput
) {
  const { data } = await api.patch<ProjectAssignment>(
    `/organizations/${organizationName}/projects/${projectId}/members/${projectMemberId}`,
    body
  )
  return data
}

export async function deleteOrganizationProjectMember(
  organizationName: string,
  { id: projectMemberId, projectId }: DeleteProjectMemberInput & { projectId: string }
) {
  await api.delete(
    `/organizations/${organizationName}/projects/${projectId}/members/${projectMemberId}`
  )
}
