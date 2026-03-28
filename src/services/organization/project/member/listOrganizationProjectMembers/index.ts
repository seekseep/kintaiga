import { z } from 'zod/v4'
import { eq, and, or, count as countFn, isNull, gte, lt, type SQL } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
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

  const [items, [{ count }]] = await Promise.all([
    db.select().from(projectAssignments).where(where).limit(parameters.limit).offset(parameters.offset),
    db.select({ count: countFn() }).from(projectAssignments).where(where),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
