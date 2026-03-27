import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { createProject } from '@/services/projects'

export const POST = withErrorHandler(withAuth(async (req, executor) => {
  const body = await req.json()
  const created = await createProject({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
