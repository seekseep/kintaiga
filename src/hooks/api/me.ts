import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMe,
  registerMe,
  updateMe,
  uploadMyIcon,
  withdrawMe,
  type RegisterMeBody,
  type UpdateProfileInput,
  type UpdateIconInput,
} from '@/api/me'
import {
  listMyTokens,
  createMyToken,
  revokeMyToken,
  type CreateMyTokenInput,
} from '@/api/me/tokens'
import { meKeys } from '@/lib/query-keys'

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meKeys.profile(),
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    ...options,
  })
}

export function useRegisterMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RegisterMeBody) => registerMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all })
    },
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileInput) => updateMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all })
    },
  })
}

export function useUploadMyIcon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateIconInput) => uploadMyIcon(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all })
    },
  })
}

export function useWithdrawMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => withdrawMe(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useMyTokens() {
  return useQuery({
    queryKey: meKeys.tokens(),
    queryFn: listMyTokens,
  })
}

export function useCreateMyToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMyTokenInput) => createMyToken(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.tokens() })
    },
  })
}

export function useRevokeMyToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeMyToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.tokens() })
    },
  })
}
