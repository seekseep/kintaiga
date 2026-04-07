import { api } from '@/lib/api'
import type { PaginatedResponse, Member } from '@/schemas'
import type { ListOrganizationMembersInput } from '@/services/organization/member/listOrganizationMembers'

export type { Member } from '@/schemas'

export async function listOrganizationMembers(
  organizationName: string,
  parameters?: ListOrganizationMembersInput
) {
  const query: Record<string, string> = {}
  if (parameters?.limit != null) query.limit = String(parameters.limit)
  if (parameters?.offset != null) query.offset = String(parameters.offset)
  const { data } = await api.get<PaginatedResponse<Member>>(
    `/organizations/${organizationName}/members`,
    { params: query }
  )
  return data
}

export async function getOrganizationMember(
  organizationName: string,
  memberId: string
) {
  const { data } = await api.get<Member>(
    `/organizations/${organizationName}/members/${memberId}`
  )
  return data
}

export async function updateOrganizationMemberRole(
  organizationName: string,
  memberId: string,
  body: { role: 'manager' | 'worker' }
) {
  const { data } = await api.patch<Member>(
    `/organizations/${organizationName}/members/${memberId}/role`,
    body
  )
  return data
}

export async function deleteOrganizationMember(
  organizationName: string,
  memberId: string
) {
  await api.delete(
    `/organizations/${organizationName}/members/${memberId}`
  )
}
