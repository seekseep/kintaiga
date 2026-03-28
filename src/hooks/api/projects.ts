import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationUserProjectStatements,
  getOrganizationProject,
  getOrganizationProjectConfig,
  updateOrganizationProjectConfig,
  listOrganizationProjectMembers,
  createOrganizationProject,
  updateOrganizationProject,
  deleteOrganizationProject,
  type CreateProjectInput,
  type GetOrganizationUserProjectStatementsParameters,
} from '@/api/organization/project'
import type { UpdateOrganizationProjectInput as UpdateProjectInput } from '@/services/organization/project/updateOrganizationProject'
import type { UpdateOrganizationProjectConfigurationInput as UpdateProjectConfigInput } from '@/services/organization/project/configuration/updateOrganizationProjectConfiguration'
import type { DeleteOrganizationProjectInput as DeleteProjectInput } from '@/services/organization/project/deleteOrganizationProject'
import { ApiError } from '@/lib/api'
import { projectKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useUserProjectStatements(parameters?: GetOrganizationUserProjectStatementsParameters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.statement(organizationName, parameters),
    queryFn: () => listOrganizationUserProjectStatements(organizationName, parameters),
    ...options,
  })
}

export function useProject(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.detail(organizationName, id),
    queryFn: () => getOrganizationProject(organizationName, id),
    ...options,
  })
}

export function useProjectConfig(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectKeys.config(organizationName, id),
    queryFn: async () => {
      try {
        return await getOrganizationProjectConfig(organizationName, id)
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
    queryFn: () => listOrganizationProjectMembers(organizationName, id),
    ...options,
  })
}

export function useCreateProject() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectInput) => createOrganizationProject(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.statements(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(organizationName) })
    },
  })
}

export function useUpdateProjectConfig() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProjectConfigInput) => updateOrganizationProjectConfig(organizationName, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.config(organizationName, id) })
    },
  })
}

export function useUpdateProject() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateOrganizationProject(organizationName, input),
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
    mutationFn: (input: DeleteProjectInput) => deleteOrganizationProject(organizationName, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all(organizationName) })
    },
  })
}
