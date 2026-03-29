import { z } from 'zod/v4'

export const UpdateEmailParametersSchema = z.object({
  email: z.email(),
})
