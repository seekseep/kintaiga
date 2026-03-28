import { z } from 'zod/v4'

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Project = z.infer<typeof ProjectSchema>
