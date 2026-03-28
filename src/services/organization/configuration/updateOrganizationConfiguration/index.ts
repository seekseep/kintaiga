import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { organizationConfigurations } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import { RoundingDirectionSchema } from '@/schemas/rounding-direction'
import { AggregationUnitSchema } from '@/schemas/aggregation-unit'
import { ROUNDING_INTERVALS } from '@/domain/configuration'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export const UpdateOrganizationConfigurationParametersSchema = z.object({
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).optional(),
  roundingDirection: RoundingDirectionSchema.optional(),
  aggregationUnit: AggregationUnitSchema.optional(),
  aggregationPeriod: z.number().int().min(1).optional(),
})

export type UpdateOrganizationConfigurationInput = z.input<typeof UpdateOrganizationConfigurationParametersSchema>
export type UpdateOrganizationConfigurationParameters = z.output<typeof UpdateOrganizationConfigurationParametersSchema>

export async function updateOrganizationConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationConfigurationInput,
) {
  const result = UpdateOrganizationConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const configRows = await db.select().from(organizationConfigurations)
    .where(eq(organizationConfigurations.organizationId, executor.organization.id))
    .limit(1)
  const config = configRows[0]
  if (!config) throw new NotFoundError()
  const [updated] = await db.update(organizationConfigurations)
    .set({ ...parameters, updatedAt: new Date() })
    .where(eq(organizationConfigurations.id, config.id))
    .returning()
  return updated
}
