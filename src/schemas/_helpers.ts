import { z } from 'zod/v4'

export const RoleSchema = z.enum(['admin', 'general'])
export const RoundingDirectionSchema = z.enum(['ceil', 'floor'])
export const AggregationUnitSchema = z.enum(['monthly', 'none'])

export type Role = z.infer<typeof RoleSchema>
export type RoundingDirection = z.infer<typeof RoundingDirectionSchema>
export type AggregationUnit = z.infer<typeof AggregationUnitSchema>
