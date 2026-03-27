import { z } from 'zod/v4'
import { count } from 'drizzle-orm'
import { users } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const ListUsersParametersSchema = z.object({
  limit: z.number(),
  offset: z.number(),
})

export type ListUsersInput = z.input<typeof ListUsersParametersSchema>
export type ListUsersParameters = z.output<typeof ListUsersParametersSchema>

export async function listUsers(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: ListUsersInput,
) {
  const result = ListUsersParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const [items, [{ total }]] = await Promise.all([
    db.select().from(users).limit(parameters.limit).offset(parameters.offset),
    db.select({ total: count() }).from(users),
  ])
  return { items, total }
}
