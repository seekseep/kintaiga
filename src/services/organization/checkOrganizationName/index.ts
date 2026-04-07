import { eq } from 'drizzle-orm'
import { organizations } from '@db/schema'
import { isReservedOrganizationName } from '@/domain/organization/name'
import type { DbOrTx } from '../../types'

export async function checkOrganizationName(
  dependencies: { db: DbOrTx },
  name: string,
): Promise<{ available: boolean; reason: string | null }> {
  if (!name) {
    return { available: false, reason: '名前を指定してください' }
  }

  if (isReservedOrganizationName(name)) {
    return { available: false, reason: 'この名前は予約されています' }
  }

  const { db } = dependencies
  const existing = await db.select({ id: organizations.id }).from(organizations)
    .where(eq(organizations.name, name)).limit(1)

  return {
    available: existing.length === 0,
    reason: existing.length > 0 ? 'この名前は既に使用されています' : null,
  }
}
