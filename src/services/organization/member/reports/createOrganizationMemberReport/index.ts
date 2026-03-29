import { z } from 'zod/v4'
import { nanoid } from 'nanoid'
import { projectActivityReports } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { canCreateReport } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const CreateOrganizationMemberReportParametersSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(1).max(255),
  startDate: z.iso.datetime({ local: true }),
  endDate: z.iso.datetime({ local: true }),
})

export type CreateOrganizationMemberReportInput = z.input<typeof CreateOrganizationMemberReportParametersSchema>

export async function createOrganizationMemberReport(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: CreateOrganizationMemberReportInput,
) {
  const result = CreateOrganizationMemberReportParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canCreateReport(executor)) throw new ForbiddenError('Premiumプランでのみレポートを作成できます')
  const parameters = result.data

  const { db } = dependencies
  const [created] = await db.insert(projectActivityReports).values({
    publicId: nanoid(),
    organizationId: executor.organization.id,
    userId: parameters.userId,
    name: parameters.name,
    startDate: new Date(parameters.startDate),
    endDate: new Date(parameters.endDate),
  }).returning()

  return created
}
