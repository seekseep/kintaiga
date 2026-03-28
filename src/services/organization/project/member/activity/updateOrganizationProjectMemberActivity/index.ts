import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectActivities } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canControlActivityInOrganization } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../../types'

export const UpdateOrganizationProjectMemberActivityParametersSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})

export type UpdateOrganizationProjectMemberActivityInput = z.input<typeof UpdateOrganizationProjectMemberActivityParametersSchema>
export type UpdateOrganizationProjectMemberActivityParameters = z.output<typeof UpdateOrganizationProjectMemberActivityParametersSchema>

export async function updateOrganizationProjectMemberActivity(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: UpdateOrganizationProjectMemberActivityInput,
) {
  const result = UpdateOrganizationProjectMemberActivityParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const activityRows = await db.select().from(projectActivities).where(eq(projectActivities.id, parameters.id))
  const activity = activityRows[0]
  if (!activity) throw new NotFoundError()
  if (!canControlActivityInOrganization(executor, activity)) throw new ForbiddenError()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (parameters.startedAt !== undefined) updates.startedAt = new Date(parameters.startedAt)
  if (parameters.endedAt !== undefined) updates.endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null
  if (parameters.note !== undefined) updates.note = parameters.note

  const [updated] = await db.update(projectActivities).set(updates).where(eq(projectActivities.id, parameters.id)).returning()
  return updated
}
