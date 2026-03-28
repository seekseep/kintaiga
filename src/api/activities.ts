import { api } from '@/lib/api'
import type { PaginatedResponse, ProjectActivity } from '@/schemas'
import type { ListActivitiesInput } from '@/services/activities/listActivities'
import type { CreateActivityInput } from '@/services/activities/createActivity'
import type { UpdateActivityInput } from '@/services/activities/updateActivity'

export type { Activity, ProjectActivity } from '@/schemas'
export type { CreateActivityInput } from '@/services/activities/createActivity'
export type { UpdateActivityInput } from '@/services/activities/updateActivity'
export type UpdateActivityBody = Omit<UpdateActivityInput, 'id'>

export async function getActivities(organizationName: string, params?: Partial<ListActivitiesInput>) {
  const query: Record<string, string> = {}
  if (params?.userId) query.userId = params.userId
  if (params?.ongoing) query.ongoing = 'true'
  if (params?.projectId) query.projectId = params.projectId
  if (params?.startDate) query.startDate = params.startDate
  if (params?.endDate) query.endDate = params.endDate
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<ProjectActivity>>(`/organizations/${organizationName}/activities`, { params: query })
  return r.data
}

export async function getOngoingActivities(organizationName: string) {
  return getActivities(organizationName, { ongoing: true })
}

export async function getActivity(organizationName: string, id: string) {
  const r = await api.get<ProjectActivity>(`/organizations/${organizationName}/activities/${id}`)
  return r.data
}

export async function createActivity(organizationName: string, body: CreateActivityInput) {
  const r = await api.post<ProjectActivity>(`/organizations/${organizationName}/activities`, body)
  return r.data
}

export async function updateActivity(organizationName: string, id: string, body: UpdateActivityBody) {
  const r = await api.patch<ProjectActivity>(`/organizations/${organizationName}/activities/${id}`, body)
  return r.data
}

export async function deleteActivity(organizationName: string, id: string) {
  await api.delete(`/organizations/${organizationName}/activities/${id}`)
  return undefined
}
