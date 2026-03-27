import { z } from 'zod/v4'
import { RoleSchema } from './_helpers'

export const UserRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: RoleSchema,
  iconUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: RoleSchema,
  iconUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserRecord = z.infer<typeof UserRecordSchema>
export type User = z.infer<typeof UserSchema>

// Request body schemas
export const CreateUserParametersSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: RoleSchema.optional().default('general'),
})
export const UpdateUserParametersSchema = z.object({
  name: z.string().min(1).optional(),
})
