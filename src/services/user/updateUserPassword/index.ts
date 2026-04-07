import { z } from 'zod/v4'

export const UpdateUserPasswordParametersSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})
