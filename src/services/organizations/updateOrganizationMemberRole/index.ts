import { z } from 'zod/v4'
import { organizationMembers } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { isOrganizationOwner } from '@/domain/authorization'
import { OrganizationRoleSchema } from '@/schemas/_helpers'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const UpdateOrganizationMemberRoleParametersSchema = z.object({
  userId: z.string().uuid(),
  organizationRole: OrganizationRoleSchema.exclude(['owner']),
})

export type UpdateOrganizationMemberRoleInput = z.input<typeof UpdateOrganizationMemberRoleParametersSchema>

export async function updateOrganizationMemberRole(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationMemberRoleInput,
) {
  const result = UpdateOrganizationMemberRoleParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isOrganizationOwner(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [member] = await db.select().from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, executor.organization.id),
      eq(organizationMembers.userId, parameters.userId),
    ))
    .limit(1)

  if (!member) throw new NotFoundError('メンバーが見つかりません')
  if (member.organizationRole === 'owner') throw new BadRequestError('オーナーのロールは変更できません。オーナー移譲を使用してください')

  const [updated] = await db.update(organizationMembers)
    .set({ organizationRole: parameters.organizationRole })
    .where(eq(organizationMembers.id, member.id))
    .returning()

  return updated
}
