import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  type CreateAssignmentInput,
  type UpdateAssignmentBody,
  type GetAssignmentsParams,
} from '@/api/assignments'
import { assignmentKeys, projectKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useAssignments(params?: GetAssignmentsParams, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: assignmentKeys.list(organizationName, params),
    queryFn: () => getAssignments(organizationName, params),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useCreateAssignment() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAssignmentInput) => createAssignment(organizationName, body),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
    },
  })
}

export function useUpdateAssignment() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body, projectId }: { id: string; body: UpdateAssignmentBody; projectId: string }) =>
      updateAssignment(organizationName, id, body),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
    },
  })
}

export function useDeleteAssignment() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => deleteAssignment(organizationName, id),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
    },
  })
}
