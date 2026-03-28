import { z } from 'zod/v4'
import { ActivitySchema } from './activity'

export const ProjectActivitySchema = ActivitySchema.extend({
  projectName: z.string().optional(),
  userName: z.string().optional(),
})

export type ProjectActivity = z.infer<typeof ProjectActivitySchema>
