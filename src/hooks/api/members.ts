import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationMembers,
  getOrganizationMember,
  updateOrganizationMemberRole,
  deleteOrganizationMember,
  addOrganizationMember,
} from '@/api/organization/members'
import type { AddOrganizationMemberInput } from '@/services/organization/member/addOrganizationMember'
import type { PaginationParameters } from '@/api/types'
import { memberKeys, organizationKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useMembers(parameters?: PaginationParameters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: memberKeys.list(organizationName, parameters),
    queryFn: () => listOrganizationMembers({ organizationName, parameters }),
    ...options,
  })
}

export function useMember(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: memberKeys.detail(organizationName, id),
    queryFn: () => getOrganizationMember({ organizationName, memberId: id }),
    ...options,
  })
}

export function useAddMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddOrganizationMemberInput) =>
      addOrganizationMember({ organizationName, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationName) })
    },
  })
}

export function useUpdateMemberRole() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'manager' | 'worker' }) =>
      updateOrganizationMemberRole({ organizationName, memberId: id, body: { role } }),
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
    mutationFn: (memberId: string) => deleteOrganizationMember({ organizationName, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(organizationName) })
    },
  })
}
