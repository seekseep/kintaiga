import { z } from 'zod/v4'
import { eq, and, or, isNull, gte, count as countFn } from 'drizzle-orm'
import { projects, assignments } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { MembershipStatus } from '@/schemas'
import type { DbOrTx, Executor } from '../../types'

const ListUserProjectStatementsParametersSchema = z.object({
  filter: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListUserProjectStatementsInput = z.input<typeof ListUserProjectStatementsParametersSchema>
export type ListUserProjectStatementsParameters = z.output<typeof ListUserProjectStatementsParametersSchema>

const projectColumns = {
  id: projects.id,
  name: projects.name,
  description: projects.description,
  roundingInterval: projects.roundingInterval,
  roundingDirection: projects.roundingDirection,
  aggregationUnit: projects.aggregationUnit,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
} as const

export async function listUserProjectStatements(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: ListUserProjectStatementsInput,
) {
  const result = ListUserProjectStatementsParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const isAdmin = executor.role === 'admin'

  // joined: アサインメントが有効期間内（endedAt=null or endedAt>=now）のプロジェクト
  // general ユーザーは常にこのフィルタ
  if (parameters.filter === 'joined' || !isAdmin) {
    const now = new Date()
    const activeAssignment = and(
      eq(assignments.userId, executor.id),
      or(isNull(assignments.endedAt), gte(assignments.endedAt, now))
    )
    const [rows, [{ count }]] = await Promise.all([
      db
        .select(projectColumns)
        .from(assignments)
        .innerJoin(projects, eq(assignments.projectId, projects.id))
        .where(activeAssignment)
        .limit(parameters.limit)
        .offset(parameters.offset),
      db
        .select({ count: countFn() })
        .from(assignments)
        .where(activeAssignment),
    ])
    const items = rows.map(row => ({
      ...row,
      membershipStatus: 'joined' as MembershipStatus,
    }))
    return { items, count, limit: parameters.limit, offset: parameters.offset }
  }

  // all (admin only): 全プロジェクトにユーザーのアサインメント状態を付与
  const now = new Date()
  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        ...projectColumns,
        assignmentEndedAt: assignments.endedAt,
        assignmentId: assignments.id,
      })
      .from(projects)
      .leftJoin(
        assignments,
        and(
          eq(assignments.projectId, projects.id),
          eq(assignments.userId, executor.id),
        ),
      )
      .limit(parameters.limit)
      .offset(parameters.offset),
    db.select({ count: countFn() }).from(projects),
  ])

  const items = rows.map(row => {
    let membershipStatus: MembershipStatus
    if (row.assignmentId === null) {
      membershipStatus = 'none'
    } else if (row.assignmentEndedAt !== null && row.assignmentEndedAt < now) {
      membershipStatus = 'suspended'
    } else {
      membershipStatus = 'joined'
    }
    const { assignmentEndedAt: _, assignmentId: __, ...project } = row
    return { ...project, membershipStatus }
  })

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
