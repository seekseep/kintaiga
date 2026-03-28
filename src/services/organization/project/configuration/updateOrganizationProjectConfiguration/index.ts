import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects, projectConfigurations } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import { RoundingDirectionSchema } from '@/schemas/rounding-direction'
import { AggregationUnitSchema } from '@/schemas/aggregation-unit'
import { ROUNDING_INTERVALS } from '@/domain/configuration'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

export const UpdateOrganizationProjectConfigurationParametersSchema = z.object({
  id: z.string(),
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).nullable().optional(),
  roundingDirection: RoundingDirectionSchema.nullable().optional(),
  aggregationUnit: AggregationUnitSchema.nullable().optional(),
  aggregationPeriod: z.number().int().min(1).nullable().optional(),
})

export type UpdateOrganizationProjectConfigurationInput = z.input<typeof UpdateOrganizationProjectConfigurationParametersSchema>

export async function updateOrganizationProjectConfiguration(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationProjectConfigurationInput,
) {
  const result = UpdateOrganizationProjectConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationProjects(executor)) throw new ForbiddenError()
  const { id, ...updates } = result.data

  const { db } = dependencies

  const [project] = await db.select().from(projects).where(
    and(eq(projects.id, id), eq(projects.organizationId, executor.organization.id))
  ).limit(1)
  if (!project) throw new NotFoundError()

  const [config] = await db.select().from(projectConfigurations).where(
    eq(projectConfigurations.projectId, id)
  ).limit(1)
  if (!config) throw new NotFoundError('Configuration not found')

  // DB columns are NOT NULL – only include non-null values in the set
  const setValues: Record<string, unknown> = { updatedAt: new Date() }
  if (updates.roundingInterval != null) setValues.roundingInterval = updates.roundingInterval
  if (updates.roundingDirection != null) setValues.roundingDirection = updates.roundingDirection
  if (updates.aggregationUnit != null) setValues.aggregationUnit = updates.aggregationUnit
  if (updates.aggregationPeriod != null) setValues.aggregationPeriod = updates.aggregationPeriod

  const [updated] = await db.update(projectConfigurations)
    .set(setValues)
    .where(eq(projectConfigurations.id, config.id))
    .returning()

  return {
    roundingInterval: updated.roundingInterval,
    roundingDirection: updated.roundingDirection,
    aggregationUnit: updated.aggregationUnit,
    aggregationPeriod: updated.aggregationPeriod,
  }
}
