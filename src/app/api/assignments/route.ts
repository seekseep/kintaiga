import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { CreateAssignmentParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { listAssignments, createAssignment } from '@/services/assignments'

export const GET = withErrorHandler(withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const params = {
    projectId: url.searchParams.get('projectId') ?? undefined,
    userId: url.searchParams.get('userId') ?? undefined,
    active: url.searchParams.get('active') ?? undefined,
    limit,
    offset,
  }
  const { items, total } = await listAssignments({ db }, { type: 'user', user }, params)
  return Response.json(paginatedResponse(items, total, { limit, offset }))
}))

export const POST = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateAssignmentParametersSchema)
  const created = await createAssignment({ db }, { type: 'user', user }, parsed)
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] }))
