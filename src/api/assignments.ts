import { api } from '@/lib/api'
import type { PaginatedResponse, PaginationParams } from './types'

export type Assignment = {
  id: string
  projectId: string
  userId: string
  startedAt: string
  endedAt: string | null
  createdAt: string
}

export type CreateAssignmentBody = {
  projectId: string
  userId: string
  startedAt?: string
}

export type UpdateAssignmentBody = {
  endedAt?: string | null
}

export type GetAssignmentsParams = {
  projectId?: string
  userId?: string
  active?: boolean
} & PaginationParams

export function getAssignments(params?: GetAssignmentsParams) {
  const query: Record<string, string> = {}
  if (params?.projectId) query.projectId = params.projectId
  if (params?.userId) query.userId = params.userId
  if (params?.active != null) query.active = String(params.active)
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  return api.get<PaginatedResponse<Assignment>>('/assignments', { params: query }).then(r => r.data)
}

export function getAssignment(id: string) {
  return api.get<Assignment>(`/assignments/${id}`).then(r => r.data)
}

export function createAssignment(body: CreateAssignmentBody) {
  return api.post<Assignment>('/assignments', body).then(r => r.data)
}

export function updateAssignment(id: string, body: UpdateAssignmentBody) {
  return api.patch<Assignment>(`/assignments/${id}`, body).then(r => r.data)
}

export function deleteAssignment(id: string) {
  return api.delete(`/assignments/${id}`).then(() => undefined)
}
