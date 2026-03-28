import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const RemoveOrganizationProjectMemberParametersSchema = z.object({
  id: z.string(),
})

export type RemoveOrganizationProjectMemberInput = z.input<typeof RemoveOrganizationProjectMemberParametersSchema>
export type RemoveOrganizationProjectMemberParameters = z.output<typeof RemoveOrganizationProjectMemberParametersSchema>

export async function removeOrganizationProjectMember(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: RemoveOrganizationProjectMemberInput,
) {
  const result = RemoveOrganizationProjectMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const [deleted] = await db.delete(projectAssignments).where(eq(projectAssignments.id, parameters.id)).returning()
  if (!deleted) throw new NotFoundError()
  return deleted
}
