import { api } from '@/lib/api'
import type { PaginatedResponse, ProjectActivity } from '@/schemas'
import type { ListActivitiesInput } from '@/services/activities/listActivities'
import type { CreateActivityInput } from '@/services/activities/createActivity'
import type { UpdateActivityInput } from '@/services/activities/updateActivity'

export type { Activity, ProjectActivity } from '@/schemas'
export type { CreateActivityInput } from '@/services/activities/createActivity'
export type { UpdateActivityInput } from '@/services/activities/updateActivity'
export type UpdateActivityBody = Omit<UpdateActivityInput, 'id'>

export async function getActivities(params?: Partial<ListActivitiesInput>) {
  const query: Record<string, string> = {}
  if (params?.userId) query.userId = params.userId
  if (params?.ongoing) query.ongoing = 'true'
  if (params?.projectId) query.projectId = params.projectId
  if (params?.startDate) query.startDate = params.startDate
  if (params?.endDate) query.endDate = params.endDate
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<ProjectActivity>>('/activities', { params: query })
  return r.data
}

export async function getOngoingActivities() {
  return getActivities({ ongoing: true })
}

export async function getActivity(id: string) {
  const r = await api.get<ProjectActivity>(`/activities/${id}`)
  return r.data
}

export async function createActivity(body: CreateActivityInput) {
  const r = await api.post<ProjectActivity>('/activities', body)
  return r.data
}

export async function updateActivity(id: string, body: UpdateActivityBody) {
  const r = await api.patch<ProjectActivity>(`/activities/${id}`, body)
  return r.data
}

export async function deleteActivity(id: string) {
  await api.delete(`/activities/${id}`)
  return undefined
}
