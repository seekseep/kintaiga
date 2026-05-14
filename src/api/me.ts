'use server'

import { db } from '@/lib/db'
import { supabase as adminSupabase } from '@/lib/supabase-admin'
import { getUserExecutor } from '@/lib/server-action/auth'
import { NotFoundError } from '@/lib/errors'
import {
  archiveAndDeleteUser,
  createUser,
  getUser,
  syncUserEmail,
  updateUser,
  updateUserIcon,
} from '@/services/user'
import type { CreateUserInput } from '@/services/user/createUser'
import type { UpdateUserInput } from '@/services/user/updateUser'
import type { UpdateUserIconInput } from '@/services/user/updateUserIcon'
import type { Member } from '@/schemas'

export type RegisterMeBody = Omit<CreateUserInput, 'userId'>
export type UpdateMeBody = Omit<UpdateUserInput, 'id'>
export type UploadMyIconBody = Omit<UpdateUserIconInput, 'userId'>

type UserRow = {
  id: string
  email: string | null
  name: string
  role: Member['role']
  iconUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

function toMember(row: UserRow): Member {
  return {
    id: row.id,
    userId: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    iconUrl: row.iconUrl,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  }
}

export async function getMe(): Promise<Member | null> {
  const executor = await getUserExecutor()
  try {
    const user = await getUser({ db }, executor, { id: executor.user.id })
    return toMember(user)
  } catch (err) {
    if (err instanceof NotFoundError) return null
    throw err
  }
}

export async function registerMe(body: RegisterMeBody): Promise<Member> {
  const executor = await getUserExecutor()
  const user = await createUser(
    { db, supabase: adminSupabase },
    executor,
    { ...body, userId: executor.user.id },
  )
  return toMember(user)
}

export async function updateMe(body: UpdateMeBody): Promise<Member> {
  const executor = await getUserExecutor()
  const user = await updateUser({ db }, executor, { ...body, id: executor.user.id })
  return toMember(user)
}

export async function uploadMyIcon(body: UploadMyIconBody): Promise<Member> {
  const executor = await getUserExecutor()
  const user = await updateUserIcon(
    { db, supabase: adminSupabase },
    executor,
    { ...body, userId: executor.user.id },
  )
  return toMember(user)
}

export async function withdrawMe(): Promise<void> {
  const executor = await getUserExecutor()
  await archiveAndDeleteUser(
    { db, supabase: adminSupabase },
    executor,
    { targetId: executor.user.id, anonymizeName: '削除されたユーザー' },
  )
}

export async function syncMyEmail(): Promise<{ email: string | null }> {
  const executor = await getUserExecutor()
  const updated = await syncUserEmail(
    { db, supabase: adminSupabase },
    executor,
    { userId: executor.user.id },
  )
  return { email: updated.email }
}
