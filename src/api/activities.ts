import { api } from '@/lib/api'

export type Activity = {
  id: string
  userId: string
  type: string
  startedAt: string
  endedAt: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type CreateActivityBody = {
  type: string
  startedAt: string
  endedAt?: string
  note?: string
}

export type UpdateActivityBody = {
  type?: string
  startedAt?: string
  endedAt?: string | null
  note?: string
}

export function getActivities(userId?: string) {
  return api.get<Activity[]>('/activities', { params: userId ? { userId } : undefined }).then(r => r.data)
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
