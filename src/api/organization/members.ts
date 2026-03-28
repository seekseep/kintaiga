import { api } from '@/lib/api'
import type { PaginatedResponse, User } from '@/schemas'
import type { ListUsersInput } from '@/services/user/listUsers'
import type { CreateUserInput } from '@/services/user/createUser'
import type { UpdateUserInput } from '@/services/user/updateUser'

export type { User } from '@/schemas'
export type { CreateUserInput } from '@/services/user/createUser'

export async function listOrganizationUsers(
  organizationName: string,
  parameters?: ListUsersInput
) {
  const query: Record<string, string> = {}
  if (parameters?.limit != null) query.limit = String(parameters.limit)
  if (parameters?.offset != null) query.offset = String(parameters.offset)
  const { data } = await api.get<PaginatedResponse<User>>(
    `/organizations/${organizationName}/users`,
    { params: query }
  )
  return data
}

export async function getOrganizationUser(
  organizationName: string,
  userId: string
) {
  const { data } = await api.get<User>(
    `/organizations/${organizationName}/users/${userId}`
  )
  return data
}

export async function createOrganizationUser(
  organizationName: string,
  body: CreateUserInput
) {
  const { data } = await api.post<User>(
    `/organizations/${organizationName}/users`,
    body
  )
  return data
}

export async function updateOrganizationUser(
  organizationName: string,
  { id: userId, ...body }: UpdateUserInput
) {
  const { data } = await api.patch<User>(
    `/organizations/${organizationName}/users/${userId}`,
    body
  )
  return data
}

export async function updateOrganizationUserRole(
  organizationName: string,
  userId: string,
  body: { role: 'admin' | 'general' }
) {
  const { data } = await api.patch<User>(
    `/organizations/${organizationName}/users/${userId}/role`,
    body
  )
  return data
}

export async function deleteOrganizationUser(
  organizationName: string,
  userId: string
) {
  await api.delete(
    `/organizations/${organizationName}/users/${userId}`
  )
}
