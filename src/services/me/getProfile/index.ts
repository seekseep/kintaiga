import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

export async function getProfile(
  dependencies: { db: DbOrTx },
  executor: Executor | null,
) {
  if (!executor) throw new NotFoundError()
  const { db } = dependencies
  const [user] = await db.select().from(users).where(eq(users.id, executor.id))
  if (!user) throw new NotFoundError()
  return user
}
