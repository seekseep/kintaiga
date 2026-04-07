import { api } from '@/lib/api'
import type { PaginatedResponse, Member } from '@/schemas'
import type { ListUsersInput } from '@/services/user/listUsers'
import type { CreateUserInput } from '@/services/user/createUser'
import type { UpdateUserInput } from '@/services/user/updateUser'

export type { Member } from '@/schemas'
/** @deprecated Use Member instead */
export type { User } from '@/schemas'
export type { CreateUserInput } from '@/services/user/createUser'

export async function listOrganizationMembers(
  organizationName: string,
  parameters?: ListUsersInput
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

export async function createOrganizationMember(
  organizationName: string,
  body: CreateUserInput
) {
  const { data } = await api.post<Member>(
    `/organizations/${organizationName}/members`,
    body
  )
  return data
}

export async function updateOrganizationMember(
  organizationName: string,
  { id: memberId, ...body }: UpdateUserInput
) {
  const { data } = await api.patch<Member>(
    `/organizations/${organizationName}/members/${memberId}`,
    body
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
