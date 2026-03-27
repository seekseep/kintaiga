import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConfiguration,
  updateConfiguration,
  type UpdateConfigurationBody,
} from '@/api/configurations'
import { configurationKeys, projectKeys } from '@/lib/query-keys'

export function useConfiguration(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: configurationKeys.detail(),
    queryFn: getConfiguration,
    staleTime: 10 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    ...options,
  })
}

export function useUpdateConfiguration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateConfigurationBody) => updateConfiguration(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configurationKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
