import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projectActivityReports } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const DeleteOrganizationMemberReportParametersSchema = z.object({
  id: z.string(),
})

export type DeleteOrganizationMemberReportInput = z.input<typeof DeleteOrganizationMemberReportParametersSchema>

export async function deleteOrganizationMemberReport(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: DeleteOrganizationMemberReportInput,
) {
  const result = DeleteOrganizationMemberReportParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(projectActivityReports)
    .where(and(eq(projectActivityReports.id, parameters.id), eq(projectActivityReports.organizationId, executor.organization.id)))
    .returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
