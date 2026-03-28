import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationUsers,
  getOrganizationUser,
  createOrganizationUser,
  updateOrganizationUser,
  updateOrganizationUserRole,
  deleteOrganizationUser,
  type CreateUserInput,
} from '@/api/organization/members'
import type { UpdateUserInput } from '@/services/user/updateUser'
import type { PaginationParameters } from '@/api/types'
import { userKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useUsers(parameters?: PaginationParameters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: userKeys.list(organizationName, parameters),
    queryFn: () => listOrganizationUsers(organizationName, parameters),
    ...options,
  })
}

export function useUser(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: userKeys.detail(organizationName, id),
    queryFn: () => getOrganizationUser(organizationName, id),
    ...options,
  })
}

export function useCreateUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) => createOrganizationUser(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useUpdateUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateOrganizationUser(organizationName, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useUpdateUserRole() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'general' }) => updateOrganizationUserRole(organizationName, id, { role }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useDeleteUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteOrganizationUser(organizationName, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all(organizationName) })
    },
  })
}
