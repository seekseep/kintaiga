import { z } from 'zod/v4'

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

export type Activity = z.infer<typeof ActivitySchema>
