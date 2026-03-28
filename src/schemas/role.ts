import { z } from 'zod/v4'

export const RoleSchema = z.enum(['admin', 'general'])

export type Role = z.infer<typeof RoleSchema>
