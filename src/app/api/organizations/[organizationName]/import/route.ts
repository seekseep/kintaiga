import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { ValidationError } from '@/lib/api-server/errors'
import { importOrganization } from '@/services/organization'

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    throw new ValidationError([{ message: 'Invalid request body' }])
  }
  const result = await importOrganization({ db }, executor, body as Parameters<typeof importOrganization>[2])
  return Response.json(result, { status: 201 })
}))
