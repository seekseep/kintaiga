import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  type CreateUserInput,
  type UpdateUserBody,
} from '@/api/users'
import type { PaginationParams } from '@/api/types'
import { userKeys } from '@/lib/query-keys'
import { useOrganization } from '@/contexts/organization-context'

export function useUsers(params?: PaginationParams, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: userKeys.list(organizationName, params),
    queryFn: () => getUsers(organizationName, params),
    ...options,
  })
}

export function useUser(id: string, options?: { enabled?: boolean }) {
  const { name: organizationName } = useOrganization()
  return useQuery({
    queryKey: userKeys.detail(organizationName, id),
    queryFn: () => getUser(organizationName, id),
    ...options,
  })
}

export function useCreateUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) => createUser(organizationName, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useUpdateUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) => updateUser(organizationName, id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useUpdateUserRole() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'general' }) => updateUserRole(organizationName, id, { role }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(organizationName, id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists(organizationName) })
    },
  })
}

export function useDeleteUser() {
  const { name: organizationName } = useOrganization()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(organizationName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all(organizationName) })
    },
  })
}
