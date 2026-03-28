import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters } from '@/lib/api-server/search-parameters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listOrganizationProjectStatements, createOrganizationProject } from '@/services/organization/project'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const parameters = getSearchParameters(req, [
    { key: 'filter', type: 'string' },
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listOrganizationProjectStatements({ db }, executor, parameters)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await createOrganizationProject({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
