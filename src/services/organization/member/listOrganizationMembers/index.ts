import { z } from 'zod/v4'
import { eq, count as countFn } from 'drizzle-orm'
import { organizationAssignments, users } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const ListOrganizationMembersParametersSchema = z.object({
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListOrganizationMembersInput = z.input<typeof ListOrganizationMembersParametersSchema>
export type ListOrganizationMembersParameters = z.output<typeof ListOrganizationMembersParametersSchema>

export async function listOrganizationMembers(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: ListOrganizationMembersInput = {},
) {
  const result = ListOrganizationMembersParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  const [items, [{ count }]] = await Promise.all([
    db.select({
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
      .where(eq(organizationAssignments.organizationId, executor.organization.id))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db.select({ count: countFn() })
      .from(organizationAssignments)
      .where(eq(organizationAssignments.organizationId, executor.organization.id)),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
