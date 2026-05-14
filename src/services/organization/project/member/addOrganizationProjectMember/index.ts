import { z } from 'zod/v4'
import { and, eq } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
import { ValidationError, ForbiddenError, ConflictError } from '@/lib/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import { periodsOverlap } from '@/domain/project/member/period'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

export const AddOrganizationProjectMemberParametersSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  startedAt: z.iso.datetime({ local: true }),
  endedAt: z.iso.datetime({ local: true }).nullable().default(null),
  targetMinutes: z.number().int().min(0).optional(),
})

export type AddOrganizationProjectMemberInput = z.input<typeof AddOrganizationProjectMemberParametersSchema>
export type AddOrganizationProjectMemberParameters = z.output<typeof AddOrganizationProjectMemberParametersSchema>

export async function addOrganizationProjectMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: AddOrganizationProjectMemberInput,
) {
  const result = AddOrganizationProjectMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const startedAt = new Date(parameters.startedAt)
  const endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null

  const existing = await db.select().from(projectAssignments).where(and(
    eq(projectAssignments.projectId, parameters.projectId),
    eq(projectAssignments.userId, parameters.userId),
  ))
  const overlapped = existing.find((row) =>
    periodsOverlap({ startedAt, endedAt }, { startedAt: row.startedAt, endedAt: row.endedAt }),
  )
  if (overlapped) {
    throw new ConflictError('既存の配属期間と重複しています')
  }

  const [created] = await db.insert(projectAssignments).values({
    projectId: parameters.projectId,
    userId: parameters.userId,
    startedAt,
    endedAt,
    targetMinutes: parameters.targetMinutes,
  }).returning()
  return created
}
