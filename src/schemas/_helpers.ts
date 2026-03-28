import { z } from 'zod/v4'

export const RoleSchema = z.enum(['admin', 'general'])
export const RoundingDirectionSchema = z.enum(['ceil', 'floor'])
export const AggregationUnitSchema = z.enum(['weekly', 'monthly', 'none'])
export const OrganizationRoleSchema = z.enum(['owner', 'manager', 'member'])
export const PlanSchema = z.enum(['free', 'premium'])

export type Role = z.infer<typeof RoleSchema>
export type RoundingDirection = z.infer<typeof RoundingDirectionSchema>
export type AggregationUnit = z.infer<typeof AggregationUnitSchema>
export type OrganizationRole = z.infer<typeof OrganizationRoleSchema>
export type Plan = z.infer<typeof PlanSchema>
