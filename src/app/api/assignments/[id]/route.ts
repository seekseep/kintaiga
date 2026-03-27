import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateAssignmentParametersSchema } from '@db/validation'
import { getAssignment, updateAssignment, deleteAssignment } from '@/services/assignments'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const assignment = await getAssignment({ db }, { type: 'user', user }, { id })
  return Response.json(assignment)
}))

export const PATCH = withErrorHandler(withAuth(async (req, user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateAssignmentParametersSchema)
  const updated = await updateAssignment({ db }, { type: 'user', user }, { id, ...parsed })
  return Response.json(updated)
}, { roles: ['admin'] }))

export const DELETE = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  await deleteAssignment({ db }, { type: 'user', user }, { id })
  return new Response(null, { status: 204 })
}, { roles: ['admin'] }))
