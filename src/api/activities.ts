import { api } from '@/lib/api'
import type { PaginatedResponse, PaginationParams } from './types'

export type Activity = {
  id: string
  userId: string
  projectId: string
  startedAt: string
  endedAt: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  projectName?: string
  userName?: string
}

export type CreateActivityBody = {
  projectId: string
  userId?: string
  startedAt?: string
  note?: string
}

export type UpdateActivityBody = {
  endedAt?: string | null
  note?: string
}

export function getActivities(params?: { userId?: string; ongoing?: boolean; projectId?: string; startDate?: string; endDate?: string } & PaginationParams) {
  const query: Record<string, string> = {}
  if (params?.userId) query.userId = params.userId
  if (params?.ongoing) query.ongoing = 'true'
  if (params?.projectId) query.projectId = params.projectId
  if (params?.startDate) query.startDate = params.startDate
  if (params?.endDate) query.endDate = params.endDate
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  return api.get<PaginatedResponse<Activity>>('/activities', { params: query }).then(r => r.data)
}

export function getOngoingActivities() {
  return getActivities({ ongoing: true })
}

export function getActivity(id: string) {
  return api.get<Activity>(`/activities/${id}`).then(r => r.data)
}

export function createActivity(body: CreateActivityBody) {
  return api.post<Activity>('/activities', body).then(r => r.data)
}

export function updateActivity(id: string, body: UpdateActivityBody) {
  return api.patch<Activity>(`/activities/${id}`, body).then(r => r.data)
}

export function deleteActivity(id: string) {
  return api.delete(`/activities/${id}`).then(() => undefined)
}
