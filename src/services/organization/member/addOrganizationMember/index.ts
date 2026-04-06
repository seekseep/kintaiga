import { z } from 'zod/v4'
import { organizationAssignments, users } from '@db/schema'
import { eq, and } from 'drizzle-orm'
import { ValidationError, ForbiddenError, ConflictError, BadRequestError, NotFoundError } from '@/lib/api-server/errors'
import { canManageOrganizationMembers } from '@/domain/authorization'
import { canAddMember } from '@/domain/organization/limits'
import { OrganizationRoleSchema } from '@/schemas/organization-role'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const AddOrganizationMemberParametersSchema = z.object({
  email: z.email(),
  role: OrganizationRoleSchema.exclude(['owner']).optional().default('worker'),
})

export type AddOrganizationMemberInput = z.input<typeof AddOrganizationMemberParametersSchema>

export async function addOrganizationMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: AddOrganizationMemberInput,
) {
  const result = AddOrganizationMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationMembers(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  // メールアドレスでユーザーを検索
  const [user] = await db.select().from(users)
    .where(eq(users.email, parameters.email))
    .limit(1)
  if (!user) throw new NotFoundError('このメールアドレスのユーザーが見つかりません')

  // 既にメンバーか確認
  const existing = await db.select().from(organizationAssignments)
    .where(and(
      eq(organizationAssignments.organizationId, executor.organization.id),
      eq(organizationAssignments.userId, user.id),
    ))
    .limit(1)
  if (existing.length > 0) throw new ConflictError('このユーザーは既にメンバーです')

  // メンバー上限チェック
  const currentMembers = await db.select().from(organizationAssignments)
    .where(eq(organizationAssignments.organizationId, executor.organization.id))
  if (!canAddMember(executor.organization.plan, currentMembers.length)) {
    throw new BadRequestError('フリープランのメンバー上限（3人）に達しています')
  }

  const [created] = await db.insert(organizationAssignments).values({
    organizationId: executor.organization.id,
    userId: user.id,
    role: parameters.role,
  }).returning()

  return created
}
