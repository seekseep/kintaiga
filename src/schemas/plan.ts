import { z } from 'zod/v4'

export const PlanSchema = z.enum(['free', 'premium'])

export type Plan = z.infer<typeof PlanSchema>
