import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getSearchParams } from '@/lib/api-server/search-params'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listUserProjectStatements } from '@/services/projects'

export const GET = withErrorHandler(withAuth(async (req, executor) => {
  const params = getSearchParams(req, [
    { key: 'filter', type: 'string' },
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listUserProjectStatements({ db }, executor, params)
  return Response.json(result)
}))
