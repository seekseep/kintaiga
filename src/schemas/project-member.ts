import { z } from 'zod/v4'
import { RoleSchema } from './role'

export const ProjectMemberSchema = z.object({
  projectAssignmentId: z.string(),
  userId: z.string(),
  name: z.string(),
  role: RoleSchema,
  iconUrl: z.string().nullable(),
  active: z.boolean(),
  targetMinutes: z.number().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
})

export type ProjectMember = z.infer<typeof ProjectMemberSchema>
