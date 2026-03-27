import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  type CreateActivityBody,
  type UpdateActivityBody,
} from '@/api/activities'
import { activityKeys, type ActivityFilters } from '@/lib/query-keys'

export function useActivities(filters?: ActivityFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => getActivities({ ...filters, limit: 200 }),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  })
}

export function useOngoingActivities(options?: { enabled?: boolean }) {
  return useActivities({ ongoing: true }, options)
}

export function useActivity(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivity(id),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateActivityBody) => createActivity(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateActivityBody }) => updateActivity(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
    },
  })
}
