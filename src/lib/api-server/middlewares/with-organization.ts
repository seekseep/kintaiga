import { type NextRequest } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { organizations, organizationAssignments } from '@db/schema'
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

    const [result] = await db
      .select({
        id: organizations.id,
        plan: organizations.plan,
        memberRole: organizationAssignments.role,
      })
      .from(organizations)
      .leftJoin(
        organizationAssignments,
        and(
          eq(organizationAssignments.organizationId, organizations.id),
          eq(organizationAssignments.userId, executor.user.id),
        ),
      )
      .where(eq(organizations.name, organizationName))
      .limit(1)

    if (!result) throw new NotFoundError('組織が見つかりません')

    if (!result.memberRole && executor.user.role !== 'admin') {
      throw new ForbiddenError('この組織のメンバーではありません')
    }

    const organizationExecutor: OrganizationExecutor = {
      type: 'organization',
      user: executor.user,
      organization: {
        id: result.id,
        role: result.memberRole ?? 'worker',
        plan: result.plan,
      },
    }

    return handler(req, organizationExecutor, context)
  })
}
