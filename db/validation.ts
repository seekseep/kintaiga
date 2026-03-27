import { z } from 'zod/v4'

// Projects
export const CreateProjectParametersSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
})
export const UpdateProjectParametersSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  roundingInterval: z.number().refine(v => [1, 5, 10, 15, 30, 60].includes(v)).nullable().optional(),
  roundingDirection: z.enum(['ceil', 'floor']).nullable().optional(),
  aggregationUnit: z.enum(['monthly', 'none']).nullable().optional(),
})

// Users
export const CreateUserParametersSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['admin', 'general']).optional().default('general'),
})
export const UpdateUserParametersSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'general']).optional(),
})

// Assignments
export const CreateAssignmentParametersSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  startedAt: z.string().optional(),
})
export const UpdateAssignmentParametersSchema = z.object({
  endedAt: z.string().nullable().optional(),
})

// Activities
export const CreateActivityParametersSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  startedAt: z.string().optional(),
  note: z.string().nullable().optional(),
})
export const UpdateActivityParametersSchema = z.object({
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})

// Configurations
const roundingIntervalValues = [1, 5, 10, 15, 30, 60] as const
export const UpdateConfigurationParametersSchema = z.object({
  roundingInterval: z.number().refine(v => (roundingIntervalValues as readonly number[]).includes(v)).optional(),
  roundingDirection: z.enum(['ceil', 'floor']).optional(),
  aggregationUnit: z.enum(['monthly', 'none']).optional(),
})

// Auth
export const LoginParametersSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Me
export const CreateProfileParametersSchema = z.object({
  name: z.string().min(1),
})
export const UpdateProfileParametersSchema = z.object({
  name: z.string().min(1).optional(),
})
export const UpdateIconParametersSchema = z.object({
  icon: z.string().regex(/^data:image\/\w+;base64,.+$/),
})
