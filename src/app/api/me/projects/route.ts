import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { listMyProjects } from '@/services/me'

export const GET = withErrorHandler(withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const { items, total } = await listMyProjects({ db }, { type: 'user', user }, { limit, offset })
  return Response.json(paginatedResponse(items, total, { limit, offset }))
}))
