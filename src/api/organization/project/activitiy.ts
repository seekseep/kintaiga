import { api } from '@/lib/api'
import type { PaginatedResponse, ProjectActivity } from '@/schemas'
import type { ListOrganizationProjectMemberActivitiesInput as ListActivitiesInput } from '@/services/organization/project/member/activity/listOrganizationProjectMemberActivities'
import type { CreateOrganizationProjectMemberActivityInput as CreateActivityInput } from '@/services/organization/project/member/activity/createOrganizationProjectMemberActivity'
import type { UpdateOrganizationProjectMemberActivityInput as UpdateActivityInput } from '@/services/organization/project/member/activity/updateOrganizationProjectMemberActivity'
import { DeleteOrganizationProjectMemberActivityInput as DeleteActivityInput } from '@/services/organization/project/member/activity/deleteOrganizationProjectMemberActivity'

export type { Activity, ProjectActivity } from '@/schemas'
export type { CreateOrganizationProjectMemberActivityInput as CreateActivityInput } from '@/services/organization/project/member/activity/createOrganizationProjectMemberActivity'

export async function listOrganizationActivities(
  organizationName: string,
  parameters?: ListActivitiesInput
) {
  const query: Record<string, string> = {}
  if (parameters?.userId) query.userId = parameters.userId
  if (parameters?.ongoing) query.ongoing = 'true'
  if (parameters?.projectId) query.projectId = parameters.projectId
  if (parameters?.startDate) query.startDate = parameters.startDate
  if (parameters?.endDate) query.endDate = parameters.endDate
  if (parameters?.limit != null) query.limit = String(parameters.limit)
  if (parameters?.offset != null) query.offset = String(parameters.offset)
  const { data } = await api.get<PaginatedResponse<ProjectActivity>>(
    `/organizations/${organizationName}/activities`,
    {
      params: query
    }
  )
  return data
}

export async function getOrganizationActivity(
  organizationName: string,
  activityId: string
) {
  const { data } = await api.get<ProjectActivity>(
    `/organizations/${organizationName}/activities/${activityId}`
  )
  return data
}

export async function createOrganizationActivity(
  organizationName: string,
  body: CreateActivityInput
) {
  const { data } = await api.post<ProjectActivity>(
    `/organizations/${organizationName}/activities`,
    body
  )
  return data
}

export async function updateOrganizationActivity(
  organizationName: string,
  { id: activityId , ...body }: UpdateActivityInput
) {
  const { data } = await api.patch<ProjectActivity>(
    `/organizations/${organizationName}/activities/${activityId}`,
    body
  )
  return data
}

export async function deleteOrganizationActivity(
  organizationName: string,
  { id: activityId }: DeleteActivityInput
) {
  await api.delete(
    `/organizations/${organizationName}/activities/${activityId}`
  )
}
