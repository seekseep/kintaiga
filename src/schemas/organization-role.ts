import { z } from 'zod/v4'

export const OrganizationRoleSchema = z.enum(['owner', 'manager', 'worker'])

export type OrganizationRole = z.infer<typeof OrganizationRoleSchema>
