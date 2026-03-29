import { z } from 'zod/v4'
import { organizationAssignments } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { canActAsOrganizationOwner } from '@/domain/authorization'
import { OrganizationRoleSchema } from '@/schemas/organization-role'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const UpdateOrganizationMemberRoleParametersSchema = z.object({
  userId: z.uuid(),
  role: OrganizationRoleSchema.exclude(['owner']),
})

export type UpdateOrganizationMemberRoleInput = z.input<typeof UpdateOrganizationMemberRoleParametersSchema>

export async function updateOrganizationMemberRole(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationMemberRoleInput,
) {
  const result = UpdateOrganizationMemberRoleParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationOwner(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [member] = await db.select().from(organizationAssignments)
    .where(and(
      eq(organizationAssignments.organizationId, executor.organization.id),
      eq(organizationAssignments.userId, parameters.userId),
    ))
    .limit(1)

  if (!member) throw new NotFoundError('メンバーが見つかりません')
  if (member.role === 'owner') throw new BadRequestError('オーナーのロールは変更できません。オーナー移譲を使用してください')

  const [updated] = await db.update(organizationAssignments)
    .set({ role: parameters.role })
    .where(eq(organizationAssignments.id, member.id))
    .returning()

  return updated
}
