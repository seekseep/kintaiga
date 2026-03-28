import { db } from '@/lib/api-server/db'
import { withOrganization } from '@/lib/api-server/middlewares/with-organization'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { listOrganizationMemberReports, createOrganizationMemberReport } from '@/services/organization/member/reports'

export const GET = withErrorHandler(withOrganization(async (_req, executor) => {
  const result = await listOrganizationMemberReports({ db }, executor)
  return Response.json({ items: result })
}))

export const POST = withErrorHandler(withOrganization(async (req, executor) => {
  const body = await req.json()
  const created = await createOrganizationMemberReport({ db }, executor, body)
  return Response.json(created, { status: 201 })
}))
