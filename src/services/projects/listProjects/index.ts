import { z } from 'zod/v4'
import { eq, and, or, isNull, gte, count as countFn } from 'drizzle-orm'
import { projects, assignments } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { isOrganizationManagerOrAbove } from '@/domain/authorization'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { MembershipStatus } from '@/schemas'
import type { DbOrTx, OrganizationExecutor } from '../../types'

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
  executor: OrganizationExecutor,
  input: ListUserProjectStatementsInput,
) {
  const result = ListUserProjectStatementsParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const isManager = isOrganizationManagerOrAbove(executor)

  // joined: アサインメントが有効期間内（endedAt=null or endedAt>=now）のプロジェクト
  // member ユーザーは常にこのフィルタ
  if (parameters.filter === 'joined' || !isManager) {
    const now = new Date()
    const activeAssignment = and(
      eq(assignments.userId, executor.user.id),
      or(isNull(assignments.endedAt), gte(assignments.endedAt, now))
    )
    const orgFilter = eq(projects.organizationId, executor.organization.id)
    const [rows, [{ count }]] = await Promise.all([
      db
        .select(projectColumns)
        .from(assignments)
        .innerJoin(projects, and(eq(assignments.projectId, projects.id), orgFilter))
        .where(activeAssignment)
        .limit(parameters.limit)
        .offset(parameters.offset),
      db
        .select({ count: countFn() })
        .from(assignments)
        .innerJoin(projects, and(eq(assignments.projectId, projects.id), orgFilter))
        .where(activeAssignment),
    ])
    const items = rows.map(row => ({
      ...row,
      membershipStatus: 'joined' as MembershipStatus,
    }))
    return { items, count, limit: parameters.limit, offset: parameters.offset }
  }

  // all (manager/owner): 組織内の全プロジェクトにユーザーのアサインメント状態を付与
  const now = new Date()
  const orgFilter = eq(projects.organizationId, executor.organization.id)
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
          eq(assignments.userId, executor.user.id),
        ),
      )
      .where(orgFilter)
      .limit(parameters.limit)
      .offset(parameters.offset),
    db.select({ count: countFn() }).from(projects).where(orgFilter),
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
