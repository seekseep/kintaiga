import { and, eq } from 'drizzle-orm'
import { organizationAssignments, organizations } from '@db/schema'
import { db } from '@/lib/db'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/lib/errors'
import type { Role } from '@/schemas/role'
import type { OrganizationExecutor, UserExecutor } from '@/services/types'
import { getServerSupabase } from './supabase.server'

export async function getUserExecutor(): Promise<UserExecutor> {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new UnauthorizedError()

  const appMetadata = user.app_metadata as { role?: Role } | undefined
  const role: Role = appMetadata?.role ?? 'general'

  return { type: 'user', user: { id: user.id, role } }
}

export async function getOrganizationExecutor(
  organizationName: string,
): Promise<OrganizationExecutor> {
  const userExecutor = await getUserExecutor()

  const [result] = await db
    .select({
      id: organizations.id,
      memberRole: organizationAssignments.role,
    })
    .from(organizations)
    .leftJoin(
      organizationAssignments,
      and(
        eq(organizationAssignments.organizationId, organizations.id),
        eq(organizationAssignments.userId, userExecutor.user.id),
      ),
    )
    .where(eq(organizations.name, organizationName))
    .limit(1)

  if (!result) throw new NotFoundError('組織が見つかりません')

  if (!result.memberRole && userExecutor.user.role !== 'admin') {
    throw new ForbiddenError('この組織のメンバーではありません')
  }

  return {
    type: 'organization',
    user: userExecutor.user,
    organization: {
      id: result.id,
      role: result.memberRole ?? 'worker',
    },
  }
}
