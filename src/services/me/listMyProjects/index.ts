import { z } from 'zod/v4'
import { eq, count } from 'drizzle-orm'
import { assignments, projects } from '@db/schema'
import { InternalError } from '@/lib/api-server/errors'
import type { DbOrTx, Executor } from '../../types'

const ListMyProjectsParametersSchema = z.object({
  limit: z.number(),
  offset: z.number(),
})

export type ListMyProjectsInput = z.input<typeof ListMyProjectsParametersSchema>
export type ListMyProjectsParameters = z.output<typeof ListMyProjectsParametersSchema>

export async function listMyProjects(
  dependencies: { db: DbOrTx },
  executor: Executor,
  input: ListMyProjectsInput,
) {
  const result = ListMyProjectsParametersSchema.safeParse(input)
  if (!result.success) throw new InternalError('Invalid parameters')
  const parameters = result.data

  const { db } = dependencies
  const { user } = executor

  const [items, [{ total }]] = await Promise.all([
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
      .where(eq(assignments.userId, user.id))
      .limit(parameters.limit)
      .offset(parameters.offset),
    db
      .select({ total: count() })
      .from(assignments)
      .where(eq(assignments.userId, user.id)),
  ])

  return { items, total }
}
