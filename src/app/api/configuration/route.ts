import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { UpdateConfigurationParametersSchema } from '@db/validation'
import { getConfiguration, updateConfiguration } from '@/services/configuration'

export const GET = withErrorHandler(withAuth(async (_req, user) => {
  const config = await getConfiguration({ db }, { type: 'user', user })
  return Response.json(config)
}))

export const PATCH = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, UpdateConfigurationParametersSchema)
  const updated = await updateConfiguration({ db }, { type: 'user', user }, parsed)
  return Response.json(updated)
}, { roles: ['admin'] }))
