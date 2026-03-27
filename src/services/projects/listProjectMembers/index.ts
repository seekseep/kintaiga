import { eq } from 'drizzle-orm'
import { assignments, users } from '@db/schema'
import type { ProjectMember } from '@/schemas/project-member'
import type { DbOrTx, Executor } from '../../types'

export async function listProjectMembers(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: { projectId: string },
) {
  const { db } = dependencies
  const now = new Date()

  const rows = await db
    .select({
      assignmentId: assignments.id,
      userId: users.id,
      name: users.name,
      role: users.role,
      iconUrl: users.iconUrl,
      targetMinutes: assignments.targetMinutes,
      startedAt: assignments.startedAt,
      endedAt: assignments.endedAt,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.userId, users.id))
    .where(eq(assignments.projectId, input.projectId))

  const items: ProjectMember[] = rows.map(row => ({
    assignmentId: row.assignmentId,
    userId: row.userId,
    name: row.name,
    role: row.role,
    iconUrl: row.iconUrl,
    active: row.endedAt === null || row.endedAt >= now,
    targetMinutes: row.targetMinutes,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt?.toISOString() ?? null,
  }))

  return { items }
}
