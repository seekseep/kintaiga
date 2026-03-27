import { z } from 'zod/v4'

export const AssignmentRecordSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  targetMinutes: z.number().nullable(),
  createdAt: z.date(),
})

export const AssignmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  targetMinutes: z.number().nullable(),
  createdAt: z.string(),
})

export type AssignmentRecord = z.infer<typeof AssignmentRecordSchema>
export type Assignment = z.infer<typeof AssignmentSchema>

// Request body schemas
export const CreateAssignmentParametersSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  startedAt: z.string().optional(),
  targetMinutes: z.number().int().min(0).optional(),
})
export const UpdateAssignmentParametersSchema = z.object({
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})

export type CreateAssignmentBody = z.infer<typeof CreateAssignmentParametersSchema>
export type UpdateAssignmentBody = z.infer<typeof UpdateAssignmentParametersSchema>
