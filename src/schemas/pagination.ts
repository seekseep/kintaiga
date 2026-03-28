import { z } from 'zod/v4'

export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    limit: z.number(),
    offset: z.number(),
    count: z.number(),
  })
}

export const PaginationParametersSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type PaginatedResponse<T> = {
  items: T[]
  limit: number
  offset: number
  count: number
}

export type PaginationParameters = z.infer<typeof PaginationParametersSchema>
