import { z } from 'zod/v4'
import { eq, and, or, count as countFn, isNull, gte, lt, type SQL } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, Executor } from '../../types'

const ListAssignmentsParametersSchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  active: z.string().optional(),
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListAssignmentsInput = z.input<typeof ListAssignmentsParametersSchema>
export type ListAssignmentsParameters = z.output<typeof ListAssignmentsParametersSchema>

export async function listAssignments(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: ListAssignmentsInput,
) {
  const result = ListAssignmentsParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const conditions: SQL[] = []
  if (parameters.projectId) conditions.push(eq(assignments.projectId, parameters.projectId))
  if (parameters.userId) conditions.push(eq(assignments.userId, parameters.userId))
  if (parameters.active === 'true') {
    const now = new Date()
    conditions.push(
      or(isNull(assignments.endedAt), gte(assignments.endedAt, now))!
    )
  }
  if (parameters.active === 'false') {
    const now = new Date()
    conditions.push(lt(assignments.endedAt, now))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const [items, [{ count }]] = await Promise.all([
    db.select().from(assignments).where(where).limit(parameters.limit).offset(parameters.offset),
    db.select({ count: countFn() }).from(assignments).where(where),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
