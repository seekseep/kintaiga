import { api } from '@/lib/api'
import type { PaginatedResponse, ProjectAssignment } from '@/schemas'
import type { ListOrganizationProjectMembersInput as ListProjectMembersInput } from '@/services/organization/project/member/listOrganizationProjectMembers'
import type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'
import type { UpdateOrganizationProjectMemberInput as UpdateProjectMemberInput } from '@/services/organization/project/member/updateOrganizationProjectMember'
import type { RemoveOrganizationProjectMemberInput as DeleteProjectMemberInput } from '@/services/organization/project/member/removeOrganizationProjectMember'

export type { ProjectAssignment } from '@/schemas'
export type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'

export type ListOrganizationProjectMembersParameters = Partial<Omit<ListProjectMembersInput, 'active'>> & {
  active?: boolean
}

export async function listOrganizationProjectMembers(
  organizationName: string,
  parameters?: ListOrganizationProjectMembersParameters
) {
  const query: Record<string, string> = {}
  if (parameters?.projectId) query.projectId = parameters.projectId
  if (parameters?.userId) query.userId = parameters.userId
  if (parameters?.active != null) query.active = String(parameters.active)
  if (parameters?.limit != null) query.limit = String(parameters.limit)
  if (parameters?.offset != null) query.offset = String(parameters.offset)
  const { data } = await api.get<PaginatedResponse<ProjectAssignment>>(
    `/organizations/${organizationName}/assignments`,
    { params: query }
  )
  return data
}

export async function getOrganizationProjectMember(
  organizationName: string,
  projectMemberId: string
) {
  const { data } = await api.get<ProjectAssignment>(
    `/organizations/${organizationName}/assignments/${projectMemberId}`
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
  { id: projectMemberId, ...body }: UpdateProjectMemberInput
) {
  const { data } = await api.patch<ProjectAssignment>(
    `/organizations/${organizationName}/assignments/${projectMemberId}`,
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
