import { type NextRequest } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { UnauthorizedError } from '@/lib/api-server/errors'
import type { Role } from '@/schemas/role'
import type { UserExecutor } from '@/services/types'

const jwks = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL!}/auth/v1/.well-known/jwks.json`)
)

export type RouteContext = { params: Promise<Record<string, string>> }

type AuthHandler = (
  req: NextRequest,
  executor: UserExecutor,
  context: RouteContext,
) => Promise<Response>

async function verifyToken(req: Request): Promise<{ sub: string; role: Role; email: string | null }> {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new Error('Missing token')
  }
  const token = header.slice(7)
  const { payload } = await jwtVerify(token, jwks)
  if (!payload.sub) {
    throw new Error('Invalid token')
  }
  const appMetadata = payload.app_metadata as { role?: Role } | undefined
  const email = (payload.email as string) ?? null
  return { sub: payload.sub, role: appMetadata?.role ?? 'general', email }
}

export function withUser(handler: AuthHandler) {
  return async (req: NextRequest, context: RouteContext) => {
    let sub: string
    let role: Role
    try {
      const result = await verifyToken(req)
      sub = result.sub
      role = result.role
    } catch {
      throw new UnauthorizedError()
    }

    const executor: UserExecutor = { type: 'user', user: { id: sub, role } }
    return await handler(req, executor, context)
  }
}
