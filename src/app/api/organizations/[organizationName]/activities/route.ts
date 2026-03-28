import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters } from '@/lib/api-server/search-parameters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listOrganizationProjectMemberActivities, createOrganizationProjectMemberActivity } from '@/services/organization/project/member/activity'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const parameters = getSearchParameters(req, [
    { key: 'userId', type: 'string' },
    { key: 'ongoing', type: 'boolean' },
    { key: 'projectId', type: 'string' },
    { key: 'startDate', type: 'string' },
    { key: 'endDate', type: 'string' },
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listOrganizationProjectMemberActivities({ db }, executor, parameters)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await createOrganizationProjectMemberActivity({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
