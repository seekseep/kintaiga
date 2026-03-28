import { api } from '@/lib/api'
import type { PaginatedResponse, Assignment } from '@/schemas'
import type { ListAssignmentsInput } from '@/services/assignments/listAssignments'
import type { CreateAssignmentInput } from '@/services/assignments/createAssignment'
import type { UpdateAssignmentInput } from '@/services/assignments/updateAssignment'

export type { Assignment } from '@/schemas'
export type { CreateAssignmentInput } from '@/services/assignments/createAssignment'
export type { UpdateAssignmentInput } from '@/services/assignments/updateAssignment'
export type UpdateAssignmentBody = Omit<UpdateAssignmentInput, 'id'>

export type GetAssignmentsParams = Partial<Omit<ListAssignmentsInput, 'active'>> & {
  active?: boolean
}

export async function getAssignments(organizationName: string, params?: GetAssignmentsParams) {
  const query: Record<string, string> = {}
  if (params?.projectId) query.projectId = params.projectId
  if (params?.userId) query.userId = params.userId
  if (params?.active != null) query.active = String(params.active)
  if (params?.limit != null) query.limit = String(params.limit)
  if (params?.offset != null) query.offset = String(params.offset)
  const r = await api.get<PaginatedResponse<Assignment>>(`/organizations/${organizationName}/assignments`, { params: query })
  return r.data
}

export async function getAssignment(organizationName: string, id: string) {
  const r = await api.get<Assignment>(`/organizations/${organizationName}/assignments/${id}`)
  return r.data
}

export async function createAssignment(organizationName: string, body: CreateAssignmentInput) {
  const r = await api.post<Assignment>(`/organizations/${organizationName}/assignments`, body)
  return r.data
}

export async function updateAssignment(organizationName: string, id: string, body: UpdateAssignmentBody) {
  const r = await api.patch<Assignment>(`/organizations/${organizationName}/assignments/${id}`, body)
  return r.data
}

export async function deleteAssignment(organizationName: string, id: string) {
  await api.delete(`/organizations/${organizationName}/assignments/${id}`)
  return undefined
}
