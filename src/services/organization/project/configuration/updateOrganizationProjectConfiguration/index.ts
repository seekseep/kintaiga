import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import { RoundingDirectionSchema } from '@/schemas/rounding-direction'
import { AggregationUnitSchema } from '@/schemas/aggregation-unit'
import { ROUNDING_INTERVALS } from '@/domain/project/configuration'
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

  // null = グローバル設定にフォールバック、undefined = 変更しない
  const setValues: Record<string, unknown> = { updatedAt: new Date() }
  if ('roundingInterval' in updates) setValues.roundingInterval = updates.roundingInterval
  if ('roundingDirection' in updates) setValues.roundingDirection = updates.roundingDirection
  if ('aggregationUnit' in updates) setValues.aggregationUnit = updates.aggregationUnit
  if ('aggregationPeriod' in updates) setValues.aggregationPeriod = updates.aggregationPeriod

  const [updated] = await db.update(projects)
    .set(setValues)
    .where(eq(projects.id, id))
    .returning()

  return {
    roundingInterval: updated.roundingInterval,
    roundingDirection: updated.roundingDirection,
    aggregationUnit: updated.aggregationUnit,
    aggregationPeriod: updated.aggregationPeriod,
  }
}
