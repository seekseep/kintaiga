import { api } from '@/lib/api'
import type { User } from './users'
import type { RegisterMeBody, UpdateMeBody, UploadIconBody } from '@/schemas'

export type { RegisterMeBody, UpdateMeBody, UploadIconBody } from '@/schemas'

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

export async function uploadMyIcon(body: UploadIconBody) {
  const r = await api.post<User>('/me/icon', body)
  return r.data
}

export async function withdrawMe() {
  const r = await api.post('/me/withdraw')
  return r.data
}
