import { type NextRequest } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { UnauthorizedError } from '@/lib/api-server/errors'
import type { Role } from '@/schemas/_helpers'
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

type AuthHandlerAllowUnregistered = (
  req: NextRequest,
  executor: UserExecutor | null,
  sub: string,
  email: string | null,
  context: RouteContext,
) => Promise<Response>

interface AuthOptions {
  allowUnregistered?: boolean
}

async function verifyToken(req: Request): Promise<{ sub: string; role: Role | null; email: string | null }> {
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
  return { sub: payload.sub, role: appMetadata?.role ?? null, email }
}

export function withUser(handler: AuthHandlerAllowUnregistered, options: AuthOptions & { allowUnregistered: true }): (req: NextRequest, context: RouteContext) => Promise<Response>
export function withUser(handler: AuthHandler, options?: AuthOptions): (req: NextRequest, context: RouteContext) => Promise<Response>
export function withUser(handler: AuthHandler | AuthHandlerAllowUnregistered, options?: AuthOptions) {
  return async (req: NextRequest, context: RouteContext) => {
    let sub: string
    let role: Role | null
    let email: string | null
    try {
      const result = await verifyToken(req)
      sub = result.sub
      role = result.role
      email = result.email
    } catch {
      throw new UnauthorizedError()
    }

    if (!role && !options?.allowUnregistered) {
      throw new UnauthorizedError('User not registered')
    }

    const executor: UserExecutor | null = role ? { type: 'user', user: { id: sub, role } } : null

    if (options?.allowUnregistered) {
      return await (handler as AuthHandlerAllowUnregistered)(req, executor, sub, email, context)
    }

    return await (handler as AuthHandler)(req, executor!, context)
  }
}
