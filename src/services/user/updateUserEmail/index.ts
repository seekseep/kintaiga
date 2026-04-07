import { z } from 'zod/v4'

export const UpdateUserEmailParametersSchema = z.object({
  email: z.email(),
})
