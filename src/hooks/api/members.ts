import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationMembers,
  getOrganizationMember,
  createOrganizationMember,
  updateOrganizationMember,
  updateOrganizationMemberRole,
  deleteOrganizationMember,
  type CreateUserInput,
} from '@/api/organization/members'
import type { UpdateUserInput } from '@/services/user/updateUser'
import type { PaginationParameters } from '@/api/types'
import { memberKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useMembers(parameters?: PaginationParameters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: memberKeys.list(organizationName, parameters),
    queryFn: () => listOrganizationMembers(organizationName, parameters),
    ...options,
  })
}

export function useMember(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: memberKeys.detail(organizationName, id),
    queryFn: () => getOrganizationMember(organizationName, id),
    ...options,
  })
}

export function useCreateMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) => createOrganizationMember(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists(organizationName) })
    },
  })
}

export function useUpdateMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateOrganizationMember(organizationName, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: memberKeys.lists(organizationName) })
    },
  })
}

export function useUpdateMemberRole() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'manager' | 'worker' }) => updateOrganizationMemberRole(organizationName, id, { role }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: memberKeys.lists(organizationName) })
    },
  })
}

export function useDeleteMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => deleteOrganizationMember(organizationName, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(organizationName) })
    },
  })
}
