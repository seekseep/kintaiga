import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParams } from '@/lib/api-server/search-params'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listActivities, createActivity } from '@/services/activities'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const params = getSearchParams(req, [
    { key: 'userId', type: 'string' },
    { key: 'ongoing', type: 'boolean' },
    { key: 'projectId', type: 'string' },
    { key: 'startDate', type: 'string' },
    { key: 'endDate', type: 'string' },
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listActivities({ db }, executor, params)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await createActivity({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
