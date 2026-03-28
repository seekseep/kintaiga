import { z } from 'zod/v4'
import { eq, and, or, isNull, gte, count as countFn } from 'drizzle-orm'
import { projects, projectAssignments } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { MembershipStatus } from '@/schemas'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const ListOrganizationProjectStatementsParametersSchema = z.object({
  filter: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListOrganizationProjectStatementsInput = z.input<typeof ListOrganizationProjectStatementsParametersSchema>
export type ListOrganizationProjectStatementsParameters = z.output<typeof ListOrganizationProjectStatementsParametersSchema>

const projectColumns = {
  id: projects.id,
  name: projects.name,
  description: projects.description,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
} as const

export async function listOrganizationProjectStatements(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: ListOrganizationProjectStatementsInput,
) {
  const result = ListOrganizationProjectStatementsParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const isManager = canActAsOrganizationManager(executor)

  // joined: アサインメントが有効期間内（endedAt=null or endedAt>=now）のプロジェクト
  // member ユーザーは常にこのフィルタ
  if (parameters.filter === 'joined' || !isManager) {
    const now = new Date()
    const activeAssignment = and(
      eq(projectAssignments.userId, executor.user.id),
      or(isNull(projectAssignments.endedAt), gte(projectAssignments.endedAt, now))
    )
    const orgFilter = eq(projects.organizationId, executor.organization.id)
    const [rows, [{ count }]] = await Promise.all([
      db
        .select(projectColumns)
        .from(projectAssignments)
        .innerJoin(projects, and(eq(projectAssignments.projectId, projects.id), orgFilter))
        .where(activeAssignment)
        .limit(parameters.limit)
        .offset(parameters.offset),
      db
        .select({ count: countFn() })
        .from(projectAssignments)
        .innerJoin(projects, and(eq(projectAssignments.projectId, projects.id), orgFilter))
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
        assignmentEndedAt: projectAssignments.endedAt,
        assignmentId: projectAssignments.id,
      })
      .from(projects)
      .leftJoin(
        projectAssignments,
        and(
          eq(projectAssignments.projectId, projects.id),
          eq(projectAssignments.userId, executor.user.id),
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
