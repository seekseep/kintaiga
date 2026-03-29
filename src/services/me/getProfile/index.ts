import { eq } from 'drizzle-orm'
import { users } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'

export async function getProfile(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
) {
  const userId = executor.user.id
  const { db } = dependencies
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) throw new NotFoundError()
  return user
}
