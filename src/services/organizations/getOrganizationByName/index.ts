import { organizations } from '@db/schema'
import { eq } from 'drizzle-orm'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx } from '../../types'

export async function getOrganizationByName(
  dependencies: { db: DbOrTx },
  name: string,
) {
  const { db } = dependencies
  const [org] = await db.select().from(organizations).where(eq(organizations.name, name)).limit(1)
  if (!org) throw new NotFoundError('組織が見つかりません')
  return org
}
