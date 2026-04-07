import { and, eq } from 'drizzle-orm'
import { projects } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

export async function getOrganizationProjectByName(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  name: string,
) {
  const { db } = dependencies
  const [project] = await db.select().from(projects)
    .where(and(
      eq(projects.organizationId, executor.organization.id),
      eq(projects.name, name),
    ))
    .limit(1)
  if (!project) throw new NotFoundError()
  return project
}
