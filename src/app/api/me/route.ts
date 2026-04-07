import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withUser } from '@/lib/api-server/middlewares/with-user'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { archiveAndDeleteUser, createUser, getUser, updateUser } from '@/services/user'

export const GET = withErrorHandler(withUser(async (_req, executor) => {
  const profile = await getUser({ db }, executor, { id: executor.user.id })
  return Response.json(profile)
}))

export const POST = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const created = await createUser({ db, supabase }, executor, { ...body, userId: executor.user.id })
  return Response.json(created, { status: 201 })
}))

export const PATCH = withErrorHandler(withUser(async (req, executor) => {
  const body = await req.json()
  const updated = await updateUser({ db }, executor, { ...body, id: executor.user.id })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withUser(async (_req, executor) => {
  await archiveAndDeleteUser({ db, supabase }, executor, {
    targetId: executor.user.id,
    anonymizeName: '削除されたユーザー',
  })
  return new Response(null, { status: 204 })
}))
