import { z } from 'zod/v4'
import { eq, and, or, count as countFn, isNull, gte, lt, type SQL } from 'drizzle-orm'
import { projectAssignments, users } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const ListOrganizationProjectMembersParametersSchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  active: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListOrganizationProjectMembersInput = z.input<typeof ListOrganizationProjectMembersParametersSchema>
export type ListOrganizationProjectMembersParameters = z.output<typeof ListOrganizationProjectMembersParametersSchema>

export async function listOrganizationProjectMembers(
  dependencies: { db: DbOrTx },
  _executor: OrganizationExecutor,
  input: ListOrganizationProjectMembersInput,
) {
  const result = ListOrganizationProjectMembersParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const conditions: SQL[] = []
  if (parameters.projectId) conditions.push(eq(projectAssignments.projectId, parameters.projectId))
  if (parameters.userId) conditions.push(eq(projectAssignments.userId, parameters.userId))
  if (parameters.active === 'true') {
    const now = new Date()
    conditions.push(
      or(isNull(projectAssignments.endedAt), gte(projectAssignments.endedAt, now))!
    )
  }
  if (parameters.active === 'false') {
    const now = new Date()
    conditions.push(lt(projectAssignments.endedAt, now))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const now = new Date()

  const [rows, [{ count }]] = await Promise.all([
    db.select({
      projectAssignmentId: projectAssignments.id,
      userId: projectAssignments.userId,
      name: users.name,
      role: users.role,
      iconUrl: users.iconUrl,
      targetMinutes: projectAssignments.targetMinutes,
      startedAt: projectAssignments.startedAt,
      endedAt: projectAssignments.endedAt,
    })
      .from(projectAssignments)
      .innerJoin(users, eq(projectAssignments.userId, users.id))
      .where(where)
      .limit(parameters.limit)
      .offset(parameters.offset),
    db.select({ count: countFn() }).from(projectAssignments).where(where),
  ])

  const items = rows.map(row => ({
    ...row,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    active: !row.endedAt || row.endedAt >= now,
  }))

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
