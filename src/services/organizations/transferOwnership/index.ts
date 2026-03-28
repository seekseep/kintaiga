import { z } from 'zod/v4'
import { organizationMembers } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { canTransferOwnership } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const TransferOwnershipParametersSchema = z.object({
  newOwnerUserId: z.string().uuid(),
})

export type TransferOwnershipInput = z.input<typeof TransferOwnershipParametersSchema>

export async function transferOwnership(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: TransferOwnershipInput,
) {
  const result = TransferOwnershipParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canTransferOwnership(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [newOwnerMember] = await db.select().from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, executor.organization.id),
      eq(organizationMembers.userId, parameters.newOwnerUserId),
    ))
    .limit(1)

  if (!newOwnerMember) throw new NotFoundError('移譲先のユーザーが組織のメンバーではありません')

  // 現在の owner を member に降格
  await db.update(organizationMembers)
    .set({ organizationRole: 'member' })
    .where(and(
      eq(organizationMembers.organizationId, executor.organization.id),
      eq(organizationMembers.userId, executor.user.id),
    ))

  // 新しい owner を設定
  const [updated] = await db.update(organizationMembers)
    .set({ organizationRole: 'owner' })
    .where(eq(organizationMembers.id, newOwnerMember.id))
    .returning()

  return updated
}
