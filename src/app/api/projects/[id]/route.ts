import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateProjectParametersSchema } from '@db/validation'
import { getProject, updateProject, deleteProject } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  const project = await getProject({ db }, { type: 'user', user }, { id })
  return Response.json(project)
}))

export const PATCH = withErrorHandler(withAuth(async (req, user, context) => {
  const { id } = await context.params
  const parsed = await parseBody(req, UpdateProjectParametersSchema)
  const updated = await updateProject({ db }, { type: 'user', user }, { id, ...parsed })
  return Response.json(updated)
}, { roles: ['admin'] }))

export const DELETE = withErrorHandler(withAuth(async (_req, user, context) => {
  const { id } = await context.params
  await deleteProject({ db }, { type: 'user', user }, { id })
  return new Response(null, { status: 204 })
}, { roles: ['admin'] }))
