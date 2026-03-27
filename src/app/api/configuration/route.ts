import { db } from '@/lib/api-server/db'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getConfiguration, updateConfiguration } from '@/services/configuration'

export const GET = withErrorHandler(withAuth(async (_req, executor) => {
  const config = await getConfiguration({ db }, executor)
  return Response.json(config)
}))

export const PATCH = withErrorHandler(withAuth(async (req, executor) => {
  const body = await req.json()
  const updated = await updateConfiguration({ db }, executor, body)
  return Response.json(updated)
}))
