import { z } from 'zod/v4'
import { eq, count as countFn } from 'drizzle-orm'
import { users, organizationAssignments } from '@db/schema'
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
      id: organizationAssignments.id,
      userId: users.id,
      name: users.name,
      iconUrl: users.iconUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      organizationRole: organizationAssignments.role,
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
