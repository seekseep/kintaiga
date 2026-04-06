import { eq, and } from 'drizzle-orm'
import { organizationAssignments } from '@db/schema'
import type { DbOrTx } from '@/services/types'

export async function resolveUserIdFromMemberId(
  db: DbOrTx,
  organizationId: string,
  memberId: string,
): Promise<{ userId: string; role: string }> {
  const [assignment] = await db
    .select({
      userId: organizationAssignments.userId,
      role: organizationAssignments.role,
    })
    .from(organizationAssignments)
    .where(
      and(
        eq(organizationAssignments.id, memberId),
        eq(organizationAssignments.organizationId, organizationId),
      ),
    )

  if (!assignment) {
    throw new Error(`Member not found: ${memberId}`)
  }

  return assignment
}

export async function resolveMemberIdFromUserId(
  db: DbOrTx,
  organizationId: string,
  userId: string,
): Promise<string> {
  const [assignment] = await db
    .select({ id: organizationAssignments.id })
    .from(organizationAssignments)
    .where(
      and(
        eq(organizationAssignments.userId, userId),
        eq(organizationAssignments.organizationId, organizationId),
      ),
    )

  if (!assignment) {
    throw new Error(`Member assignment not found for user: ${userId}`)
  }

  return assignment.id
}
