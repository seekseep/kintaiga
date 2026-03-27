import { z } from 'zod/v4'
import { eq, and, or, count, isNull, gte, lt, type SQL } from 'drizzle-orm'
import { assignments } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const ListAssignmentsParametersSchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  active: z.string().optional(),
  limit: z.number(),
  offset: z.number(),
})

export type ListAssignmentsInput = z.input<typeof ListAssignmentsParametersSchema>
export type ListAssignmentsParameters = z.output<typeof ListAssignmentsParametersSchema>

export async function listAssignments(
  dependencies: { db: DbOrTx },
  _executor: Executor,
  input: ListAssignmentsInput,
) {
  const result = ListAssignmentsParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
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

  const [items, [{ total }]] = await Promise.all([
    db.select().from(assignments).where(where).limit(parameters.limit).offset(parameters.offset),
    db.select({ total: count() }).from(assignments).where(where),
  ])

  return { items, total }
}
