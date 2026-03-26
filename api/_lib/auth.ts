import { jwtVerify, createRemoteJWKSet } from 'jose'
import { eq } from 'drizzle-orm'
import { db } from '@api/_lib/db.ts'
import { users } from '@db/schema.ts'
import { handleError, UnauthorizedError, ForbiddenError } from '@api/_lib/errors.ts'

const jwks = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL!}/auth/v1/.well-known/jwks.json`)
)

export type AuthUser = typeof users.$inferSelect

type AuthHandler = (
  req: Request,
  user: AuthUser,
) => Promise<Response>

type AuthHandlerAllowUnregistered = (
  req: Request,
  user: AuthUser | null,
  sub: string,
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

export function withAuth(handler: AuthHandlerAllowUnregistered, options: AuthOptions & { allowUnregistered: true }): (req: Request) => Promise<Response>
export function withAuth(handler: AuthHandler, options?: AuthOptions): (req: Request) => Promise<Response>
export function withAuth(handler: AuthHandler | AuthHandlerAllowUnregistered, options?: AuthOptions) {
  return async (req: Request) => {
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
        return await (handler as AuthHandlerAllowUnregistered)(req, user, sub)
      }

      return await (handler as AuthHandler)(req, user!)
    } catch (err) {
      return handleError(err)
    }
  }
}
