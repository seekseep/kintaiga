import { api } from '@/lib/api'
import type { User } from './users'
import type { CreateProfileInput } from '@/services/me/createProfile'
import type { UpdateProfileInput } from '@/services/me/updateProfile'
import type { UpdateIconInput } from '@/services/me/updateIcon'

export type { CreateProfileInput } from '@/services/me/createProfile'
export type { UpdateProfileInput } from '@/services/me/updateProfile'
export type { UpdateIconInput } from '@/services/me/updateIcon'
export type RegisterMeBody = Omit<CreateProfileInput, 'sub'>

export async function getMe() {
  const r = await api.get<User>('/me')
  return r.data
}

export async function registerMe(body: RegisterMeBody) {
  const r = await api.post<User>('/me', body)
  return r.data
}

export async function updateMe(body: UpdateProfileInput) {
  const r = await api.patch<User>('/me', body)
  return r.data
}

export async function uploadMyIcon(body: UpdateIconInput) {
  const r = await api.post<User>('/me/icon', body)
  return r.data
}

export async function withdrawMe() {
  const r = await api.post('/me/withdraw')
  return r.data
}
