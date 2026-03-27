import { z } from 'zod/v4'

export const ActivityRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ProjectActivitySchema = ActivitySchema.extend({
  projectName: z.string().optional(),
  userName: z.string().optional(),
})

export type ActivityRecord = z.infer<typeof ActivityRecordSchema>
export type Activity = z.infer<typeof ActivitySchema>
export type ProjectActivity = z.infer<typeof ProjectActivitySchema>

// Request body schemas
export const CreateActivityParametersSchema = z.object({
  projectId: z.uuid(),
  userId: z.uuid().optional(),
  startedAt: z.string().optional(),
  note: z.string().nullable().optional(),
})
export const UpdateActivityParametersSchema = z.object({
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})
