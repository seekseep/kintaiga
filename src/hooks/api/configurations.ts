import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConfiguration,
  updateConfiguration,
  type UpdateConfigurationInput,
} from '@/api/configurations'
import { configurationKeys, projectKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useConfiguration(options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: configurationKeys.detail(organizationName),
    queryFn: () => getConfiguration(organizationName),
    staleTime: 10 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    ...options,
  })
}

export function useUpdateConfiguration() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateConfigurationInput) => updateConfiguration(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configurationKeys.all(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.all(organizationName) })
    },
  })
}
