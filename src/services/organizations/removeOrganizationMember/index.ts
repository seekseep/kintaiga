import { z } from 'zod/v4'
import { organizationMembers } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { canManageOrganizationMembers } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const RemoveOrganizationMemberParametersSchema = z.object({
  userId: z.string().uuid(),
})

export type RemoveOrganizationMemberInput = z.input<typeof RemoveOrganizationMemberParametersSchema>

export async function removeOrganizationMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: RemoveOrganizationMemberInput,
) {
  const result = RemoveOrganizationMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationMembers(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [member] = await db.select().from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, executor.organization.id),
      eq(organizationMembers.userId, parameters.userId),
    ))
    .limit(1)

  if (!member) throw new NotFoundError('メンバーが見つかりません')
  if (member.organizationRole === 'owner') throw new BadRequestError('オーナーは削除できません。先にオーナーを移譲してください')

  const [deleted] = await db.delete(organizationMembers)
    .where(eq(organizationMembers.id, member.id))
    .returning()

  return deleted
}
