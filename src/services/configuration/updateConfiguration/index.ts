import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { configurations } from '@db/schema'
import { InternalError, NotFoundError } from '@/lib/api-server/errors'
import { RoundingDirectionSchema, AggregationUnitSchema } from '@/schemas/_helpers'
import { ROUNDING_INTERVALS } from '@/domain/config'
import type { DbOrTx, Executor } from '../../types'

const UpdateConfigurationParametersSchema = z.object({
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).optional(),
  roundingDirection: RoundingDirectionSchema.optional(),
  aggregationUnit: AggregationUnitSchema.optional(),
})

export type UpdateConfigurationInput = z.input<typeof UpdateConfigurationParametersSchema>
export type UpdateConfigurationParameters = z.output<typeof UpdateConfigurationParametersSchema>

export async function updateConfiguration(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: UpdateConfigurationInput,
) {
  const result = UpdateConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const configRows = await db.select().from(configurations).limit(1)
  const config = configRows[0]
  if (!config) throw new NotFoundError()
  const [updated] = await db.update(configurations)
    .set({ ...parameters, updatedAt: new Date() })
    .where(eq(configurations.id, config.id))
    .returning()
  return updated
}
