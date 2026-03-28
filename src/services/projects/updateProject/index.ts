import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { projects } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationProjects } from '@/domain/authorization'
import { RoundingDirectionSchema, AggregationUnitSchema } from '@/schemas/_helpers'
import { ROUNDING_INTERVALS } from '@/domain/configuration'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const UpdateProjectParametersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).nullable().optional(),
  roundingDirection: RoundingDirectionSchema.nullable().optional(),
  aggregationUnit: AggregationUnitSchema.nullable().optional(),
  aggregationPeriod: z.number().int().min(1).nullable().optional(),
})

export type UpdateProjectInput = z.input<typeof UpdateProjectParametersSchema>
export type UpdateProjectParameters = z.output<typeof UpdateProjectParametersSchema>

export async function updateProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateProjectInput,
) {
  const result = UpdateProjectParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationProjects(executor)) throw new ForbiddenError()
  const { id, ...updates } = result.data

  const { db } = dependencies
  const [updated] = await db.update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.organizationId, executor.organization.id)))
    .returning()
  if (!updated) throw new NotFoundError()
  return updated
}
