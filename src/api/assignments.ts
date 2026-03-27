import { api } from '@/lib/api'
import type { PaginatedResponse, Assignment, CreateAssignmentBody, UpdateAssignmentBody } from '@/schemas'
import type { ListAssignmentsInput } from '@/services/assignments/listAssignments'

export type { Assignment, CreateAssignmentBody, UpdateAssignmentBody } from '@/schemas'

export type GetAssignmentsParams = Partial<Omit<ListAssignmentsInput, 'active'>> & {
  active?: boolean
}

export async function getAssignments(params?: GetAssignmentsParams) {
  const query: Record<string, string> = {}
  if (params?.projectId) query.projectId = params.projectId
  if (params?.userId) query.userId = params.userId
  if (params?.active != null) query.active = String(params.active)
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<Assignment>>('/assignments', { params: query })
  return r.data
}

export async function getAssignment(id: string) {
  const r = await api.get<Assignment>(`/assignments/${id}`)
  return r.data
}

export async function createAssignment(body: CreateAssignmentBody) {
  const r = await api.post<Assignment>('/assignments', body)
  return r.data
}

export async function updateAssignment(id: string, body: UpdateAssignmentBody) {
  const r = await api.patch<Assignment>(`/assignments/${id}`, body)
  return r.data
}

export async function deleteAssignment(id: string) {
  await api.delete(`/assignments/${id}`)
  return undefined
}
