import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { reports } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const DeleteReportParametersSchema = z.object({
  id: z.string(),
})

export type DeleteReportInput = z.input<typeof DeleteReportParametersSchema>

export async function deleteReport(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: DeleteReportInput,
) {
  const result = DeleteReportParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isOrganizationManagerOrAbove(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(reports)
    .where(and(eq(reports.id, parameters.id), eq(reports.organizationId, executor.organization.id)))
    .returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
