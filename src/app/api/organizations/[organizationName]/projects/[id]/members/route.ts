import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters, paginationParameters } from '@/lib/api-server/search-parameters'
import { listOrganizationProjectMembers, addOrganizationProjectMember } from '@/services/organization/project/member'

export const GET = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const parameters = getSearchParameters(req, [
    { key: 'userId', type: 'string' },
    { key: 'active', type: 'string' },
    ...paginationParameters,
  ] as const)
  const result = await listOrganizationProjectMembers({ db }, executor, { projectId: id, ...parameters })
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor, context) => {
  const { id } = await context.params
  const body = await req.json()
  const created = await addOrganizationProjectMember({ db }, executor, { projectId: id, ...body })
  return Response.json(created, { status: 201 })
}))
