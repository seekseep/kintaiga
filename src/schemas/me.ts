import { z } from 'zod/v4'

// Request body schemas
export const CreateProfileParametersSchema = z.object({
  name: z.string().min(1),
})
export const UpdateProfileParametersSchema = z.object({
  name: z.string().min(1).optional(),
})
export const UpdateIconParametersSchema = z.object({
  icon: z.string().regex(/^data:image\/\w+;base64,.+$/),
})
export const UpdateEmailParametersSchema = z.object({
  email: z.string().email(),
})
export const UpdatePasswordParametersSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})
