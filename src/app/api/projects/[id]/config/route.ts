import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { projects, configurations } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { NotFoundError } from '@/lib/api-server/errors'

export const GET = withAuth(async (_req, _user, context) => {
  const { id } = await context.params
  const [project, config] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, id)).then(r => r[0]),
    db.select().from(configurations).limit(1).then(r => r[0]),
  ])
  if (!project) throw new NotFoundError()
  if (!config) throw new NotFoundError('Configuration not found')

  return Response.json({
    roundingInterval: project.roundingInterval ?? config.roundingInterval,
    roundingDirection: project.roundingDirection ?? config.roundingDirection,
    aggregationUnit: project.aggregationUnit ?? config.aggregationUnit,
  })
})
