import { z } from 'zod/v4'

export const MembershipStatusSchema = z.enum(['joined', 'suspended', 'none'])

export type MembershipStatus = z.infer<typeof MembershipStatusSchema>
