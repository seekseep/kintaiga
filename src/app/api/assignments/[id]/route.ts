import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getAssignment, updateAssignment, deleteAssignment } from '@/services/assignments'

export const GET = withErrorHandler(withAuth(async (_req, executor, context) => {
  const { id } = await context.params
  const assignment = await getAssignment({ db }, executor, { id })
  return Response.json(assignment)
}))

export const PATCH = withErrorHandler(withAuth(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateAssignment({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withAuth(async (_req, executor, context) => {
  const { id } = await context.params
  await deleteAssignment({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
