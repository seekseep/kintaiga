import { z } from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { organizationAssignments, users } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const GetOrganizationMemberParametersSchema = z.object({
  memberId: z.uuid(),
})

export type GetOrganizationMemberInput = z.input<typeof GetOrganizationMemberParametersSchema>

export async function getOrganizationMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: GetOrganizationMemberInput,
) {
  const result = GetOrganizationMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [member] = await db.select({
    id: organizationAssignments.id,
    email: users.email,
    name: users.name,
    role: users.role,
    organizationRole: organizationAssignments.role,
    iconUrl: users.iconUrl,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  })
    .from(organizationAssignments)
    .innerJoin(users, eq(organizationAssignments.userId, users.id))
    .where(and(
      eq(organizationAssignments.id, parameters.memberId),
      eq(organizationAssignments.organizationId, executor.organization.id),
    ))
    .limit(1)

  if (!member) throw new NotFoundError('メンバーが見つかりません')

  return member
}
