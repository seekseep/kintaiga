import { z } from 'zod/v4'
import { RoundingDirectionSchema } from './rounding-direction'
import { AggregationUnitSchema } from './aggregation-unit'

export const ConfigurationSchema = z.object({
  id: z.string(),
  roundingInterval: z.number(),
  roundingDirection: RoundingDirectionSchema,
  aggregationUnit: AggregationUnitSchema,
  aggregationPeriod: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Configuration = z.infer<typeof ConfigurationSchema>

export type ProjectConfig = Omit<Configuration, 'id' | 'createdAt' | 'updatedAt'>
