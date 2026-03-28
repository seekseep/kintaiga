import { z } from 'zod/v4'

export const UpdatePasswordParametersSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})
