import { z } from 'zod/v4'
import { RoleSchema } from './role'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string(),
  role: RoleSchema,
  iconUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type User = z.infer<typeof UserSchema>
