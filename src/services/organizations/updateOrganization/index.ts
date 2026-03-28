import { z } from 'zod/v4'
import { organizations } from '@db/schema'
import { eq } from 'drizzle-orm'
import { ValidationError, ForbiddenError, NotFoundError, ConflictError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import { isReservedOrganizationName } from '@/domain/organization-name'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const UpdateOrganizationParametersSchema = z.object({
  name: z.string().min(2).max(63).regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/)
    .refine((name) => !isReservedOrganizationName(name), '予約語は使用できません')
    .optional(),
  displayName: z.string().min(1).max(255).optional(),
})

export type UpdateOrganizationInput = z.input<typeof UpdateOrganizationParametersSchema>

export async function updateOrganization(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationInput,
) {
  const result = UpdateOrganizationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!isOrganizationManagerOrAbove(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  if (parameters.name) {
    const existing = await db.select({ id: organizations.id }).from(organizations)
      .where(eq(organizations.name, parameters.name)).limit(1)
    if (existing.length > 0 && existing[0].id !== executor.organization.id) {
      throw new ConflictError('この組織名は既に使用されています')
    }
  }

  const [updated] = await db.update(organizations)
    .set({ ...parameters, updatedAt: new Date() })
    .where(eq(organizations.id, executor.organization.id))
    .returning()

  if (!updated) throw new NotFoundError('組織が見つかりません')
  return updated
}
