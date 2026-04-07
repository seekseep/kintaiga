import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listOrganizationProjectMembers,
  createOrganizationProjectMember,
  updateOrganizationProjectMember,
  deleteOrganizationProjectMember,
  type CreateProjectMemberInput,
  type ListOrganizationProjectMembersParameters,
} from '@/api/organization/project/member'
import type { UpdateOrganizationProjectMemberInput as UpdateProjectMemberInput } from '@/services/organization/project/member/updateOrganizationProjectMember'
import type { RemoveOrganizationProjectMemberInput as DeleteProjectMemberInput } from '@/services/organization/project/member/removeOrganizationProjectMember'
import { projectMemberKeys, projectKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useProjectMemberAssignments(parameters: ListOrganizationProjectMembersParameters, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: projectMemberKeys.list(organizationName, parameters),
    queryFn: () => listOrganizationProjectMembers(organizationName, parameters),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useCreateProjectMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectMemberInput) => createOrganizationProjectMember(organizationName, body),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectMemberKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.members(organizationName, projectId) })
    },
  })
}

export function useUpdateProjectMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...input }: UpdateProjectMemberInput & { projectId: string }) =>
      updateOrganizationProjectMember(organizationName, projectId, input),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectMemberKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
    },
  })
}

export function useDeleteProjectMember() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...input }: DeleteProjectMemberInput & { projectId: string }) =>
      deleteOrganizationProjectMember(organizationName, { ...input, projectId }),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectMemberKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: projectKeys.assignments(organizationName, projectId) })
    },
  })
}
