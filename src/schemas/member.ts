import { z } from 'zod/v4'
import { RoleSchema } from './role'
import { OrganizationRoleSchema } from './organization-role'

export const MemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().nullable(),
  name: z.string(),
  role: RoleSchema,
  organizationRole: OrganizationRoleSchema.optional(),
  iconUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Member = z.infer<typeof MemberSchema>
