import { db } from '@/lib/api-server/db'
import { withErrorHandler } from '@/lib/api-server/middlewares/with-error-handler'
import { getReportByPublicId } from '@/services/reports'

export const GET = withErrorHandler(async (_req: Request, context: { params: Promise<Record<string, string>> }) => {
  const { publicId } = await context.params
  const result = await getReportByPublicId({ db }, publicId)
  return Response.json(result)
})
