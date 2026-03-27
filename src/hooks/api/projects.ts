import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserProjectStatements,
  getProject,
  getProjectConfig,
  getProjectMembers,
  createProject,
  updateProject,
  deleteProject,
  type CreateProjectBody,
  type UpdateProjectBody,
  type GetUserProjectStatementsParams,
} from '@/api/projects'
import { ApiError } from '@/lib/api'
import { projectKeys } from '@/lib/query-keys'

export function useUserProjectStatements(params?: GetUserProjectStatementsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.statement(params),
    queryFn: () => getUserProjectStatements(params),
    ...options,
  })
}

export function useProject(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    ...options,
  })
}

export function useProjectConfig(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.config(id),
    queryFn: async () => {
      try {
        return await getProjectConfig(id)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 1
    },
    ...options,
  })
}

export function useProjectMembers(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => getProjectMembers(id),
    ...options,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectBody) => createProject(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.statements() })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectBody }) => updateProject(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.config(id) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
