import { type NextRequest } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { handleError, UnauthorizedError, ForbiddenError } from '@/lib/api-server/errors'

const jwks = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL!}/auth/v1/.well-known/jwks.json`)
)

export type AuthUser = typeof users.$inferSelect

export type RouteContext = { params: Promise<Record<string, string>> }

type AuthHandler = (
  req: NextRequest,
  user: AuthUser,
  context: RouteContext,
) => Promise<Response>

type AuthHandlerAllowUnregistered = (
  req: NextRequest,
  user: AuthUser | null,
  sub: string,
  context: RouteContext,
) => Promise<Response>

interface AuthOptions {
  roles?: Array<'admin' | 'general'>
  allowUnregistered?: boolean
}

async function verifyToken(req: Request): Promise<string> {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new Error('Missing token')
  }
  const token = header.slice(7)
  const { payload } = await jwtVerify(token, jwks)
  if (!payload.sub) {
    throw new Error('Invalid token')
  }
  return payload.sub
}

export function withAuth(handler: AuthHandlerAllowUnregistered, options: AuthOptions & { allowUnregistered: true }): (req: NextRequest, context: RouteContext) => Promise<Response>
export function withAuth(handler: AuthHandler, options?: AuthOptions): (req: NextRequest, context: RouteContext) => Promise<Response>
export function withAuth(handler: AuthHandler | AuthHandlerAllowUnregistered, options?: AuthOptions) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      let sub: string
      try {
        sub = await verifyToken(req)
      } catch {
        throw new UnauthorizedError()
      }

      const user = await db.select().from(users).where(eq(users.id, sub)).then(r => r[0] ?? null)

      if (!user && !options?.allowUnregistered) {
        throw new UnauthorizedError('User not found')
      }

      if (user && options?.roles && !options.roles.includes(user.role)) {
        throw new ForbiddenError()
      }

      if (options?.allowUnregistered) {
        return await (handler as AuthHandlerAllowUnregistered)(req, user, sub, context)
      }

      return await (handler as AuthHandler)(req, user!, context)
    } catch (err) {
      return handleError(err)
    }
  }
}
