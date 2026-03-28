import { z } from 'zod/v4'
import { projectAssignments } from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
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
  const endedAt = parameters.endedAt ? new Date(parameters.endedAt) : null

  const [created] = await db.insert(projectAssignments).values({
    projectId: parameters.projectId,
    userId: parameters.userId,
    startedAt: new Date(parameters.startedAt),
    endedAt,
    targetMinutes: parameters.targetMinutes,
  }).returning()
  return created
}
