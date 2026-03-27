import { z } from 'zod/v4'
import { eq, count as countFn } from 'drizzle-orm'
import { assignments, projects } from '@db/schema'
import { ValidationError } from '@/lib/api-server/errors'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import type { DbOrTx, Executor } from '../../types'

const ListMyProjectsParametersSchema = z.object({
  limit: z.number().optional().default(DEFAULT_LIMIT),
  offset: z.number().optional().default(DEFAULT_OFFSET),
})

export type ListMyProjectsInput = z.input<typeof ListMyProjectsParametersSchema>
export type ListMyProjectsParameters = z.output<typeof ListMyProjectsParametersSchema>

export async function listMyProjects(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: ListMyProjectsInput,
) {
  const result = ListMyProjectsParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const [items, [{ count }]] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(assignments)
      .innerJoin(projects, eq(assignments.projectId, projects.id))
      .where(eq(assignments.userId, executor.id))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db
      .select({ count: countFn() })
      .from(assignments)
      .where(eq(assignments.userId, executor.id)),
  ])

  return { items, count, limit: parameters.limit, offset: parameters.offset }
}
