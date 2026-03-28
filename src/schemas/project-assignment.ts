import { z } from 'zod/v4'

export const ProjectAssignmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  targetMinutes: z.number().nullable(),
  createdAt: z.string(),
})

export type ProjectAssignment = z.infer<typeof ProjectAssignmentSchema>
