import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserProjectStatements,
  getProject,
  getProjectConfig,
  getProjectMembers,
  createProject,
  updateProject,
  deleteProject,
  type CreateProjectInput,
  type UpdateProjectBody,
  type GetUserProjectStatementsParams,
} from '@/api/projects'
import { ApiError } from '@/lib/api'
import { projectKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useUserProjectStatements(params?: GetUserProjectStatementsParams, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.statement(organizationName, params),
    queryFn: () => getUserProjectStatements(organizationName, params),
    ...options,
  })
}

export function useProject(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.detail(organizationName, id),
    queryFn: () => getProject(organizationName, id),
    ...options,
  })
}

export function useProjectConfig(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.config(organizationName, id),
    queryFn: async () => {
      try {
        return await getProjectConfig(organizationName, id)
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
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.members(organizationName, id),
    queryFn: () => getProjectMembers(organizationName, id),
    ...options,
  })
}

export function useCreateProject() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectInput) => createProject(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.statements(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(organizationName) })
    },
  })
}

export function useUpdateProject() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectBody }) => updateProject(organizationName, id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.config(organizationName, id) })
    },
  })
}

export function useDeleteProject() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(organizationName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all(organizationName) })
    },
  })
}
