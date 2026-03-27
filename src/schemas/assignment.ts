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
  projectId: z.uuid(),
  userId: z.uuid(),
  startedAt: z.iso.datetime({ local: true }).optional(),
  targetMinutes: z.number().int().min(0).optional(),
})
export const UpdateAssignmentParametersSchema = z.object({
  startedAt: z.iso.datetime({ local: true }).optional(),
  endedAt: z.iso.datetime({ local: true }).nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})
