import { z } from 'zod/v4'

export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    limit: z.number(),
    offset: z.number(),
    size: z.number(),
  })
}

export const PaginationParamsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type PaginatedResponse<T> = {
  items: T[]
  limit: number
  offset: number
  size: number
}

export type PaginationParams = z.infer<typeof PaginationParamsSchema>
