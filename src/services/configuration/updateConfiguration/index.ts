import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { configurations } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { isAdminUser } from '@/domain/authorization'
import { RoundingDirectionSchema, AggregationUnitSchema } from '@/schemas/_helpers'
import { ROUNDING_INTERVALS } from '@/domain/configuration'
import type { DbOrTx, Executor } from '../../types'

const UpdateConfigurationParametersSchema = z.object({
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).optional(),
  roundingDirection: RoundingDirectionSchema.optional(),
  aggregationUnit: AggregationUnitSchema.optional(),
  aggregationPeriod: z.number().int().min(1).optional(),
})

export type UpdateConfigurationInput = z.input<typeof UpdateConfigurationParametersSchema>
export type UpdateConfigurationParameters = z.output<typeof UpdateConfigurationParametersSchema>

export async function updateConfiguration(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: UpdateConfigurationInput,
) {
  const result = UpdateConfigurationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isAdminUser(executor)) throw new ForbiddenError()
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
