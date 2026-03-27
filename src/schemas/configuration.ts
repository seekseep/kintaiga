import { z } from 'zod/v4'
import { RoundingDirectionSchema, AggregationUnitSchema } from './_helpers'
import { ROUNDING_INTERVALS } from '@/domain/configuration'

export const ConfigurationRecordSchema = z.object({
  id: z.string(),
  roundingInterval: z.number(),
  roundingDirection: RoundingDirectionSchema,
  aggregationUnit: AggregationUnitSchema,
  aggregationPeriod: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ConfigurationSchema = z.object({
  id: z.string(),
  roundingInterval: z.number(),
  roundingDirection: RoundingDirectionSchema,
  aggregationUnit: AggregationUnitSchema,
  aggregationPeriod: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ConfigurationRecord = z.infer<typeof ConfigurationRecordSchema>
export type Configuration = z.infer<typeof ConfigurationSchema>

export type ProjectConfig = Omit<Configuration, 'id' | 'createdAt' | 'updatedAt'>

// Request body schemas
export const UpdateConfigurationParametersSchema = z.object({
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).optional(),
  roundingDirection: RoundingDirectionSchema.optional(),
  aggregationUnit: AggregationUnitSchema.optional(),
  aggregationPeriod: z.number().int().min(1).optional(),
})
