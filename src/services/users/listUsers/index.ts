import { z } from 'zod/v4'
import { eq, count as countFn } from 'drizzle-orm'
import { users, organizationMembers } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, OrganizationExecutor } from '../../types'

const ListUsersParametersSchema = z.object({
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListUsersInput = z.input<typeof ListUsersParametersSchema>
export type ListUsersParameters = z.output<typeof ListUsersParametersSchema>

export async function listUsers(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: ListUsersInput,
) {
  const result = ListUsersParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [items, [{ count }]] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      iconUrl: users.iconUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      organizationRole: organizationMembers.organizationRole,
    })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, executor.organization.id))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db.select({ count: countFn() })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, executor.organization.id)),
  ])
  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
