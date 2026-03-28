import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  type CreateActivityInput,
  type UpdateActivityBody,
} from '@/api/activities'
import { activityKeys, type ActivityFilters } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useActivities(filters?: ActivityFilters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: activityKeys.list(organizationName, filters),
    queryFn: () => getActivities(organizationName, { ...filters, limit: 200 }),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  })
}

export function useOngoingActivities(options?: { enabled?: boolean }) {
  return useActivities({ ongoing: true }, options)
}

export function useActivity(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: activityKeys.detail(organizationName, id),
    queryFn: () => getActivity(organizationName, id),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  })
}

export function useCreateActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateActivityInput) => createActivity(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}

export function useUpdateActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateActivityBody }) => updateActivity(organizationName, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}

export function useDeleteActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteActivity(organizationName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}
