import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projects } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import { RoundingDirectionSchema, AggregationUnitSchema } from '@/schemas/_helpers'
import { ROUNDING_INTERVALS } from '@/domain/config'
import type { DbOrTx, Executor } from '../../types'

const UpdateProjectParametersSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).nullable().optional(),
  roundingDirection: RoundingDirectionSchema.nullable().optional(),
  aggregationUnit: AggregationUnitSchema.nullable().optional(),
})

export type UpdateProjectInput = z.input<typeof UpdateProjectParametersSchema>
export type UpdateProjectParameters = z.output<typeof UpdateProjectParametersSchema>

export async function updateProject(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: UpdateProjectInput,
) {
  const result = UpdateProjectParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const { id, ...updates } = result.data

  const { db } = dependencies
  const [updated] = await db.update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  if (!updated) throw new NotFoundError()
  return updated
}
