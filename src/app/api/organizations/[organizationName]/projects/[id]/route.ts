import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getProject, updateProject, deleteProject } from '@/services/projects'

export const GET = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  const project = await getProject({ db }, executor, { id })
  return Response.json(project)
}))

export const PATCH = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const updated = await updateProject({ db }, executor, { id, ...body })
  return Response.json(updated)
}))

export const DELETE = withErrorHandler(withOrganization(async (_req, executor, context) => {
  const { id } = await context.params
  await deleteProject({ db }, executor, { id })
  return new Response(null, { status: 204 })
}))
