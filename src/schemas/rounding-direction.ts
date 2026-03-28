import { z } from 'zod/v4'

export const RoundingDirectionSchema = z.enum(['ceil', 'floor'])

export type RoundingDirection = z.infer<typeof RoundingDirectionSchema>
