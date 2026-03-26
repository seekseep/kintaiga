import { api } from '@/lib/api'

export type Assignment = {
  id: string
  projectId: string
  userId: string
  createdAt: string
}

export type CreateAssignmentBody = {
  projectId: string
  userId: string
}

export type GetAssignmentsParams = {
  projectId?: string
  userId?: string
}

export function getAssignments(params?: GetAssignmentsParams) {
  return api.get<Assignment[]>('/assignments', { params }).then(r => r.data)
}

export function getAssignment(id: string) {
  return api.get<Assignment>(`/assignments/${id}`).then(r => r.data)
}

export function createAssignment(body: CreateAssignmentBody) {
  return api.post<Assignment>('/assignments', body).then(r => r.data)
}

export function deleteAssignment(id: string) {
  return api.delete(`/assignments/${id}`).then(() => undefined)
}
