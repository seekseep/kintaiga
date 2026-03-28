import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationActivities,
  getOrganizationActivity,
  createOrganizationActivity,
  updateOrganizationActivity,
  deleteOrganizationActivity,
  type CreateActivityInput,
} from '@/api/organization/project/activitiy'
import type { UpdateOrganizationProjectMemberActivityInput as UpdateActivityInput } from '@/services/organization/project/member/activity/updateOrganizationProjectMemberActivity'
import type { DeleteOrganizationProjectMemberActivityInput as DeleteActivityInput } from '@/services/organization/project/member/activity/deleteOrganizationProjectMemberActivity'
import { activityKeys, type ActivityFilters } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useActivities(filters?: ActivityFilters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: activityKeys.list(organizationName, filters),
    queryFn: () => listOrganizationActivities(organizationName, { ...filters, limit: 200 }),
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
    queryFn: () => getOrganizationActivity(organizationName, id),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  })
}

export function useCreateActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateActivityInput) => createOrganizationActivity(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}

export function useUpdateActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateActivityInput) => updateOrganizationActivity(organizationName, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}

export function useDeleteActivity() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteActivityInput) => deleteOrganizationActivity(organizationName, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(organizationName) })
    },
  })
}
