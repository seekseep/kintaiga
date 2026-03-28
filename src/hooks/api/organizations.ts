import { useQuery, useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  getMyOrganizations,
  getOrganization,
  createOrganization,
  getOrganizationMembers,
  updateOrganization,
  deleteOrganization,
  type Organization,
} from '@/api/organizations'
import type { CreateOrganizationInput } from '@/services/organizations/createOrganization'
import { useOrganization } from '@/contexts/organization-context'
import { meKeys, organizationKeys } from '@/lib/query-keys'

export function useOrganizationDetail(organizationName: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationName),
    queryFn: () => getOrganization(organizationName),
  })
}

export function useMyOrganizations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meKeys.organizations(),
    queryFn: getMyOrganizations,
    ...options,
  })
}

export function useCreateOrganization(
  options?: Omit<UseMutationOptions<Organization, Error, CreateOrganizationInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrganizationInput) => createOrganization(body),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: meKeys.organizations() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useOrganizationMembers(organizationName: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.members(organizationName),
    queryFn: () => getOrganizationMembers(organizationName),
    ...options,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { name: organizationName } = useOrganization()
  return useMutation({
    mutationFn: (body: { name?: string; displayName?: string }) => updateOrganization(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationName) })
      queryClient.invalidateQueries({ queryKey: meKeys.organizations() })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  const { name: organizationName } = useOrganization()
  return useMutation({
    mutationFn: () => deleteOrganization(organizationName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.organizations() })
    },
  })
}
