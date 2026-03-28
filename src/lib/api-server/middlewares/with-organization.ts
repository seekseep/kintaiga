import { type NextRequest } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { organizations, organizationMembers } from '@db/schema'
import { db } from '@/lib/api-server/db'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { withUser, type RouteContext } from '@/lib/api-server/middlewares/with-user'
import type { UserExecutor, OrganizationExecutor } from '@/services/types'

type OrganizationHandler = (
  req: NextRequest,
  executor: OrganizationExecutor,
  context: RouteContext,
) => Promise<Response>

export function withOrganization(handler: OrganizationHandler) {
  return withUser(async (req: NextRequest, executor: UserExecutor, context: RouteContext) => {
    const { organizationName } = await context.params

    const [organization] = await db.select().from(organizations)
      .where(eq(organizations.name, organizationName))
      .limit(1)

    if (!organization) throw new NotFoundError('組織が見つかりません')

    const [membership] = await db.select().from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, organization.id),
        eq(organizationMembers.userId, executor.user.id),
      ))
      .limit(1)

    if (!membership && executor.user.role !== 'admin') {
      throw new ForbiddenError('この組織のメンバーではありません')
    }

    const organizationExecutor: OrganizationExecutor = {
      type: 'organization',
      user: executor.user,
      organization: {
        id: organization.id,
        role: membership?.organizationRole ?? 'member',
        plan: organization.plan,
      },
    }

    return handler(req, organizationExecutor, context)
  })
}
