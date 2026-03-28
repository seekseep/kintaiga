import { z } from 'zod/v4'
import { ProjectSchema } from './project'
import { MembershipStatusSchema } from './membership-status'

export const UserProjectStatementSchema = ProjectSchema.extend({
  membershipStatus: MembershipStatusSchema,
})

export type UserProjectStatement = z.infer<typeof UserProjectStatementSchema>
