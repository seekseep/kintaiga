import { api } from '@/lib/api'
import type { User } from '@/schemas'
import type { CreateUserInput } from '@/services/user/createUser'
import type { UpdateUserInput } from '@/services/user/updateUser'
import type { UpdateUserIconInput } from '@/services/user/updateUserIcon'

export type RegisterMeBody = Omit<CreateUserInput, 'userId'>
export type UpdateMeBody = Omit<UpdateUserInput, 'id'>
export type UploadMyIconBody = Omit<UpdateUserIconInput, 'userId'>

export async function getMe() {
  const r = await api.get<User>('/me')
  return r.data
}

export async function registerMe(body: RegisterMeBody) {
  const r = await api.post<User>('/me', body)
  return r.data
}

export async function updateMe(body: UpdateMeBody) {
  const r = await api.patch<User>('/me', body)
  return r.data
}

export async function uploadMyIcon(body: UploadMyIconBody) {
  const r = await api.post<User>('/me/icon', body)
  return r.data
}

export async function withdrawMe() {
  const r = await api.delete('/me')
  return r.data
}
