import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getSearchParameters } from '@/lib/api-server/search-parameters'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listUsers, createUser } from '@/services/user'
import { addOrganizationMember } from '@/services/organization'

export const GET = withErrorHandler(withOrganization(async (req, executor) => {
  const parameters = getSearchParameters(req, [
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listUsers({ db }, executor, parameters)
  return Response.json(result)
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  if (body.email) {
    const created = await addOrganizationMember({ db }, executor, body)
    return Response.json(created, { status: 201 })
  }
  const created = await createUser({ db, supabase }, executor, body)
  return Response.json(created, { status: 201 })
}))
