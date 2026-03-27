import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { CreateProjectParametersSchema } from '@db/validation'
import { createProject } from '@/services/projects'

export const POST = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateProjectParametersSchema)
  const created = await createProject({ db }, { type: 'user', user }, parsed)
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] }))
