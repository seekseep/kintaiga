import { randomBytes, createHash } from 'crypto'
import { z } from 'zod/v4'
import { and, eq } from 'drizzle-orm'
import { personalAccessTokens, organizationAssignments, organizations } from '@db/schema'
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, UserExecutor } from '../../types'

const TOKEN_PREFIX = 'kga_'

const CreateMyTokenParametersSchema = z.object({
  name: z.string().min(1).max(255),
  organizationName: z.string().min(1),
  expiresAt: z.iso.datetime({ local: true }).nullable().optional(),
})

export type CreateMyTokenInput = z.input<typeof CreateMyTokenParametersSchema>

export async function createMyToken(
  dependencies: { db: DbOrTx },
  executor: UserExecutor,
  input: CreateMyTokenInput,
) {
  const result = CreateMyTokenParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  // Resolve organization by name
  const [org] = await db.select().from(organizations)
    .where(eq(organizations.name, parameters.organizationName))
    .limit(1)

  if (!org) throw new NotFoundError('Organization not found')

  // Verify user is a member of the organization
  const [membership] = await db.select().from(organizationAssignments)
    .where(and(
      eq(organizationAssignments.organizationId, org.id),
      eq(organizationAssignments.userId, executor.user.id),
    ))
    .limit(1)

  if (!membership && executor.user.role !== 'admin') {
    throw new ForbiddenError('Not a member of this organization')
  }

  // Generate token
  const rawToken = TOKEN_PREFIX + randomBytes(20).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const prefix = rawToken.slice(0, 8)

  const [created] = await db.insert(personalAccessTokens).values({
    userId: executor.user.id,
    organizationId: org.id,
    name: parameters.name,
    tokenHash,
    prefix,
    expiresAt: parameters.expiresAt ? new Date(parameters.expiresAt) : null,
  }).returning()

  return {
    id: created.id,
    name: created.name,
    prefix: created.prefix,
    token: rawToken,
    organizationName: org.name,
    organizationDisplayName: org.displayName,
    expiresAt: created.expiresAt,
    createdAt: created.createdAt,
  }
}
