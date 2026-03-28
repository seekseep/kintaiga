import { randomBytes, createHash } from 'crypto'
import { z } from 'zod/v4'
import { and, eq } from 'drizzle-orm'
import { personalAccessTokens, organizationAssignments } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../../types'

const TOKEN_PREFIX = 'kga_'

const CreateUserTokenParametersSchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.iso.datetime({ local: true }).nullable().optional(),
})

export type CreateUserTokenInput = z.input<typeof CreateUserTokenParametersSchema>

export async function createUserToken(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: CreateUserTokenInput,
) {
  const result = CreateUserTokenParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies

  // Verify user is a member of the organization
  const [membership] = await db.select().from(organizationAssignments)
    .where(and(
      eq(organizationAssignments.organizationId, executor.organization.id),
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
    organizationId: executor.organization.id,
    name: parameters.name,
    tokenHash,
    prefix,
    expiresAt: parameters.expiresAt ? new Date(parameters.expiresAt) : null,
  }).returning()

  // Return with raw token (only time it's visible)
  return {
    id: created.id,
    name: created.name,
    prefix: created.prefix,
    token: rawToken,
    expiresAt: created.expiresAt,
    createdAt: created.createdAt,
  }
}
