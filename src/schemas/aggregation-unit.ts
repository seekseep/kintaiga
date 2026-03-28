import { z } from 'zod/v4'

export const AggregationUnitSchema = z.enum(['weekly', 'monthly', 'none'])

export type AggregationUnit = z.infer<typeof AggregationUnitSchema>
