import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters } from '@/lib/api-server/search-parameters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listOrganizationProjectMembers } from '@/services/organization/project/member'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const parameters = getSearchParameters(req, [
    { key: 'projectId', type: 'string' },
    { key: 'userId', type: 'string' },
    { key: 'active', type: 'string' },
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listOrganizationProjectMembers({ db }, executor, parameters)
  return Response.json(result)
}))
