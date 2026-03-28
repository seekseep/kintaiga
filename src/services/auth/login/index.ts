import { z } from 'zod/v4'

export const LoginParametersSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginBody = z.infer<typeof LoginParametersSchema>
