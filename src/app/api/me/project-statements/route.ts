import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { listUserProjectStatements } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const params = {
    filter: url.searchParams.get('filter') ?? undefined,
    limit,
    offset,
  }
  const { items, total } = await listUserProjectStatements({ db }, { type: 'user', user }, params)
  return Response.json(paginatedResponse(items, total, { limit, offset }))
}))
