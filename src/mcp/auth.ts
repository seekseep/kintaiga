import { db } from '@/lib/api-server/db'
import { resolveUserToken } from '@/services/user/tokens'
import { UnauthorizedError } from '@/lib/api-server/errors'
import type { OrganizationExecutor } from '@/services/types'

export async function authenticateRequest(
  request: Request,
): Promise<{ executor: OrganizationExecutor; tokenId: string }> {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header')
  }
  const rawToken = header.slice(7)
  if (!rawToken.startsWith('kga_')) {
    throw new UnauthorizedError('Invalid token format')
  }
  return resolveUserToken({ db }, rawToken)
}
