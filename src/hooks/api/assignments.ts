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

export function useAssignments(params?: GetAssignmentsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => getAssignments(params),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAssignmentInput) => createAssignment(body),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(projectId) })
    },
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body, projectId }: { id: string; body: UpdateAssignmentBody; projectId: string }) =>
      updateAssignment(id, body),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(projectId) })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => deleteAssignment(id),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(projectId) })
    },
  })
}
