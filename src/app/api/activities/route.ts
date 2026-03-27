import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { CreateActivityParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { listActivities, createActivity } from '@/services/activities'

export const GET = withErrorHandler(withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const params = {
    userId: url.searchParams.get('userId') ?? undefined,
    ongoing: url.searchParams.get('ongoing') === 'true',
    projectId: url.searchParams.get('projectId') ?? undefined,
    startDate: url.searchParams.get('startDate') ?? undefined,
    endDate: url.searchParams.get('endDate') ?? undefined,
    limit,
    offset,
  }
  const { items, total } = await listActivities({ db }, { type: 'user', user }, params)
  return Response.json(paginatedResponse(items, total, { limit, offset }))
}))

export const POST = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateActivityParametersSchema)
  const created = await createActivity({ db }, { type: 'user', user }, parsed)
  return Response.json(created, { status: 201 })
}))
