import { z } from 'zod/v4'
import { organizationAssignments } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { canTransferOwnership } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const TransferOrganizationOwnershipParametersSchema = z.object({
  newOwnerUserId: z.string().uuid(),
})

export type TransferOrganizationOwnershipInput = z.input<typeof TransferOrganizationOwnershipParametersSchema>

export async function transferOrganizationOwnership(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: TransferOrganizationOwnershipInput,
) {
  const result = TransferOrganizationOwnershipParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canTransferOwnership(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [newOwnerMember] = await db.select().from(organizationAssignments)
    .where(and(
      eq(organizationAssignments.organizationId, executor.organization.id),
      eq(organizationAssignments.userId, parameters.newOwnerUserId),
    ))
    .limit(1)

  if (!newOwnerMember) throw new NotFoundError('移譲先のユーザーが組織のメンバーではありません')

  // 現在の owner を worker に降格
  await db.update(organizationAssignments)
    .set({ role: 'worker' })
    .where(and(
      eq(organizationAssignments.organizationId, executor.organization.id),
      eq(organizationAssignments.userId, executor.user.id),
    ))

  // 新しい owner を設定
  const [updated] = await db.update(organizationAssignments)
    .set({ role: 'owner' })
    .where(eq(organizationAssignments.id, newOwnerMember.id))
    .returning()

  return updated
}
