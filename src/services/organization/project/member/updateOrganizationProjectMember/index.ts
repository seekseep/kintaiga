import { z } from 'zod/v4'
import { and, eq, ne } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import { periodsOverlap } from '@/domain/project/member/period'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

export const UpdateOrganizationProjectMemberParametersSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  targetMinutes: z.number().int().min(0).nullable().optional(),
})

export type UpdateOrganizationProjectMemberInput = z.input<typeof UpdateOrganizationProjectMemberParametersSchema>
export type UpdateOrganizationProjectMemberParameters = z.output<typeof UpdateOrganizationProjectMemberParametersSchema>

export async function updateOrganizationProjectMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationProjectMemberInput,
) {
  const result = UpdateOrganizationProjectMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies

  const [current] = await db.select().from(projectAssignments).where(eq(projectAssignments.id, parameters.id))
  if (!current) throw new NotFoundError()

  const nextStartedAt = parameters.startedAt !== undefined
    ? new Date(parameters.startedAt)
    : current.startedAt
  const nextEndedAt = parameters.endedAt !== undefined
    ? (parameters.endedAt ? new Date(parameters.endedAt) : null)
    : current.endedAt

  if (parameters.startedAt !== undefined || parameters.endedAt !== undefined) {
    const siblings = await db.select().from(projectAssignments).where(and(
      eq(projectAssignments.projectId, current.projectId),
      eq(projectAssignments.userId, current.userId),
      ne(projectAssignments.id, current.id),
    ))
    const overlapped = siblings.find((row) =>
      periodsOverlap(
        { startedAt: nextStartedAt, endedAt: nextEndedAt },
        { startedAt: row.startedAt, endedAt: row.endedAt },
      ),
    )
    if (overlapped) {
      throw new ConflictError('既存の配属期間と重複しています')
    }
  }

  const values: Record<string, unknown> = {}
  if (parameters.startedAt !== undefined) {
    values.startedAt = nextStartedAt
  }
  if (parameters.endedAt !== undefined) {
    values.endedAt = nextEndedAt
  }
  if (parameters.targetMinutes !== undefined) {
    values.targetMinutes = parameters.targetMinutes
  }
  const [updated] = await db.update(projectAssignments).set(values).where(eq(projectAssignments.id, parameters.id)).returning()
  if (!updated) throw new NotFoundError()
  return updated
}
