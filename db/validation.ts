import { z } from 'zod/v4'

// Projects
export const CreateProjectParametersSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
})
export const UpdateProjectParametersSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

// Users
export const CreateUserParametersSchema = z.object({
  id: z.string().uuid(),
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
})

// Activities
export const CreateActivityParametersSchema = z.object({
  type: z.string().min(1),
  startedAt: z.string(),
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})
export const UpdateActivityParametersSchema = z.object({
  type: z.string().min(1).optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
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
