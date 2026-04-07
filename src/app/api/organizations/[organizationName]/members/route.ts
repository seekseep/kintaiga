import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters, paginationParameters } from '@/lib/api-server/search-parameters'
import { listOrganizationMembers, addOrganizationMember } from '@/services/organization'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const parameters = getSearchParameters(req, paginationParameters)
  const result = await listOrganizationMembers({ db }, executor, parameters)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await addOrganizationMember({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
