import { z } from 'zod/v4'
import { organizations, organizationAssignments, organizationConfigurations } from '@db/schema'
import { ValidationError, ConflictError } from '@/lib/api-server/errors'
import { eq } from 'drizzle-orm'
import { isReservedOrganizationName } from '@/domain/organization-name'
import type { DbOrTx, UserExecutor } from '../../types'

const OrganizationNameSchema = z.string()
  .min(2)
  .max(63)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, '英小文字・数字・ハイフンのみ使用可能')
  .refine((name) => !isReservedOrganizationName(name), '予約語は使用できません')

const CreateOrganizationParametersSchema = z.object({
  name: OrganizationNameSchema,
  displayName: z.string().min(1).max(255),
})

export type CreateOrganizationInput = z.input<typeof CreateOrganizationParametersSchema>

export async function createOrganization(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
  input: CreateOrganizationInput,
) {
  const result = CreateOrganizationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const existing = await db.select().from(organizations).where(eq(organizations.name, parameters.name)).limit(1)
  if (existing.length > 0) throw new ConflictError('この組織名は既に使用されています')

  const [created] = await db.insert(organizations).values({
    name: parameters.name,
    displayName: parameters.displayName,
  }).returning()

  await db.insert(organizationAssignments).values({
    organizationId: created.id,
    userId: executor.user.id,
    role: 'owner',
  })

  await db.insert(organizationConfigurations).values({
    organizationId: created.id,
  })

  return created
}
