import { z } from 'zod/v4'
import { count as countFn } from 'drizzle-orm'
import { users } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, Executor } from '../../types'

const ListUsersParametersSchema = z.object({
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListUsersInput = z.input<typeof ListUsersParametersSchema>
export type ListUsersParameters = z.output<typeof ListUsersParametersSchema>

export async function listUsers(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: ListUsersInput,
) {
  const result = ListUsersParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [items, [{ count }]] = await Promise.all([
    db.select().from(users).limit(parameters.limit).offset(parameters.offset),
    db.select({ count: countFn() }).from(users),
  ])
  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
